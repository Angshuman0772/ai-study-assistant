import { Link } from "react-router-dom";
import { Brain } from "lucide-react";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-accent">
            <Brain size={20} />
          </span>
          <span className="text-lg font-bold">StudyFlow</span>
        </Link>

        <div className="flex items-center gap-6">
          <a
            href="#features"
            className="hidden text-sm text-text-muted transition-colors hover:text-text sm:block"
          >
            Features
          </a>

          <Link
            to="/about"
            className="hidden text-sm text-text-muted transition-colors hover:text-text sm:block"
          >
            About
          </Link>

          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text transition-colors duration-200 hover:bg-primary-hover">
            Sign In
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
