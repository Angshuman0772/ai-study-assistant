import supabaseAdmin from "../config/supabaseServer.js";
import { embeddings } from "./embedder.js";
import { loadDocumentAsMarkdown, splitDocuments } from "./documentPipeline.js";

const BUCKET = "study-files";
const INSERT_BATCH_SIZE = 100;

async function setStatus(documentId, status) {
  const { error } = await supabaseAdmin
    .from("documents")
    .update({ status })
    .eq("id", documentId);

  if (error) {
    console.error(`Could not set status "${status}":`, error.message);
  }
}

/**
 * Download -> parse -> Markdown -> split -> embed -> store.
 */
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

    // Step 1: extract text and create Markdown-backed Documents.
    const loadedDocuments = await loadDocumentAsMarkdown({
      buffer,
      mimeType: doc.mime_type,
      fileName: doc.name,
    });

    // Step 2: split Documents using LangChain.
    const chunks = await splitDocuments(loadedDocuments, {
      documentId: doc.id,
      roomId: doc.room_id,
      userId: doc.user_id,
    });

    if (chunks.length === 0) {
      const error = new Error("No readable text found in this file.");
      error.expose = true;
      throw error;
    }

    // Step 3: embed all chunk contents.
    const vectors = await embeddings.embedDocuments(
      chunks.map((chunk) => chunk.pageContent),
    );

    // Step 4: remove previous chunks only after parsing and
    // embedding have succeeded.
    const { error: deleteError } = await supabaseAdmin
      .from("document_chunks")
      .delete()
      .eq("document_id", doc.id);

    if (deleteError) throw deleteError;

    // Step 5: preserve the current database schema.
    const rows = chunks.map((chunk, index) => ({
      document_id: doc.id,
      room_id: doc.room_id,
      user_id: doc.user_id,
      chunk_index: index,
      content: chunk.pageContent,
      embedding: vectors[index],
    }));

    for (let i = 0; i < rows.length; i += INSERT_BATCH_SIZE) {
      const { error: insertError } = await supabaseAdmin
        .from("document_chunks")
        .insert(rows.slice(i, i + INSERT_BATCH_SIZE));

      if (insertError) throw insertError;
    }

    await setStatus(doc.id, "ready");

    return {
      chunkCount: chunks.length,
    };
  } catch (error) {
    await setStatus(doc.id, "failed");
    throw error;
  }
}
