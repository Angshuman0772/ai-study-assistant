import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Plus, FileText, X } from "lucide-react";
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  processDocument,
  MAX_FILE_SIZE,
} from "../services/documentService";

const STATUS_LABELS = {
  uploaded: { text: "Not processed", className: "text-text-muted" },
  processing: { text: "Processing...", className: "text-text-muted" },
  ready: { text: "Ready", className: "text-success" },
  failed: { text: "Failed", className: "text-red-500" },
};

const FilesPanel = ({ roomId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Load the room's saved files.
  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;

    async function loadDocuments() {
      setLoading(true);
      setError("");

      try {
        const data = await getDocuments(roomId);
        if (!cancelled) setDocuments(data);
      } catch (err) {
        if (cancelled) return;
        console.error("Error loading documents:", err);
        setError("Couldn't load your files. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDocuments();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const updateStatus = (documentId, status) => {
    setDocuments((current) =>
      current.map((d) => (d.id === documentId ? { ...d, status } : d)),
    );
  };

  // Runs server-side processing and reflects its progress in the list.
  const runProcessing = async (document) => {
    updateStatus(document.id, "processing");

    try {
      await processDocument(document.id);
      updateStatus(document.id, "ready");
    } catch (err) {
      console.error("Processing failed:", err);
      updateStatus(document.id, "failed");
      setError(`${document.name}: ${err.message}`);
    }
  };

  const retryProcessing = async (document) => {
    setError("");
    setBusy(true);
    await runProcessing(document);
    setBusy(false);
  };

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setBusy(true);
    setError("");

    const uploadFailures = [];

    // One at a time keeps things simple and avoids hammering the AI API.
    for (const file of acceptedFiles) {
      try {
        const saved = await uploadDocument({ roomId, file });
        setDocuments((current) => [saved, ...current]);
        await runProcessing(saved);
      } catch (err) {
        console.error("Upload failed:", err);
        uploadFailures.push(file.name);
      }
    }

    if (uploadFailures.length > 0) {
      setError(`Couldn't upload: ${uploadFailures.join(", ")}`);
    }

    setBusy(false);
  };

  const onDropRejected = (rejections) => {
    const names = rejections.map((r) => r.file.name).join(", ");
    setError(`Not accepted (wrong type or over 10 MB): ${names}`);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled: busy,
    noClick: true,
    noKeyboard: true,
  });

  const removeDocument = async (document) => {
    if (!window.confirm(`Delete "${document.name}"?`)) return;

    try {
      setError("");
      await deleteDocument(document);
      setDocuments((current) => current.filter((d) => d.id !== document.id));
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Couldn't delete the file. Please try again.");
    }
  };

  return (
    <section className="flex min-h-105 flex-col surface-card-padded lg:min-h-0">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-accent">
          <Upload size={20} />
        </div>

        <div>
          <h2 className="font-semibold">Uploaded Files</h2>
          <p className="text-sm text-text-muted">Your study materials</p>
        </div>
      </div>

      {loading ? (
        <p className="mb-4 text-sm text-text-muted">Loading files...</p>
      ) : (
        documents.length > 0 && (
          <div className="mb-4 max-h-60 space-y-2 overflow-y-auto scroll-styled">
            <h3 className="text-sm font-medium">Files ({documents.length})</h3>

            {documents.map((document) => {
              const status =
                STATUS_LABELS[document.status] ?? STATUS_LABELS.uploaded;
              const canRetry =
                document.status === "failed" || document.status === "uploaded";

              return (
                <div
                  key={document.id}
                  className="flex items-center gap-3 rounded-xl border border-border p-3"
                >
                  <FileText size={20} className="shrink-0 text-accent" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {document.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {(document.size_bytes / 1024).toFixed(1)} KB ·{" "}
                      <span className={status.className}>{status.text}</span>
                    </p>
                  </div>

                  {canRetry && (
                    <button
                      type="button"
                      onClick={() => retryProcessing(document)}
                      disabled={busy}
                      className="rounded-lg px-2 py-1 text-xs text-accent transition hover:bg-primary-soft disabled:opacity-50"
                    >
                      {document.status === "failed" ? "Retry" : "Process"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => removeDocument(document)}
                    className="rounded-lg p-2 text-text-muted transition hover:bg-primary-soft hover:text-accent"
                    aria-label={`Delete ${document.name}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )
      )}

      <div
        {...getRootProps()}
        className={`flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition-colors ${
          isDragActive ? "border-accent bg-primary-soft" : "border-border"
        }`}
      >
        <input {...getInputProps()} />

        <Upload size={28} className="mb-3 text-text-muted" />

        <p className="font-medium">
          {busy
            ? "Working on your files..."
            : isDragActive
              ? "Drop your files here"
              : "Add your materials"}
        </p>

        <p className="mt-2 text-sm/6 text-text-muted">
          Drag and drop PDFs, DOCX, PPTX, TXT, or Markdown files (up to 10 MB).
        </p>

        <button
          type="button"
          onClick={open}
          disabled={busy}
          className="mt-5 btn-primary-sm rounded-xl disabled:opacity-50"
        >
          <Plus size={16} />
          Upload file
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-500">
          {error}
        </p>
      )}
    </section>
  );
};

export default FilesPanel;
