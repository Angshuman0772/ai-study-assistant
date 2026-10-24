import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Save } from "lucide-react";
import { saveFocusSession } from "../services/focusTimerService";

const FOCUS_SECONDS = 25 * 60;

export default function FocusTimer() {
  const { id: roomId } = useParams();

  // Database tracking states
  const [startedAt, setStartedAt] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [sessionSaved, setSessionSaved] = useState(false);

  // Timer states
  const [remaining, setRemaining] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const toggleTimer = () => {
    if (!running && !startedAt) {
      setStartedAt(new Date().toISOString());
      setSessionSaved(false); // clear previous success messages
    }
    setRunning((prev) => !prev);
  };

  async function handleSaveSession() {
    if (!startedAt) return;

    setIsSaving(true);
    setSessionError("");

    try {
      const durationMinutes = Math.round((FOCUS_SECONDS - remaining) / 60);

      await saveFocusSession({
        roomId,
        startedAt,
        endedAt: new Date().toISOString(),
        durationMinutes: durationMinutes > 0 ? durationMinutes : 1,
      });

      setSessionSaved(true);
    } catch (error) {
      console.error("Could not save focus session:", error);
      setSessionError("Failed to save session.");
    } finally {
      setIsSaving(false);
    }
  }

  // New function to save early and reset the clock immediately
  async function handleSaveAndReset() {
    setRunning(false); // pause immediately while saving
    await handleSaveSession();

    // Reset timer back to 25 min, but keep the success message visible
    setRemaining(FOCUS_SECONDS);
    setStartedAt(null);
  }

  function resetTimer() {
    setRunning(false);
    setRemaining(FOCUS_SECONDS);
    setStartedAt(null);
    setSessionSaved(false);
    setSessionError("");
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const status = sessionSaved
    ? { text: "Saved", className: "text-green-600 dark:text-green-400" }
    : sessionError
      ? { text: sessionError, className: "text-red-500" }
      : remaining === 0
        ? { text: "Session complete", className: "text-accent" }
        : null;

  const iconBtn =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-50";

  return (
    <section
      aria-label="Focus timer"
      className="flex shrink-0 items-center gap-2"
    >
      {status && (
        <span
          role="status"
          className={`hidden text-xs font-medium md:inline ${status.className}`}
        >
          {status.text}
        </span>
      )}

      <p className="w-16 text-center text-xl font-semibold tabular-nums">
        {formatTime(remaining)}
      </p>

      {remaining === 0 && !sessionSaved ? (
        <button
          type="button"
          onClick={handleSaveSession}
          disabled={isSaving}
          title={isSaving ? "Saving..." : "Save session"}
          aria-label="Save session"
          className={`${iconBtn} bg-accent text-white hover:bg-accent/90`}
        >
          <Save size={16} />
        </button>
      ) : (
        <button
          type="button"
          onClick={toggleTimer}
          disabled={remaining === 0}
          title={running ? "Pause" : "Start"}
          aria-label={running ? "Pause timer" : "Start timer"}
          className={`${iconBtn} bg-primary text-text hover:bg-primary-hover`}
        >
          {running ? <Pause size={16} /> : <Play size={16} />}
        </button>
      )}

      {startedAt && remaining > 0 && (
        <button
          type="button"
          onClick={handleSaveAndReset}
          disabled={isSaving}
          title="Save session and reset"
          aria-label="Save session and reset"
          className={`${iconBtn} text-text-muted hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400`}
        >
          <Save size={16} />
        </button>
      )}

      <button
        type="button"
        onClick={resetTimer}
        title="Reset timer"
        aria-label="Reset timer"
        className={`${iconBtn} text-text-muted hover:bg-background hover:text-text`}
      >
        <RotateCcw size={16} />
      </button>
    </section>
  );
}
