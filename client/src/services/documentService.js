import { supabase } from "../lib/supabaseClient";

const BUCKET = "study-files";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB, matches the bucket limit

// Browsers report .md files inconsistently, so we set the type ourselves.
const MIME_BY_EXTENSION = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  md: "text/markdown",
};

function getExtension(filename) {
  return filename.split(".").pop().toLowerCase();
}

// List a room's documents, newest first.
export async function getDocuments(roomId) {
  if (!roomId) throw new Error("A study room ID is required.");

  const { data, error } = await supabase
    .from("documents")
    .select("id, name, storage_path, mime_type, size_bytes, status, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Upload the file to Storage, then record it in the database.
export async function uploadDocument({ roomId, file }) {
  if (!roomId) throw new Error("A study room ID is required.");

  const mimeType = MIME_BY_EXTENSION[getExtension(file.name)];
  if (!mimeType) throw new Error(`${file.name}: unsupported file type.`);
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`${file.name}: files must be 10 MB or smaller.`);
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("You must be logged in to upload files.");

  // The path starts with the user's ID so the storage policies can check ownership.
  const storagePath = `${user.id}/${roomId}/${crypto.randomUUID()}.${getExtension(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: mimeType, upsert: false });

  if (uploadError) throw uploadError;

  const { data, error: insertError } = await supabase
    .from("documents")
    .insert({
      room_id: roomId,
      name: file.name,
      storage_path: storagePath,
      mime_type: mimeType,
      size_bytes: file.size,
    })
    .select()
    .single();

  if (insertError) {
    // Don't leave an orphaned file behind if the database insert failed.
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw insertError;
  }

  return data;
}

// Delete the file from Storage first, then its database row.
export async function deleteDocument(document) {
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([document.storage_path]);

  if (storageError) throw storageError;

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", document.id);

  if (error) throw error;
}

// Asks the Express server to extract, chunk and embed an uploaded file.
export async function processDocument(documentId) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/documents/${documentId}/process`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
      signal: AbortSignal.timeout(120000), // large files can take a while
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Could not process this file.");
  }

  return data;
}
