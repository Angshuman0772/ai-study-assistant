import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const MIME_TYPES = {
  PDF: "application/pdf",
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  PPTX: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  TXT: "text/plain",
  MARKDOWN: "text/markdown",
};

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 150,
  separators: ["\n## ", "\n### ", "\n\n", "\n", ". ", " ", ""],
  keepSeparator: true,
});

function normalizeText(text) {
  return String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function addMarkdownStructure(documents, fileName, mimeType) {
  return documents
    .map((doc, index) => {
      const content = normalizeText(doc.pageContent);

      if (!content) return null;

      // Markdown already has its own headings and formatting.
      if (mimeType === MIME_TYPES.MARKDOWN) {
        return new Document({
          pageContent: content,
          metadata: {
            ...doc.metadata,
            source: fileName,
            format: "markdown",
          },
        });
      }

      let heading = `# ${fileName}`;

      // PDFLoader can return individual page documents.
      if (mimeType === MIME_TYPES.PDF) {
        const pageNumber =
          doc.metadata?.loc?.pageNumber ??
          doc.metadata?.pageNumber ??
          index + 1;

        heading = `## Page ${pageNumber}`;
      }

      // Preserve slide markers if PPTXLoader supplies them.
      if (mimeType === MIME_TYPES.PPTX) {
        heading = `## Presentation content`;
      }

      const markdown =
        mimeType === MIME_TYPES.TXT
          ? `# ${fileName}\n\n${content}`
          : `${heading}\n\n${content}`;

      return new Document({
        pageContent: markdown,
        metadata: {
          ...doc.metadata,
          source: fileName,
          mimeType,
          format: "markdown",
        },
      });
    })
    .filter(Boolean);
}

export async function loadDocumentAsMarkdown({ buffer, mimeType, fileName }) {
  const blob = new Blob([buffer], { type: mimeType });
  let loader;
  let loadedDocuments;

  switch (mimeType) {
    case MIME_TYPES.PDF:
      loader = new PDFLoader(blob);
      break;

    case MIME_TYPES.DOCX:
      loader = new DocxLoader(blob);
      break;

    case MIME_TYPES.PPTX:
      loader = new PPTXLoader(blob);
      break;

    case MIME_TYPES.TXT:
    case MIME_TYPES.MARKDOWN: {
      // Plain text and Markdown require no binary document parser.
      const content = await blob.text();

      loadedDocuments = [
        new Document({
          pageContent: content,
          metadata: { source: fileName },
        }),
      ];
      break;
    }

    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }

  if (!loadedDocuments) {
    loadedDocuments = await loader.load();
  }

  return addMarkdownStructure(loadedDocuments, fileName, mimeType);
}

export async function splitDocuments(documents, metadata = {}) {
  const enrichedDocuments = documents.map(
    (doc) =>
      new Document({
        pageContent: doc.pageContent,
        metadata: {
          ...doc.metadata,
          ...metadata,
        },
      }),
  );

  return splitter.splitDocuments(enrichedDocuments);
}
