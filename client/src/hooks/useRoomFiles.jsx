import { useState, useEffect, useMemo } from "react";
import {
  getUploadedFiles,
  uploadFiles,
  deleteUploadedFile,
} from "../services/fileService";

// Keep these in sync with the multer limits in fileRoutes.js
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_FILES_PER_DROP = 5;
export const MAX_FILES_PER_ROOM = 5;

function rejectionMessage(errors) {
  return errors
    .map((e) => {
      if (e.code === "file-too-large") return "larger than 10 MB";
      if (e.code === "file-invalid-type")
        return "unsupported type (use PDF, DOCX, TXT or MD)";
      if (e.code === "too-many-files")
        return `too many files (max ${MAX_FILES_PER_DROP} at a time)`;
      return e.message;
    })
    .join(", ");
}

export function useRoomFiles(roomId) {
  // The single source of truth. Each entry:
  // { localId, id, name, size, text, status: "uploading" | "ready" | "error", error }
  const [files, setFiles] = useState([]);
  const [notices, setNotices] = useState([]);

  // Load this room's saved files. Clearing first means the previous
  // room's files can never linger if this fetch fails.
  useEffect(() => {
    setFiles([]);
    setNotices([]);

    if (!roomId) return;

    let cancelled = false;

    (async () => {
      try {
        const saved = await getUploadedFiles(roomId);
        if (cancelled) return;

        setFiles(
          saved.map((file) => ({
            localId: file.id,
            id: file.id,
            name: file.name,
            size: file.size,
            text: file.text,
            status: "ready",
            error: null,
          })),
        );
      } catch (error) {
        console.error("Failed to load saved files:", error);
        if (!cancelled) setNotices(["Couldn't load your saved files."]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const updateFile = (localId, changes) => {
    setFiles((current) =>
      current.map((f) => (f.localId === localId ? { ...f, ...changes } : f)),
    );
  };

  const addFiles = async (acceptedFiles, fileRejections = []) => {
    const newNotices = fileRejections.map(
      (r) => `${r.file.name}: ${rejectionMessage(r.errors)}`,
    );

    // 1. Skip files already in the list (same name and size).
    const deduped = acceptedFiles.filter((file) => {
      const duplicate = files.some(
        (f) =>
          f.status !== "error" && f.name === file.name && f.size === file.size,
      );
      if (duplicate) newNotices.push(`${file.name}: already added`);
      return !duplicate;
    });

    // 2. Enforce the per-room limit on what's left.
    const slotsLeft = Math.max(
      MAX_FILES_PER_ROOM - files.filter((f) => f.status !== "error").length,
      0,
    );

    const toUpload = deduped.slice(0, slotsLeft);

    deduped
      .slice(slotsLeft)
      .forEach((file) =>
        newNotices.push(
          `${file.name}: room limit of ${MAX_FILES_PER_ROOM} files reached. Remove a file to add another.`,
        ),
      );

    setNotices(newNotices);
    if (toUpload.length === 0) return;

    // ...the rest of addFiles (building `entries` from toUpload) stays the same

    const entries = toUpload.map((file) => ({
      localId: crypto.randomUUID(),
      id: null,
      name: file.name,
      size: file.size,
      text: null,
      status: "uploading",
      error: null,
    }));

    setFiles((current) => [...current, ...entries]);

    try {
      const results = await uploadFiles(toUpload, roomId);

      // The server returns one result per file, in the order we sent them.
      entries.forEach((entry, i) => {
        const result = results[i];

        if (!result || result.error || !result.id) {
          updateFile(entry.localId, {
            status: "error",
            error: result?.error || "Upload failed.",
          });
          return;
        }

        updateFile(entry.localId, {
          id: result.id,
          text: result.text,
          status: "ready",
        });
      });
    } catch (error) {
      console.error("File upload failed:", error);
      entries.forEach((entry) =>
        updateFile(entry.localId, { status: "error", error: error.message }),
      );
    }
  };

  const removeFile = async (file) => {
    if (file.status === "uploading") return;

    // Failed uploads were never saved, so only "ready" files need a server call.
    if (file.status === "ready") {
      try {
        await deleteUploadedFile(file.id, roomId);
      } catch (error) {
        console.error("Failed to delete uploaded file:", error);
        setNotices([`Couldn't delete ${file.name}. Please try again.`]);
        return;
      }
    }

    setFiles((current) => current.filter((f) => f.localId !== file.localId));
  };

  // Derived, not stored: what the AI should receive.
  const fileContexts = useMemo(
    () =>
      files
        .filter((f) => f.status === "ready")
        .map(({ id, name, text }) => ({ id, name, text })),
    [files],
  );

  return { files, notices, fileContexts, addFiles, removeFile };
}
