export const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

// Turns Tiptap JSON into a short plain-text preview.
export function getPreview(content) {
  if (!content) return "";

  if (typeof content === "string") {
    return content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const walk = (node) => node.text ?? (node.content ?? []).map(walk).join(" ");

  return walk(content).replace(/\s+/g, " ").trim();
}
