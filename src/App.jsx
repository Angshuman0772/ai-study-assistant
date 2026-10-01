import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import StudyRoom from "./pages/StudyRoom";
import Flashcards from "./pages/Flashcards";
import Quizzes from "./pages/Quizzes";
import Profile from "./pages/Profile";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/study-room" element={<StudyRoom />} />
      <Route path="/flashcards" element={<Flashcards />} />
      <Route path="/quizzes" element={<Quizzes />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
