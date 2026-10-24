import { supabase } from "../lib/supabaseClient";

// Create a study room
export async function createStudyRoom({
  name,
  description = "",
  subject = "",
}) {
  // Get the currently authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;

  if (!user) {
    throw new Error("You must be logged in to create a study room.");
  }

  // Insert the new room into the database
  const { data, error } = await supabase
    .from("study_rooms")
    .insert({
      user_id: user.id,
      name,
      description: description || null,
      subject: subject || null,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}
// Fetch study rooms belonging to the logged-in user
export async function getStudyRooms() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;

  if (!user) {
    throw new Error("You must be logged in to view study rooms.");
  }

  const { data, error } = await supabase
    .from("study_rooms")
    .select("id, name, description, subject, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

// Fetching a room
export async function getStudyRoom(roomId) {
  if (!roomId) {
    throw new Error("A study room ID is required.");
  }

  const { data, error } = await supabase
    .from("study_rooms")
    .select("id, name, description, subject, created_at")
    .eq("id", roomId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

const BUCKET = "study-files";

// Deletes a room. Files in Storage never cascade, so they're removed first.
// The database then cascades to documents, chunks, notes, sessions,
// conversations and messages.
export async function deleteStudyRoom(roomId) {
  if (!roomId) {
    throw new Error("A study room ID is required.");
  }

  // 1. Remove the room's files from Storage.
  const { data: documents, error: documentsError } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("room_id", roomId);

  if (documentsError) throw documentsError;

  const paths = documents.map((d) => d.storage_path);

  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove(paths);

    if (storageError) throw storageError;
  }

  // 2. Delete the room row; the cascades remove everything else.
  const { data, error } = await supabase
    .from("study_rooms")
    .delete()
    .eq("id", roomId)
    .select("id");

  if (error) throw error;

  // RLS can block a delete without raising an error, so check a row went.
  if (!data || data.length === 0) {
    throw new Error("Could not delete this study room.");
  }
}
