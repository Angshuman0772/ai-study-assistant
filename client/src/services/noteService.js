import { supabase } from "../lib/supabaseClient";

// Fetch all notes for a specific study room.
export async function getNotes(roomId) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("room_id", roomId)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return data;
}

// Create a note.
export async function createNote({ roomId, title, content }) {
  const { data, error } = await supabase
    .from("notes")
    .insert({
      room_id: roomId,
      title: title.trim() || "Untitled note",
      content,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

// Update a note.
export async function updateNote({ noteId, title, content }) {
  const { data, error } = await supabase
    .from("notes")
    .update({
      title: title.trim() || "Untitled note",
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// Delete a note.
export async function deleteNote(noteId) {
  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  if (error) throw error;
}
