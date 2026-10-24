import supabaseAdmin from "../config/supabaseServer.js";
import { embeddings } from "./embedder.js";

const MATCH_COUNT = 5;
const MIN_SIMILARITY = 0.55;

/**
 * Retrieve relevant chunks from a study room.
 * The calling controller must verify room ownership first.
 */
export async function retrieveContext({ roomId, question }) {
  // 1. Embed the query using Gemini's retrieval-query task.
  const queryEmbedding = await embeddings.embedQuery(question);

  // 2. Search Supabase pgvector using the existing RPC.
  const { data, error } = await supabaseAdmin.rpc("match_document_chunks", {
    query_embedding: queryEmbedding,
    match_room_id: roomId,
    match_count: MATCH_COUNT,
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
  const documentIds = [
    ...new Set(matchesWithScores.map((match) => match.document_id)),
  ];

  const { data: documents, error: documentsError } = await supabaseAdmin
    .from("documents")
    .select("id, name")
    .in("id", documentIds);

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
