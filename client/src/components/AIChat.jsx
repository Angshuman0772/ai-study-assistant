import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useParams } from "react-router-dom";
import {
  createConversation,
  getConversations,
  saveMessage,
  getConversationMessages,
} from "../services/conversationService";
import {
  BrainCircuit,
  MessageCircle,
  Send,
  Bot,
  User,
  Plus,
  History,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AIassistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { id: roomId } = useParams();

  const [conversationId, setConversationId] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [conversations, setConversations] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    let cancelled = false;

    async function loadLatestConversation() {
      if (!roomId) {
        setLoadingHistory(false);
        return;
      }

      setLoadingHistory(true);

      try {
        const conversations = await getConversations(roomId);

        if (cancelled) return;

        // No previous conversations: start with an empty chat.
        if (conversations.length === 0) {
          setConversationId(null);
          setMessages([]);
          return;
        }

        // getConversations orders by updated_at descending.
        const latestConversation = conversations[0];

        const savedMessages = await getConversationMessages(
          latestConversation.id,
        );

        if (cancelled) return;

        setConversationId(latestConversation.id);

        setMessages(
          savedMessages.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
          })),
        );
      } catch (error) {
        console.error("Failed to load conversation:", error);
      } finally {
        if (!cancelled) {
          setLoadingHistory(false);
        }
      }
    }

    loadLatestConversation();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  useEffect(() => {
    async function loadConversations() {
      if (!roomId) return;

      try {
        setLoadingHistory(true);

        const data = await getConversations(roomId);
        setConversations(data ?? []);
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        setLoadingHistory(false);
      }
    }

    loadConversations();
  }, [roomId]);

  const handleSend = async () => {
    const userMessage = input.trim();

    if (!userMessage || loading || loadingHistory) return;

    if (!roomId) {
      console.error("Cannot send a message without a study room ID.");
      return;
    }

    // Capture previous messages for Gemini's conversation history.
    const history = messages.map(({ role, content }) => ({
      role,
      content,
    }));

    // Optimistically show the user's message.
    const userChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage,
    };

    setMessages((prev) => [...prev, userChatMessage]);
    setInput("");
    setLoading(true);

    try {
      // Create a database conversation only when needed.
      let activeConversationId = conversationId;

      if (!activeConversationId) {
        const conversation = await createConversation({
          roomId,
          title: userMessage.slice(0, 60),
        });

        activeConversationId = conversation.id;
        setConversationId(activeConversationId);
      }

      // Persist the user's message.
      await saveMessage({
        conversationId: activeConversationId,
        role: "user",
        content: userMessage,
      });

      // Ask Gemini for a response.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message: userMessage, history, roomId }),
        signal: AbortSignal.timeout(60000), // give up after 60 seconds
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get an AI response.");
      }

      // Persist Gemini's reply.
      const savedReply = await saveMessage({
        conversationId: activeConversationId,
        role: "model",
        content: data.reply,
      });

      // Add the persisted reply to React state.
      setMessages((prev) => [
        ...prev,
        {
          id: savedReply.id,
          role: savedReply.role,
          content: savedReply.content,
        },
      ]);
    } catch (error) {
      console.error("Chat request failed:", error);

      // Keep every rendered message's key unique.
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "model",
          content: error.message || "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  function handleNewChat() {
    if (loading) return;

    setMessages([]);
    setInput("");
    setConversationId(null);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  }

  async function openConversation(conversation) {
    try {
      setLoadingHistory(true);

      const data = await getConversationMessages(conversation.id);

      setConversationId(conversation.id);
      setMessages(data ?? []);
    } catch (error) {
      console.error("Failed to load conversation:", error);
    } finally {
      setLoadingHistory(false);
    }
  }

  return (
    <section className="flex min-h-105 flex-col overflow-hidden surface-card lg:min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-accent">
            <BrainCircuit size={20} />
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold">AI assistant</h2>
            <p className="text-sm text-text-muted">Your personal AI tutor</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {/* Conversation history dropdown */}
          <div className="relative">
            <details className="group">
              <summary
                className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-muted transition-colors hover:bg-background hover:text-text"
                title="View previous conversations"
              >
                <History size={17} />
                <span className="hidden sm:inline">History</span>
              </summary>

              <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-background shadow-xl sm:w-72">
                <div className="flex items-center justify-between border-b border-border px-3 py-3">
                  <p className="text-sm font-semibold">Previous chats</p>
                  <span className="text-xs text-text-muted">
                    {conversations.length}
                  </span>
                </div>

                <div className="scroll-styled max-h-64 overflow-y-auto p-2">
                  {loadingHistory ? (
                    <p className="px-2 py-4 text-center text-sm text-text-muted">
                      Loading conversations...
                    </p>
                  ) : conversations.length === 0 ? (
                    <p className="px-2 py-4 text-center text-sm text-text-muted">
                      No previous conversations
                    </p>
                  ) : (
                    conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={(e) => {
                          e.currentTarget
                            .closest("details")
                            ?.removeAttribute("open");

                          openConversation(conversation);
                        }}
                        className={`mb-1 flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          conversationId === conversation.id
                            ? "bg-primary-soft text-accent"
                            : "text-text hover:bg-surface"
                        }`}
                      >
                        <MessageCircle size={16} className="mt-0.5 shrink-0" />
                        <span className="min-w-0 flex-1 truncate">
                          {conversation.title || "Untitled conversation"}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </details>
          </div>

          <button
            type="button"
            onClick={handleNewChat}
            className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-muted transition-colors hover:bg-background hover:text-text"
            title="Start a new chat"
          >
            <Plus size={17} />
            <span className="hidden sm:inline">New chat</span>
          </button>
        </div>
      </div>

      {/* Conversation area */}
      <div className="flex min-h-0 flex-1 flex-col px-5 py-1">
        <div className="scroll-styled flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-2 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-accent">
                <MessageCircle size={26} />
              </div>

              <p className="font-medium">What are you learning today?</p>

              <p className="mt-2 max-w-sm text-sm/6 text-text-muted">
                Ask questions, clarify difficult concepts, and get help with
                your study materials.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    isUser ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-accent">
                    {isUser ? <User size={16} /> : <Bot size={17} />}
                  </div>

                  <div
                    className={`min-w-0 max-w-[85%] wrap-break-word rounded-2xl px-4 py-3 text-sm/6 ${
                      isUser
                        ? "rounded-tr-sm bg-primary text-white whitespace-pre-wrap"
                        : "rounded-tl-sm bg-background text-text"
                    }`}
                  >
                    {isUser ? (
                      message.content
                    ) : (
                      <div className="chat-markdown min-w-0">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex items-center gap-3 text-sm text-text-muted">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-accent">
                <Bot size={17} />
              </div>
              Thinking...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="p-4">
        <form
          onSubmit={handleSend}
          className="flex items-end gap-2 rounded-xl border border-border bg-background p-2 transition-colors focus-within:border-accent"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI tutor..."
            rows={1}
            disabled={loading}
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-text outline-none placeholder:text-text-muted disabled:opacity-50"
          />

          <button
            type="submit"
            aria-label="Send message"
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={17} />
          </button>
        </form>

        <p className="mt-2 text-center text-xs text-text-muted">
          Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </section>
  );
}
