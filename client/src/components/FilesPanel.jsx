import { useDropzone } from "react-dropzone";
import {
  Upload,
  Plus,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { MAX_FILE_SIZE, MAX_FILES_PER_DROP } from "../hooks/useRoomFiles";

const FilesPanel = ({ files, notices, onAddFiles, onRemoveFile }) => {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: onAddFiles,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES_PER_DROP,
    multiple: true,
    noClick: true,
    noKeyboard: true,
  });

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
          {isDragActive ? "Drop your files here" : "Add your materials"}
        </p>

        <p className="mt-2 text-sm/6 text-text-muted">
          Drag and drop PDFs, DOCX, TXT, or Markdown files (max 10 MB each).
        </p>

        <button
          type="button"
          onClick={open}
          className="mt-5 btn-primary-sm rounded-xl"
        >
          <Plus size={16} />
          Upload file
        </button>
      </div>

      {notices.length > 0 && (
        <ul role="alert" className="mt-3 space-y-1 text-xs text-red-500">
          {notices.map((notice, i) => (
            <li key={i}>{notice}</li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium">Files ({files.length})</h3>

          {files.map((file) => (
            <div
              key={file.localId}
              className="flex items-center gap-3 rounded-xl border border-border p-3"
            >
              <FileText size={20} className="shrink-0 text-accent" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p
                  className={`text-xs ${
                    file.status === "error" ? "text-red-500" : "text-text-muted"
                  }`}
                >
                  {file.status === "error"
                    ? file.error
                    : `${(file.size / 1024).toFixed(1)} KB`}
                </p>
              </div>

              {file.status === "uploading" && (
                <Loader2
                  size={16}
                  className="shrink-0 animate-spin text-text-muted"
                />
              )}
              {file.status === "ready" && (
                <CheckCircle2 size={16} className="shrink-0 text-green-500" />
              )}
              {file.status === "error" && (
                <AlertCircle size={16} className="shrink-0 text-red-500" />
              )}

              <button
                type="button"
                onClick={() => onRemoveFile(file)}
                disabled={file.status === "uploading"}
                className="rounded-lg p-2 text-text-muted transition hover:bg-primary-soft hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Remove ${file.name}`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FilesPanel;
