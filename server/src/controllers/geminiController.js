import ai from "../config/gemini.js";

const SYSTEM_INSTRUCTION = `
  You are an AI Study Assistant.
  Explain concepts clearly and step by step.
  Use examples when helpful.
  Help students understand the reasoning behind answers.
`;

function isRetryableError(error) {
  const details = [
    error?.status,
    error?.code,
    error?.message,
    error?.error?.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();

  return (
    /\b503\b/.test(details) ||
    /\b429\b/.test(details) ||
    /\b500\b/.test(details) ||
    /\b502\b/.test(details) ||
    /\b504\b/.test(details) ||
    details.includes("UNAVAILABLE") ||
    details.includes("RESOURCE_EXHAUSTED") ||
    details.includes("INTERNAL")
  );
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetry({ model, history, message, retries = 2 }) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const chat = ai.chats.create({
        model,
        history,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      const response = await chat.sendMessage({ message });

      if (!response.text) {
        throw new Error("Gemini returned an empty response.");
      }

      return response.text;
    } catch (error) {
      if (!isRetryableError(error) || attempt === retries) {
        throw error;
      }

      // Exponential backoff with jitter.
      const delay = 700 * 2 ** attempt + Math.random() * 300;

      console.warn(
        `Model ${model} failed. Retry ${attempt + 1}/${retries} ` +
          `in ${Math.round(delay)}ms.`,
      );

      await sleep(delay);
    }
  }
}

export const chatWithGemini = async (req, res) => {
  const { message, history = [] } = req.body;

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      error: "Please provide a valid message.",
    });
  }

  if (message.length > 10000) {
    return res.status(400).json({
      error: "Message must be 10,000 characters or fewer.",
    });
  }

  if (!Array.isArray(history) || history.length > 40) {
    return res.status(400).json({
      error: "Invalid conversation history.",
    });
  }

  let geminiHistory;

  try {
    geminiHistory = history.map((item) => {
      if (
        !["user", "model"].includes(item.role) ||
        typeof item.content !== "string" ||
        !item.content.trim()
      ) {
        throw new Error("Invalid history message.");
      }

      return {
        role: item.role,
        parts: [{ text: item.content }],
      };
    });
  } catch (error) {
    return res.status(400).json({
      error: "Conversation history contains an invalid message.",
    });
  }

  const primaryModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  const fallbackModel =
    process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite";

  try {
    let reply;

    try {
      reply = await generateWithRetry({
        model: primaryModel,
        history: geminiHistory,
        message: message.trim(),
        retries: 2,
      });
    } catch (primaryError) {
      if (!isRetryableError(primaryError) || fallbackModel === primaryModel) {
        throw primaryError;
      }

      console.warn(
        `Primary model ${primaryModel} unavailable. ` +
          `Trying fallback ${fallbackModel}.`,
      );

      reply = await generateWithRetry({
        model: fallbackModel,
        history: geminiHistory,
        message: message.trim(),
        retries: 1,
      });
    }

    return res.status(200).json({
      reply,
    });
  } catch (error) {
    console.error("Gemini generation failed:", {
      status: error?.status,
      code: error?.code,
      message: error?.message,
    });

    const temporarilyUnavailable = isRetryableError(error);

    return res.status(temporarilyUnavailable ? 503 : 502).json({
      error: temporarilyUnavailable
        ? "The AI service is temporarily busy. Please try again shortly."
        : "The AI could not generate a response. Please try again.",
      retryable: temporarilyUnavailable,
    });
  }
};
