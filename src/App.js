import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ✅ Match the lowercase filenames
import Signup from "./pages/signup";
import Login from "./pages/login";
import Home from "./pages/home";
import DefaultLanding from "./pages/DefaultLanding"; // This one is uppercase in your folder

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route "/" shows DefaultLanding */}
        <Route path="/" element={<DefaultLanding />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Home route */}
        <Route path="/home" element={<Home />} />

        {/* Redirect any unknown path to the default landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
