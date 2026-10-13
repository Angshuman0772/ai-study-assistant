import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Timer, Play, Pause, RotateCcw, Save } from "lucide-react";
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

  return (
    <section className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Timer label */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-accent">
          <Timer size={20} />
        </div>

        <div className="w-56 shrink-0">
          <h2 className="font-semibold">Focus Timer</h2>
          <p className="text-xs text-text-muted">
            {sessionSaved ? (
              <span className="font-medium text-green-600 dark:text-green-400">
                Session saved successfully!
              </span>
            ) : sessionError ? (
              <span className="font-medium text-red-500">{sessionError}</span>
            ) : remaining === 0 ? (
              <span className="font-medium text-accent">
                Focus session complete!
              </span>
            ) : running ? (
              "Session is in progress"
            ) : (
              "25-minute focus session"
            )}
          </p>
        </div>
      </div>

      {/* Countdown */}
      <div className="shrink-0 text-left sm:w-24 sm:text-center">
        <p className="text-3xl font-bold tracking-tight tabular-nums">
          {formatTime(remaining)}
        </p>
      </div>

      {/* Controls */}
      {/* Adjusted min-w slightly to accommodate the new button cleanly */}
      <div className="flex min-w-50 shrink-0 items-center justify-end gap-2">
        {remaining === 0 && !sessionSaved ? (
          <button
            type="button"
            onClick={handleSaveSession}
            disabled={isSaving}
            className="flex w-24 items-center justify-center gap-1.5 rounded-xl bg-accent px-2 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save"}
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleTimer}
            disabled={remaining === 0}
            className="flex w-24 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-text hover:bg-primary-hover disabled:opacity-50"
          >
            {running ? <Pause size={16} /> : <Play size={16} />}
            {running ? "Pause" : "Start"}
          </button>
        )}

        {/* New early save button: only shows if the timer has been started and isn't finished */}
        {startedAt && remaining > 0 && (
          <button
            type="button"
            onClick={handleSaveAndReset}
            disabled={isSaving}
            title="Save session and reset"
            aria-label="Save session and reset"
            className="shrink-0 rounded-xl border border-border p-2.5 text-text-muted hover:bg-green-500/10 hover:text-green-600 disabled:opacity-50 dark:hover:text-green-400"
          >
            <Save size={16} />
          </button>
        )}

        <button
          type="button"
          onClick={resetTimer}
          title="Reset timer"
          aria-label="Reset timer"
          className="shrink-0 rounded-xl border border-border p-2.5 text-text-muted hover:bg-background hover:text-text"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </section>
  );
}
