import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Plus, FileText, X } from "lucide-react";

const FilesPanel = () => {
  const [files, setFiles] = useState([]);

  const onDrop = (acceptedFiles) => {
    setFiles((currentFiles) => [...currentFiles, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    multiple: true,
    noClick: true,
    noKeyboard: true,
  });

  const removeFile = (indexToRemove) => {
    setFiles((currentFiles) =>
      currentFiles.filter((_, index) => index !== indexToRemove),
    );
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
          {isDragActive ? "Drop your files here" : "Add your materials"}
        </p>

        <p className="mt-2 text-sm/6 text-text-muted">
          Drag and drop PDFs, DOCX, TXT, or Markdown files.
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

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium">
            Selected files ({files.length})
          </h3>

          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center gap-3 rounded-xl border border-border p-3"
            >
              <FileText size={20} className="shrink-0 text-accent" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-text-muted">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeFile(index)}
                className="rounded-lg p-2 text-text-muted transition hover:bg-primary-soft hover:text-accent"
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
