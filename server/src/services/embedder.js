import ai from "../config/gemini.js";

export const EMBEDDING_MODEL = "gemini-embedding-001";

// Must match vector(768) in the Supabase table and function.
export const EMBEDDING_DIMENSIONS = 768;

const BATCH_SIZE = 50;

// Turns an array of strings into an array of vectors (one per string).
// Use taskType "RETRIEVAL_DOCUMENT" for stored text and "RETRIEVAL_QUERY"
// for questions. Gemini tunes the vectors differently for each.
export async function embedTexts(texts, taskType = "RETRIEVAL_DOCUMENT") {
  const vectors = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: batch,
      config: { taskType, outputDimensionality: EMBEDDING_DIMENSIONS },
    });

    const values = response.embeddings?.map((e) => e.values);

    if (!values || values.length !== batch.length) {
      throw new Error("Embedding response did not match the number of inputs.");
    }

    vectors.push(...values);
  }

  for (const vector of vectors) {
    if (vector.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${vector.length}.`,
      );
    }
  }

  return vectors;
}

// Embeds a single question for searching (used in Phase 4).
export async function embedQuery(text) {
  const [vector] = await embedTexts([text], "RETRIEVAL_QUERY");
  return vector;
}
