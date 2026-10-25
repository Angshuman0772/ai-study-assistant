import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { extractText, getDocumentProxy } from "unpdf";
import { OfficeParser } from "officeparser";

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

      if (mimeType === MIME_TYPES.PDF) {
        const pageNumber =
          doc.metadata?.loc?.pageNumber ??
          doc.metadata?.pageNumber ??
          index + 1;

        heading = `## Page ${pageNumber}`;
      }

      if (mimeType === MIME_TYPES.PPTX) {
        heading = "## Presentation content";
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

async function loadPdfDocuments(buffer) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text, totalPages } = await extractText(pdf, {
    mergePages: false,
  });

  if (!Array.isArray(text)) {
    throw new Error("PDF parser did not return page-level text.");
  }

  return text.map(
    (pageContent, index) =>
      new Document({
        pageContent,
        metadata: {
          loc: { pageNumber: index + 1 },
          totalPages,
        },
      }),
  );
}

async function loadOfficeDocuments(buffer, mimeType) {
  const ast = await OfficeParser.parseOffice(new Uint8Array(buffer), {
    extractAttachments: false,
  });

  const { value } = await ast.to("text");
  const content = normalizeText(value);

  if (!content) return [];

  return [
    new Document({
      pageContent: content,
      metadata: {
        source: undefined,
        mimeType,
      },
    }),
  ];
}

export async function loadDocumentAsMarkdown({ buffer, mimeType, fileName }) {
  let loadedDocuments;

  switch (mimeType) {
    case MIME_TYPES.PDF:
      loadedDocuments = await loadPdfDocuments(buffer);
      break;

    case MIME_TYPES.DOCX:
    case MIME_TYPES.PPTX:
      loadedDocuments = await loadOfficeDocuments(buffer, mimeType);
      break;

    case MIME_TYPES.TXT:
    case MIME_TYPES.MARKDOWN:
      loadedDocuments = [
        new Document({
          pageContent: buffer.toString("utf8"),
          metadata: { source: fileName },
        }),
      ];
      break;

    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
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
