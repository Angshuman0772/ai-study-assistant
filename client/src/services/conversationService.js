import { supabase } from "../lib/supabaseClient";

// create new conversation inside a study room
export async function createConversation({ roomId, title = "New Chat" }) {
  const { data, error } = await supabase
    .from("ai_conversations")
    .insert([{ room_id: roomId, title }])
    .select()
    .single();
  if (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
  return data;
}

// Get all conversations belonging to a study room
export async function getConversations(roomId) {
  const { data, error } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("room_id", roomId)
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
  return data;
}

// Save a user or model message
export async function saveMessage({ conversationId, role, content }) {
  const { data, error } = await supabase
    .from("ai_messages")
    .insert({
      conversation_id: conversationId,
      role,
      content: content.trim(),
    })
    .select()
    .single();
  if (error) {
    console.error("Error saving messages", error);
    throw error;
  }

  // Update the conversation's last activity time
  const { error: updateError } = await supabase
    .from("ai_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (updateError) {
    console.error(
      "Message saved, but conversation timestamp update failed",
      updateError,
    );
  }
  return data;
}

// Load all messages for a conversation
export async function getConversationMessages(conversationId) {
  const { data, error } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching conversation messages", error);
    throw error;
  }
  return data;
}

// Update a conversation's title
export async function updateConversationTitle({ conversationId, title }) {
  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Conversation title cannot be empty.");
  }

  const { data, error } = await supabase
    .from("ai_conversations")
    .update({
      title: title.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId)
    .select()
    .single();

  if (error) {
    console.error("Error updating conversation title:", error);
    throw error;
  }

  return data;
}

// Delete a conversation and its associated messages
export async function deleteConversation(conversationId) {
  const { error } = await supabase
    .from("ai_conversations")
    .delete()
    .eq("id", conversationId);

  if (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
}
