import Navbar from "../components/Navbar";
import { UserRound } from "lucide-react";

function Profile() {
  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-accent">
          Account
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Profile</h1>
        <div className="mt-12 max-w-2xl rounded-2xl border border-border bg-surface p-6">
          <div className="flex size-11 items-center justify-center rounded-xl border border-border-strong bg-primary-soft text-accent">
            <UserRound size={22} />
          </div>
          <h2 className="mt-5 text-xl font-semibold">Your learning profile</h2>
          <p className="mt-2 text-text-muted">
            Keep your account details and learning preferences in one place.
          </p>
        </div>
      </main>
    </div>
  );
}
export default Profile;
