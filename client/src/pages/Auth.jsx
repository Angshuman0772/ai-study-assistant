import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted/50 focus:border-accent";

const points = [
  ["Focus", "A session timer that keeps you on one task."],
  ["Notes", "Everything you write, in one place per subject."],
  ["Assistant", "Ask questions without leaving your notes."],
];

export default function Auth() {
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  function showMessage(text, error = true) {
    setMessage(text);
    setIsError(error);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const { data, error } = isSignup
        ? await signUp(email, password, fullName.trim())
        : await signIn(email, password);

      if (error) {
        showMessage(error.message);
        return;
      }

      if (isSignup && !data.session) {
        showMessage(
          "Account created! Check your email to confirm your account.",
          false,
        );
        return;
      }

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      showMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsSignup((previous) => !previous);
    setMessage("");
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-bg text-text">
      <div className="grid h-full lg:grid-cols-[5fr_6fr]">
        {/* Left: plain statement */}
        <section className="hidden h-full flex-col justify-between border-r border-border bg-surface px-14 py-10 lg:flex">
          <Link to="/" className="flex w-fit items-center gap-2.5">
            <Brain size={22} className="text-accent" />
            <span className="text-base font-semibold tracking-tight">
              StudyFlow
            </span>
          </Link>

          <div className="max-w-md">
            <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight">
              A quieter place to study.
            </h1>

            <dl className="mt-10 divide-y divide-border border-y border-border">
              {points.map(([term, description]) => (
                <div key={term} className="flex gap-6 py-4">
                  <dt className="w-20 shrink-0 text-sm font-medium">{term}</dt>
                  <dd className="text-sm leading-6 text-text-muted">
                    {description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="text-sm text-text-muted">
            A little progress every day adds up.
          </p>
        </section>

        {/* Right: form */}
        <section className="flex h-full flex-col px-6 py-8 sm:px-12">
          <Link to="/" className="flex w-fit items-center gap-2.5 lg:invisible">
            <Brain size={20} className="text-accent" />
            <span className="text-base font-semibold tracking-tight">
              StudyFlow
            </span>
          </Link>

          <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              {isSignup ? "Create your account" : "Log in"}
            </h2>
            <p className="mt-1.5 text-sm text-text-muted">
              {isSignup
                ? "It takes less than a minute."
                : "Pick up where you left off."}
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              {isSignup && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium"
                  >
                    Full name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                    maxLength={100}
                    className={inputClass}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="text-xs text-text-muted transition-colors hover:text-text"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className={inputClass}
                />
                {isSignup && (
                  <p className="text-xs text-text-muted">
                    At least 6 characters.
                  </p>
                )}
              </div>

              {message && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`text-sm leading-5 ${
                    isError ? "text-red-400" : "text-text-muted"
                  }`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : isSignup
                    ? "Create account"
                    : "Log in"}
              </button>
            </form>

            <p className="mt-6 text-sm text-text-muted">
              {isSignup ? "Already have an account?" : "No account yet?"}{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-text underline underline-offset-4 decoration-border transition-colors hover:decoration-text"
              >
                {isSignup ? "Log in" : "Sign up"}
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
