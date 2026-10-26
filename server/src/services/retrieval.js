import supabaseAdmin from "../config/supabaseServer.js";
import { embeddings } from "./embedder.js";

const MATCH_COUNT = 5;
const MIN_SIMILARITY = 0.55;

/**
 * Retrieve relevant chunks from a study room.
 * The calling controller must verify room ownership first.
 */
export async function retrieveContext({ roomId, question, documentIds }) {
  // Nothing selected means no file context, so skip the embedding call.
  if (!Array.isArray(documentIds) || documentIds.length === 0) return [];

  const queryEmbedding = await embeddings.embedQuery(question);

  const { data, error } = await supabaseAdmin.rpc("match_document_chunks", {
    query_embedding: queryEmbedding,
    match_room_id: roomId,
    match_count: MATCH_COUNT,
    filter_document_ids: documentIds,
  });

  if (error) throw error;

  const matchesWithScores = (data ?? []).filter(
    (match) => Number(match.similarity) >= MIN_SIMILARITY,
  );

  console.log(
    "Retrieval scores:",
    (data ?? [])
      .map((match) => Number(match.similarity).toFixed(3))
      .join(", ") || "(no matches)",
  );

  if (matchesWithScores.length === 0) return [];

  // 3. Resolve document names for source attribution.
  const matchedDocumentIds = [
    ...new Set(matchesWithScores.map((match) => match.document_id)),
  ];

  const { data: documents, error: documentsError } = await supabaseAdmin
    .from("documents")
    .select("id, name")
    .in("id", matchedDocumentIds);

  if (documentsError) throw documentsError;

  const nameById = new Map(
    documents.map((document) => [document.id, document.name]),
  );

  return matchesWithScores.map((match) => ({
    content: match.content,
    documentName: nameById.get(match.document_id) ?? "Unknown file",
    documentId: match.document_id,
    similarity: Number(match.similarity),
  }));
}
