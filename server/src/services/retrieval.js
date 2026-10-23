import supabaseAdmin from "../config/supabaseServer.js";
import { embedQuery } from "./embedder.js";

const MATCH_COUNT = 5;

// Matches below this similarity are treated as unrelated and dropped.
// Tune it using the scores printed in your server log.
const MIN_SIMILARITY = 0.55;

// Finds the chunks in one room that best match a question.
// The caller must have already verified the user owns the room.
export async function retrieveContext({ roomId, question }) {
  const queryEmbedding = await embedQuery(question);

  const { data, error } = await supabaseAdmin.rpc("match_document_chunks", {
    query_embedding: queryEmbedding,
    match_room_id: roomId,
    match_count: MATCH_COUNT,
  });

  if (error) throw error;

  console.log(
    "Retrieval scores:",
    data.map((m) => m.similarity.toFixed(3)).join(", ") || "(no matches)",
  );

  const matches = data.filter((m) => m.similarity >= MIN_SIMILARITY);
  if (matches.length === 0) return [];

  const documentIds = [...new Set(matches.map((m) => m.document_id))];

  const { data: documents, error: documentsError } = await supabaseAdmin
    .from("documents")
    .select("id, name")
    .in("id", documentIds);

  if (documentsError) throw documentsError;

  const nameById = new Map(documents.map((d) => [d.id, d.name]));

  return matches.map((m) => ({
    content: m.content,
    documentName: nameById.get(m.document_id) ?? "Unknown file",
  }));
}
