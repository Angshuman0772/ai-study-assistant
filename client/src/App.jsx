import { Routes, Route } from "react-router-dom";

import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import StudyRooms from "./pages/StudyRooms";
import Flashcards from "./pages/Flashcards";
import Quizzes from "./pages/Quizzes";
import Profile from "./pages/Profile";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/study-rooms" element={<StudyRooms />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/quizzes" element={<Quizzes />} />
      </Route>
    </Routes>
  );
}

export default App;
