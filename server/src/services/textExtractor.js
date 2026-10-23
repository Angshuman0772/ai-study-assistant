import mammoth from "mammoth";
import JSZip from "jszip";
import { extractText as extractPdfText, getDocumentProxy } from "unpdf";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const PPTX_MIME =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";

// --- PPTX helpers -----------------------------------------------------------

function decodeXml(text) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&amp;/g, "&"); // must be last
}

// Slide order comes from presentation.xml, not from file names, because
// reordering slides in PowerPoint doesn't rename slideN.xml files.
async function getSlidePathsInOrder(zip) {
  const presentationXml = await zip
    .file("ppt/presentation.xml")
    ?.async("string");
  const relsXml = await zip
    .file("ppt/_rels/presentation.xml.rels")
    ?.async("string");

  if (presentationXml && relsXml) {
    const targetById = new Map();

    for (const tag of relsXml.match(/<Relationship\s[^>]*>/g) ?? []) {
      const id = tag.match(/\sId="([^"]*)"/)?.[1];
      const target = tag.match(/\sTarget="([^"]*)"/)?.[1];
      if (id && target) targetById.set(id, target);
    }

    const ordered = [
      ...presentationXml.matchAll(/<p:sldId\s[^>]*r:id="([^"]+)"/g),
    ]
      .map((match) => targetById.get(match[1]))
      .filter(Boolean)
      .map((target) =>
        target.startsWith("/") ? target.slice(1) : `ppt/${target}`,
      );

    if (ordered.length > 0) return ordered;
  }

  // Fallback: sort by the number in the file name.
  const slideNumber = (path) => Number(path.match(/(\d+)\.xml$/)[1]);

  return Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => slideNumber(a) - slideNumber(b));
}

// Each <a:p> is a paragraph; its text lives in <a:t> runs.
function extractSlideText(xml) {
  const paragraphs = xml.match(/<a:p[ >][\s\S]*?<\/a:p>/g) ?? [];

  return paragraphs
    .map((paragraph) =>
      [...paragraph.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)]
        .map((run) => decodeXml(run[1]))
        .join(""),
    )
    .filter((line) => line.trim())
    .join("\n");
}

async function extractPptxText(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const slidePaths = await getSlidePathsInOrder(zip);
  const slides = [];

  for (const [index, path] of slidePaths.entries()) {
    const xml = await zip.file(path)?.async("string");
    if (!xml) continue;

    const text = extractSlideText(xml);
    if (text) slides.push(`Slide ${index + 1}\n${text}`);
  }

  return slides.join("\n\n");
}

// --- Main entry point -------------------------------------------------------

// Turns a file's raw bytes into plain text, based on its MIME type.
export async function extractText({ buffer, mimeType }) {
  switch (mimeType) {
    case "application/pdf": {
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractPdfText(pdf, { mergePages: true });
      return text;
    }

    case DOCX_MIME: {
      const { value } = await mammoth.extractRawText({ buffer });
      return value;
    }

    case PPTX_MIME:
      return extractPptxText(buffer);

    case "text/plain":
    case "text/markdown":
      return buffer.toString("utf-8");

    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
