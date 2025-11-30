import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import VerifyEmail from "./components/VerifyEmail";
import ChatInterface from "./components/ChatInterface";
import AdminPanel from "./components/AdminPanel";

function App() {
  const { user, isAdmin, loading } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-xl font-medium">Loading MajuUKM...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={user ? <Navigate to="/chat" replace /> : <Login />}
      />

      <Route
        path="/register"
        element={user ? <Navigate to="/chat" replace /> : <Register />}
      />

      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Protected Routes - User Must Be Logged In */}
      <Route
        path="/chat"
        element={user ? <ChatInterface /> : <Navigate to="/" replace />}
      />

      {/* Admin Routes - User Must Be Admin */}
      <Route
        path="/admin"
        element={
          user ? (
            isAdmin() ? (
              <AdminPanel />
            ) : (
              <Navigate to="/chat" replace />
            )
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Catch All - Redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
