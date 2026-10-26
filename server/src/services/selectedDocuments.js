import supabaseAdmin from "../config/supabaseServer.js";

// IDs of the user's processed files in this room that are ticked for AI use.
export async function getSelectedDocumentIds({ userId, roomId }) {
  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("id")
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .eq("is_selected", true)
    .eq("status", "ready");

  if (error) throw error;

  return data.map((doc) => doc.id);
}
