import ai from "../config/gemini.js";

export const chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;

    // Validate the incoming request
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

    // Send the user's question to Gemini
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
      contents: message.trim(),
      config: {
        systemInstruction: `
          You are the AI Study Assistant, an educational assistant
          designed to help students learn effectively.

          Explain difficult concepts clearly and step by step.
          Use examples when they help understanding.
          Help students reason through problems instead of
          simply giving answers when teaching would be more useful.
          Use headings and lists when appropriate.
          If a question is ambiguous, ask for clarification.
        `,
      },
    });

    const reply = response.text;

    if (!reply) {
      return res.status(502).json({
        error: "Gemini returned an empty response. Please try again.",
      });
    }

    // Send the response back to React
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Gemini API error:", error);

    return res.status(500).json({
      error: "Unable to generate a response. Please try again.",
    });
  }
};
