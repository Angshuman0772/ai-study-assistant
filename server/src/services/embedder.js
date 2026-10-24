import ai from "../config/gemini.js";
import { Embeddings } from "@langchain/core/embeddings";

export const EMBEDDING_MODEL = "gemini-embedding-001";

// Must match the existing Supabase vector(768) schema.
export const EMBEDDING_DIMENSIONS = 768;

const BATCH_SIZE = 50;

export class GeminiRetrievalEmbeddings extends Embeddings {
  constructor() {
    super({});
  }

  async embedDocuments(texts) {
    return embedTexts(texts, "RETRIEVAL_DOCUMENT");
  }

  async embedQuery(text) {
    const [vector] = await embedTexts([text], "RETRIEVAL_QUERY");

    return vector;
  }
}

export const embeddings = new GeminiRetrievalEmbeddings();

export async function embedTexts(texts, taskType = "RETRIEVAL_DOCUMENT") {
  const vectors = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: batch,
      config: {
        taskType,
        outputDimensionality: EMBEDDING_DIMENSIONS,
      },
    });

    const values = response.embeddings?.map((embedding) => embedding.values);

    if (!values || values.length !== batch.length) {
      throw new Error("Embedding response did not match the number of inputs.");
    }

    vectors.push(...values);
  }

  for (const vector of vectors) {
    if (vector.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Expected ${EMBEDDING_DIMENSIONS} dimensions, ` +
          `got ${vector.length}.`,
      );
    }
  }

  return vectors;
}

// Optional compatibility helper for any existing callers.
export async function embedQuery(text) {
  return embeddings.embedQuery(text);
}
