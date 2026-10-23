import path from "path";
import { Router } from "express";
import multer from "multer";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";
import { MAX_FILES_PER_ROOM, MAX_TOTAL_CHARS } from "../config/limits.js";
import supabase from "../config/supabase.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = Router();

// Keep these in sync with the limits in FilesPanel.jsx
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file
const MAX_FILES_PER_UPLOAD = 5;
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isUuid = (value) => typeof value === "string" && UUID_PATTERN.test(value);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_UPLOAD,
  },
});

// This client bypasses RLS, so every query must filter by the user itself.
async function userOwnsRoom(roomId, userId) {
  const { data, error } = await supabase
    .from("study_rooms")
    .select("id")
    .eq("id", roomId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
}

async function extractText(file) {
  const extension = path.extname(file.originalname).toLowerCase();

  // TXT and Markdown are already plain text.
  if (extension === ".txt" || extension === ".md") {
    return file.buffer.toString("utf-8");
  }

  // PDF: extract text page by page.
  if (extension === ".pdf") {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(file.buffer),
    });

    try {
      // Awaiting inside the try means a corrupt or encrypted PDF
      // still reaches the finally block and is cleaned up.
      const pdfDocument = await loadingTask.promise;
      const pages = [];

      for (
        let pageNumber = 1;
        pageNumber <= pdfDocument.numPages;
        pageNumber++
      ) {
        const page = await pdfDocument.getPage(pageNumber);
        const content = await page.getTextContent();

        // hasEOL marks the end of a line, which keeps paragraphs and
        // lists readable instead of one long run of words.
        pages.push(
          content.items
            .map((item) =>
              "str" in item ? item.str + (item.hasEOL ? "\n" : " ") : "",
            )
            .join(""),
        );
      }

      return pages.join("\n\n");
    } finally {
      await loadingTask.destroy();
    }
  }

  // Word DOCX files.
  if (extension === ".docx") {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    return result.value;
  }

  throw new Error("Unsupported file type.");
}

// List the files saved for a room.
router.get("/", authenticateUser, async (req, res) => {
  try {
    const { roomId } = req.query;
    const userId = req.user.id;

    if (!isUuid(roomId)) {
      return res.status(400).json({
        error: "A valid study room ID is required.",
      });
    }

    if (!(await userOwnsRoom(roomId, userId))) {
      return res.status(404).json({
        error: "Study room not found or access denied.",
      });
    }

    // NOTE: this returns the full extracted text because the chat currently
    // receives file text from the client. Once the chat looks files up by ID
    // on the server, return metadata only (drop extracted_text).
    const { data: documents, error: documentsError } = await supabase
      .from("uploaded_documents")
      .select("id, name, size, mime_type, extracted_text, created_at")
      .eq("room_id", roomId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (documentsError) throw documentsError;

    return res.status(200).json({
      files: documents.map((document) => ({
        id: document.id,
        name: document.name,
        size: document.size,
        mimeType: document.mime_type,
        createdAt: document.created_at,
        text: document.extracted_text,
      })),
    });
  } catch (error) {
    console.error("Failed to retrieve uploaded documents:", error);

    return res.status(500).json({
      error: "Failed to retrieve uploaded documents.",
    });
  }
});

// Upload files, extract their text, and save them.
router.post(
  "/upload",
  authenticateUser,
  upload.array("files", MAX_FILES_PER_UPLOAD),
  async (req, res) => {
    const files = req.files ?? [];
    const { roomId } = req.body;
    const userId = req.user.id;

    if (!isUuid(roomId)) {
      return res.status(400).json({
        error: "A valid study room ID is required.",
      });
    }

    if (files.length === 0) {
      return res.status(400).json({
        error: "Please upload at least one file.",
      });
    }

    try {
      if (!(await userOwnsRoom(roomId, userId))) {
        return res.status(404).json({
          error: "Study room not found or access denied.",
        });
      }

      // Promise.all keeps results in the same order as `files`.
      // The frontend relies on that to match each result to its file.
      // Current usage in this room
      const { data: existing, error: existingError } = await supabase
        .from("uploaded_documents")
        .select("char_count")
        .eq("room_id", roomId)
        .eq("user_id", userId);

      if (existingError) throw existingError;

      let slotsLeft = MAX_FILES_PER_ROOM - existing.length;
      let charsLeft =
        MAX_TOTAL_CHARS - existing.reduce((sum, d) => sum + d.char_count, 0);

      const results = [];

      // Sequential on purpose. Every path below must push exactly one result,
      // so results stay in the same order as `files`.
      for (const file of files) {
        try {
          const extension = path.extname(file.originalname).toLowerCase();

          if (!ALLOWED_EXTENSIONS.includes(extension)) {
            results.push({
              name: file.originalname,
              error: "Unsupported file type. Use PDF, DOCX, TXT or MD.",
            });
            continue;
          }

          if (slotsLeft <= 0) {
            results.push({
              name: file.originalname,
              error: `This room already has ${MAX_FILES_PER_ROOM} files. Remove one to add another.`,
            });
            continue;
          }

          const text = (await extractText(file)).replaceAll("\u0000", "");

          if (!text.trim()) {
            results.push({
              name: file.originalname,
              error: "No readable text was found in this file.",
            });
            continue;
          }

          if (text.length > charsLeft) {
            results.push({
              name: file.originalname,
              error: `Too long for this room: ${Math.max(charsLeft, 0).toLocaleString()} of ${MAX_TOTAL_CHARS.toLocaleString()} characters remaining, but this file has ${text.length.toLocaleString()}.`,
            });
            continue;
          }

          const { data: document, error: insertError } = await supabase
            .from("uploaded_documents")
            .insert({
              room_id: roomId,
              user_id: userId,
              name: file.originalname,
              size: file.size,
              mime_type: file.mimetype,
              extracted_text: text,
              char_count: text.length,
            })
            .select("id, name, size, mime_type, created_at")
            .single();

          if (insertError) throw insertError;

          slotsLeft -= 1;
          charsLeft -= text.length;

          results.push({
            id: document.id,
            name: document.name,
            size: document.size,
            mimeType: document.mime_type,
            createdAt: document.created_at,
            text,
          });
        } catch (error) {
          console.error(`Processing failed for ${file.originalname}:`, error);
          results.push({
            name: file.originalname,
            error: "Could not process or save this file.",
          });
        }
      }

      return res.json({
        message: "File processing completed.",
        files: results,
      });
    } catch (error) {
      console.error("File upload failed:", error);

      return res.status(500).json({
        error: "Failed to process uploaded files.",
      });
    }
  },
);

// Delete one saved file.
router.delete("/:documentId", authenticateUser, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { roomId } = req.query;
    const userId = req.user.id;

    if (!isUuid(documentId) || !isUuid(roomId)) {
      return res.status(400).json({
        error: "A valid document ID and study room ID are required.",
      });
    }

    if (!(await userOwnsRoom(roomId, userId))) {
      return res.status(404).json({
        error: "Study room not found or access denied.",
      });
    }

    // Delete only a document owned by this user in this room.
    const { data: deletedDocument, error: deleteError } = await supabase
      .from("uploaded_documents")
      .delete()
      .eq("id", documentId)
      .eq("room_id", roomId)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();

    if (deleteError) throw deleteError;

    if (!deletedDocument) {
      return res.status(404).json({
        error: "Document not found or access denied.",
      });
    }

    return res.status(200).json({
      message: "Document deleted successfully.",
      id: deletedDocument.id,
    });
  } catch (error) {
    console.error("Failed to delete document:", error);

    return res.status(500).json({
      error: "Failed to delete document.",
    });
  }
});

export default router;
