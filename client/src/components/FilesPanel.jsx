import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Plus,
  FileText,
  X,
  Layers,
  ClipboardCheck,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  processDocument,
  MAX_FILE_SIZE,
  setDocumentSelected,
} from "../services/documentService";
import UploadedFilesSkeleton from "./Skeletons/UploadedFilesSkeleton";

const STATUS_LABELS = {
  uploaded: { text: "Not processed", className: "text-text-muted" },
  processing: { text: "Processing...", className: "text-text-muted" },
  ready: { text: "Ready", className: "text-success" },
  failed: { text: "Failed", className: "text-red-500" },
};

const FilesPanel = ({ roomId }) => {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Load the room's saved files.
  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      setLoading(true);
      setError("");

      try {
        const data = await getDocuments(roomId);

        if (!cancelled) {
          setDocuments(data);
        }
      } catch (err) {
        if (cancelled) return;

        console.error("Error loading documents:", err);
        setError("Couldn't load your files. Please try again.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDocuments();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const updateStatus = (documentId, status) => {
    setDocuments((current) =>
      current.map((document) =>
        document.id === documentId ? { ...document, status } : document,
      ),
    );
  };

  // Runs server-side processing and reflects its progress.
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

    try {
      await runProcessing(document);
    } finally {
      setBusy(false);
    }
  };

  // Upload and process accepted files sequentially.
  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setBusy(true);
    setError("");

    const uploadFailures = [];

    try {
      for (const file of acceptedFiles) {
        try {
          const saved = await uploadDocument({ roomId, file });

          setDocuments((current) => [saved, ...current]);

          await runProcessing(saved);
        } catch (err) {
          console.error(`Upload failed for ${file.name}:`, err);
          uploadFailures.push(file.name);
        }
      }

      if (uploadFailures.length > 0) {
        setError(`Couldn't upload: ${uploadFailures.join(", ")}`);
      }
    } finally {
      setBusy(false);
    }
  };

  const onDropRejected = (rejections) => {
    const names = rejections.map((rejection) => rejection.file.name).join(", ");

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

      setDocuments((current) =>
        current.filter((item) => item.id !== document.id),
      );
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Couldn't delete the file. Please try again.");
    }
  };

  const toggleSelected = async (document) => {
    const next = !(document.is_selected ?? true);
    const apply = (value) =>
      setDocuments((current) =>
        current.map((d) =>
          d.id === document.id ? { ...d, is_selected: value } : d,
        ),
      );

    setError("");
    apply(next);

    try {
      await setDocumentSelected(document.id, next);
    } catch (err) {
      console.error("Selection update failed:", err);
      apply(!next);
      setError("Couldn't update the selection. Please try again.");
    }
  };

  const selectedCount = documents.filter(
    (d) => (d.is_selected ?? true) && d.status === "ready",
  ).length;

  const hasDocuments = documents.length > 0;

  return (
    <section className="flex min-h-105 flex-col surface-card-padded lg:min-h-0">
      {/* Panel header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-accent">
          <Upload size={20} />
        </div>

        <div className="min-w-0">
          <h2 className="font-semibold">Study Materials</h2>
          <p className="text-sm text-text-muted">
            Upload files and study from them
          </p>
        </div>

        {hasDocuments && (
          <button
            type="button"
            onClick={open}
            disabled={busy}
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm transition hover:bg-primary-soft disabled:opacity-50"
          >
            <Plus size={16} />
            Add
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p role="alert" className="mb-3 text-sm text-red-500">
          {error}
        </p>
      )}

      {/* Loading state */}
      {loading ? (
        <UploadedFilesSkeleton />
      ) : !hasDocuments ? (
        /* EMPTY STATE: large upload dropzone */
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
            Drag and drop PDFs, DOCX, PPTX, TXT, or Markdown files (up to 10
            MB).
          </p>

          <button
            type="button"
            onClick={open}
            disabled={busy}
            className="mt-5 btn-primary-sm rounded-xl disabled:opacity-50"
          >
            <Plus size={16} />
            Upload files
          </button>
        </div>
      ) : (
        <>
          {/* FILE LIST: acts as the dropzone */}
          <div
            {...getRootProps()}
            className={`mb-4 rounded-xl border p-3 transition-colors ${
              isDragActive ? "border-accent bg-primary-soft" : "border-border"
            }`}
          >
            <input {...getInputProps()} />

            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium">
                Files ({documents.length}) · {selectedCount} used by AI
              </h3>

              <span className="text-xs text-text-muted">
                {isDragActive ? "Drop to upload" : "Drag files here"}
              </span>
            </div>

            {isDragActive && (
              <div className="mb-3 rounded-lg border border-dashed border-accent bg-primary-soft p-3 text-center text-sm text-accent">
                Drop your files to upload
              </div>
            )}

            <div className="max-h-48 space-y-2 overflow-y-auto scroll-styled">
              {documents.map((document) => {
                const status =
                  STATUS_LABELS[document.status] ?? STATUS_LABELS.uploaded;

                const canRetry =
                  document.status === "failed" ||
                  document.status === "uploaded";

                return (
                  <div
                    key={document.id}
                    className="flex items-center gap-2 rounded-lg bg-surface-secondary p-2"
                  >
                    <input
                      type="checkbox"
                      checked={document.is_selected ?? true}
                      disabled={document.status !== "ready"}
                      onChange={() => toggleSelected(document)}
                      aria-label={`Use ${document.name} in AI answers`}
                      title={
                        document.status === "ready"
                          ? "Include this file in AI answers"
                          : "Process this file first"
                      }
                      className="size-4 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-40"
                    />
                    <FileText size={18} className="shrink-0 text-accent" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {document.name}
                      </p>

                      <p className="text-xs text-text-muted">
                        {(document.size_bytes / 1024).toFixed(1)} KB
                        {" · "}
                        <span className={status.className}>{status.text}</span>
                      </p>
                    </div>

                    {canRetry && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          retryProcessing(document);
                        }}
                        disabled={busy}
                        className="rounded-lg px-2 py-1 text-xs text-accent transition hover:bg-primary-soft disabled:opacity-50"
                      >
                        {document.status === "failed" ? "Retry" : "Process"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeDocument(document);
                      }}
                      className="rounded-lg p-1.5 text-text-muted transition hover:bg-primary-soft hover:text-accent"
                      aria-label={`Delete ${document.name}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STUDY TOOLS  */}
          <div className="mt-auto">
            <p className="mb-3 text-sm font-medium">Study Tools</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => navigate(`/study-rooms/${roomId}/flashcards`)}
                className="flex min-w-0 flex-col items-start rounded-xl border border-border p-3 text-left transition hover:border-accent hover:bg-primary-soft"
              >
                <Layers size={21} className="mb-3 text-accent" />

                <span className="text-sm font-medium">Flashcards</span>

                <span className="mt-1 text-xs text-text-muted">
                  Review key concepts
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/study-rooms/${roomId}/quizzes`)}
                className="flex min-w-0 flex-col items-start rounded-xl border border-border p-3 text-left transition hover:border-accent hover:bg-primary-soft"
              >
                <ClipboardCheck size={21} className="mb-3 text-accent" />

                <span className="text-sm font-medium">Quizzes</span>

                <span className="mt-1 text-xs text-text-muted">
                  Test your knowledge
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default FilesPanel;
