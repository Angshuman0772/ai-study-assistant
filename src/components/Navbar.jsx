import { Brain } from "lucide-react";

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-5 border-b">
      <div className="flex items-center gap-2">
        <Brain size={30} />
        <h1 className="text-xl font-bold">AI Study Assistant</h1>
      </div>

      <button className="bg-black text-white px-4 py-2 rounded-lg">
        Sign In
      </button>
    </nav>
  );
}

export default Navbar;
