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
