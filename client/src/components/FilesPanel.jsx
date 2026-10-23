import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Plus, FileText, X } from "lucide-react";
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  MAX_FILE_SIZE,
} from "../services/documentService";

const FilesPanel = ({ roomId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError("");

    const failures = [];

    // One at a time keeps things simple and gives clear per-file errors.
    for (const file of acceptedFiles) {
      try {
        const saved = await uploadDocument({ roomId, file });
        setDocuments((current) => [saved, ...current]);
      } catch (err) {
        console.error("Upload failed:", err);
        failures.push(file.name);
      }
    }

    if (failures.length > 0) {
      setError(`Couldn't upload: ${failures.join(", ")}`);
    }

    setUploading(false);
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
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled: uploading,
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

      <div
        {...getRootProps()}
        className={`flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition-colors ${
          isDragActive ? "border-accent bg-primary-soft" : "border-border"
        }`}
      >
        <input {...getInputProps()} />

        <Upload size={28} className="mb-3 text-text-muted" />

        <p className="font-medium">
          {uploading
            ? "Uploading..."
            : isDragActive
              ? "Drop your files here"
              : "Add your materials"}
        </p>

        <p className="mt-2 text-sm/6 text-text-muted">
          Drag and drop PDFs, DOCX, TXT, or Markdown files (up to 10 MB).
        </p>

        <button
          type="button"
          onClick={open}
          disabled={uploading}
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

      {loading ? (
        <p className="mt-4 text-sm text-text-muted">Loading files...</p>
      ) : (
        documents.length > 0 && (
          <div className="mt-4 max-h-60 space-y-2 overflow-y-auto">
            <h3 className="text-sm font-medium">Files ({documents.length})</h3>

            {documents.map((document) => (
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
                    {(document.size_bytes / 1024).toFixed(1)} KB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeDocument(document)}
                  className="rounded-lg p-2 text-text-muted transition hover:bg-primary-soft hover:text-accent"
                  aria-label={`Delete ${document.name}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </section>
  );
};

export default FilesPanel;
