import ai from "../config/gemini.js";

export const chatWithGemini = async (req, res) => {
  try {
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

    console.log("Received history:", JSON.stringify(history, null, 2));
    // Convert frontend message roles to Gemini roles.
    const geminiHistory = history.map((item) => {
      if (
        !["user", "assistant"].includes(item.role) ||
        typeof item.content !== "string"
      ) {
        throw new Error("Invalid history message.");
      }

      return {
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content }],
      };
    });

    const chat = ai.chats.create({
      model: process.env.GEMINI_MODEL,
      history: geminiHistory,
      config: {
        systemInstruction: `
          You are an AI Study Assistant.
          Explain concepts clearly and step by step.
          Use examples when helpful.
          Help students understand the reasoning behind answers.
        `,
      },
    });

    const response = await chat.sendMessage({
      message: message.trim(),
    });

    if (!response.text) {
      return res.status(502).json({
        error: "Gemini returned an empty response.",
      });
    }

    return res.status(200).json({
      reply: response.text,
    });
  } catch (error) {
    console.error("Gemini API error:", error);

    return res.status(500).json({
      error: "Unable to generate a response. Please try again.",
    });
  }
};
