import supabaseAdmin from "../config/supabaseServer.js";
import { extractText } from "./textExtractor.js";
import { chunkText } from "./chunker.js";
import { embedTexts } from "./embedder.js";

const BUCKET = "study-files";
const INSERT_BATCH_SIZE = 100;

async function setStatus(documentId, status) {
  const { error } = await supabaseAdmin
    .from("documents")
    .update({ status })
    .eq("id", documentId);

  if (error) console.error(`Could not set status "${status}":`, error.message);
}

// Download -> extract -> chunk -> embed -> store. Marks the document
// "ready" only after every chunk is saved, or "failed" if anything breaks.
export async function processDocument(documentId) {
  const { data: doc, error: docError } = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (docError) throw docError;

  await setStatus(doc.id, "processing");

  try {
    const { data: blob, error: downloadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .download(doc.storage_path);

    if (downloadError) throw downloadError;

    const buffer = Buffer.from(await blob.arrayBuffer());
    const text = await extractText({ buffer, mimeType: doc.mime_type });
    const chunks = chunkText(text);

    if (chunks.length === 0) {
      const emptyError = new Error("No readable text found in this file.");
      emptyError.expose = true; // safe to show to the user
      throw emptyError;
    }

    const embeddings = await embedTexts(chunks, "RETRIEVAL_DOCUMENT");

    // Clear chunks from any earlier attempt so re-processing is safe.
    const { error: deleteError } = await supabaseAdmin
      .from("document_chunks")
      .delete()
      .eq("document_id", doc.id);

    if (deleteError) throw deleteError;

    const rows = chunks.map((content, index) => ({
      document_id: doc.id,
      room_id: doc.room_id,
      user_id: doc.user_id,
      chunk_index: index,
      content,
      embedding: embeddings[index],
    }));

    for (let i = 0; i < rows.length; i += INSERT_BATCH_SIZE) {
      const { error: insertError } = await supabaseAdmin
        .from("document_chunks")
        .insert(rows.slice(i, i + INSERT_BATCH_SIZE));

      if (insertError) throw insertError;
    }

    await setStatus(doc.id, "ready");
    return { chunkCount: chunks.length };
  } catch (err) {
    await setStatus(doc.id, "failed");
    throw err;
  }
}
