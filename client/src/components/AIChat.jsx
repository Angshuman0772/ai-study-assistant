import { useState, useRef, useEffect } from "react";
import {
  BrainCircuit,
  MessageCircle,
  Send,
  Bot,
  User,
  Plus,
} from "lucide-react";

export default function AIassistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const handleSend = async () => {
    const userMessage = input.trim();

    if (!userMessage || loading) return;

    // Capture earlier messages before adding the new user message.
    const history = messages.map(({ role, content }) => ({
      role,
      content,
    }));

    // Add the user's message to the UI immediately
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: userMessage },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get an AI response.");
      }

      // Add Gemini's response to the conversation
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      console.error("Chat request failed:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: error.message || "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  function handleNewChat() {
    setMessages([]);
    setInput("");
    setLoading(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  }

  return (
    <section className="flex min-h-105 flex-col overflow-hidden surface-card">
      {/* Header — unchanged layout */}
      <div className="flex items-center justify-between gap-3  p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-accent">
            <BrainCircuit size={20} />
          </div>

          <div>
            <h2 className="font-semibold">AI assistant</h2>
            <p className="text-sm text-text-muted">Your personal AI tutor</p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleNewChat}
            className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-muted transition-colors hover:bg-background hover:text-text"
            title="Start a new chat"
          >
            <Plus size={17} />
            <span className="hidden sm:inline">New chat</span>
          </button>
        )}
      </div>

      {/* Conversation area */}
      <div className="flex flex-1 flex-col px-5 py-1">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto border rounded-xl border-dashed border-border">
          {messages.length === 0 ? (
            /* Original welcome screen */
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
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isUser
                        ? "bg-primary-soft text-accent"
                        : "bg-primary-soft text-accent"
                    }`}
                  >
                    {isUser ? <User size={16} /> : <Bot size={17} />}
                  </div>

                  <div
                    className={`max-w-[85%] whitespace-pre-wrap wrap-break-word rounded-2xl px-4 py-3 text-sm/6 ${
                      isUser
                        ? "rounded-tr-sm bg-primary text-white"
                        : "rounded-tl-sm bg-background text-text"
                    }`}
                  >
                    {message.content}
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

      {/* Composer — stays at the bottom */}
      <div className=" p-4">
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
