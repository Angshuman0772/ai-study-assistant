import { supabase } from "../lib/supabaseClient";

export async function saveFocusSession({
  roomId,
  startedAt,
  endedAt = new Date().toISOString(),
  durationMinutes,
}) {
  if (!roomId) {
    throw new Error("Study room ID is required to save a focus session.");
  }

  const { data, error } = await supabase
    .from("study_sessions")
    .insert({
      room_id: roomId,
      started_at: startedAt,
      ended_at: endedAt,
      duration_minutes: durationMinutes,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error saving focus session: ${error.message}`);
  }

  return data;
}
