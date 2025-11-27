import React from "react";
import { useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import ChatInterface from "./components/ChatInterface";
import AdminPanel from "./components/AdminPanel";

function App() {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!user) {
    return <Login />;
  }

  // Check if admin panel route
  const isAdminRoute = window.location.pathname === "/admin";

  // Show admin panel if admin and on admin route
  if (isAdminRoute && user.role === "admin") {
    return <AdminPanel />;
  }

  // Redirect non-admin away from admin route
  if (isAdminRoute && user.role !== "admin") {
    window.location.href = "/";
    return null;
  }

  // Show chat interface for authenticated users
  return <ChatInterface />;
}

export default App;
