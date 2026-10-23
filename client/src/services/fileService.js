import { supabase } from "../lib/supabaseClient";

async function authHeaders() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("Please sign in first.");
  }

  return { Authorization: `Bearer ${session.access_token}` };
}

// An error page isn't JSON, so don't let res.json() throw a confusing SyntaxError.
async function parseResponse(response, fallbackMessage) {
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.error || fallbackMessage);
  }

  return result;
}

export async function uploadFiles(files, roomId) {
  if (!files?.length) return [];

  const formData = new FormData();
  formData.append("roomId", roomId);
  files.forEach((file) => formData.append("files", file));

  // No Content-Type header: the browser must set it, including the boundary.
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/files/upload`,
    {
      method: "POST",
      headers: await authHeaders(),
      body: formData,
    },
  );

  const result = await parseResponse(response, "File upload failed.");
  return result.files ?? [];
}

export async function getUploadedFiles(roomId) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/files?roomId=${encodeURIComponent(roomId)}`,
    { headers: await authHeaders() },
  );

  const result = await parseResponse(
    response,
    "Failed to retrieve uploaded files.",
  );
  return result.files ?? [];
}

export async function deleteUploadedFile(documentId, roomId) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/files/${encodeURIComponent(documentId)}?roomId=${encodeURIComponent(roomId)}`,
    {
      method: "DELETE",
      headers: await authHeaders(),
    },
  );

  return parseResponse(response, "Failed to delete uploaded file.");
}
