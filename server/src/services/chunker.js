// Sizes are in characters. ~1000 characters is roughly 150-200 words,
// which is small enough to be specific and large enough to keep context.
const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_OVERLAP = 150;

// Splits one oversized paragraph on sentence boundaries.
function splitLongText(text, size) {
  const sentences = text.match(/[^.!?\n]+[.!?]*\s*/g) ?? [text];
  const pieces = [];
  let current = "";

  for (const sentence of sentences) {
    // A single sentence longer than the limit: hard split as a last resort.
    if (sentence.length > size) {
      if (current) pieces.push(current);
      current = "";
      for (let i = 0; i < sentence.length; i += size) {
        pieces.push(sentence.slice(i, i + size));
      }
      continue;
    }

    if ((current + sentence).length > size) {
      pieces.push(current);
      current = sentence;
    } else {
      current += sentence;
    }
  }

  if (current) pieces.push(current);
  return pieces.map((p) => p.trim()).filter(Boolean);
}

export function chunkText(
  text,
  { chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP } = {},
) {
  // Normalise whitespace so chunks don't waste space on blank lines.
  const cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleaned) return [];

  // 1. Break into paragraphs, splitting any that are too long.
  const pieces = cleaned
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap((p) => (p.length > chunkSize ? splitLongText(p, chunkSize) : [p]));

  // 2. Pack pieces together until a chunk is full.
  const chunks = [];
  let current = "";

  for (const piece of pieces) {
    const candidate = current ? `${current}\n\n${piece}` : piece;

    if (candidate.length <= chunkSize) {
      current = candidate;
    } else {
      if (current) chunks.push(current);
      current = piece;
    }
  }

  if (current) chunks.push(current);

  // 3. Prepend the tail of the previous chunk, so an idea that straddles
  //    a boundary still appears whole in at least one chunk.
  return chunks.map((chunk, i) => {
    if (i === 0 || overlap === 0) return chunk;

    const tail = chunks[i - 1].slice(-overlap);
    const firstSpace = tail.indexOf(" ");
    const wholeWords = firstSpace === -1 ? tail : tail.slice(firstSpace + 1);

    return `${wholeWords}\n\n${chunk}`;
  });
}
