import React from "react";
import { Shield, ArrowLeft, Settings, Database, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function AdminPanel() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500/20 p-3 rounded-xl">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <p className="text-purple-300">Kelola konfigurasi modul</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => (window.location.href = "/")}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Workspace Management */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6">
            <div className="bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Manage Workspaces
            </h3>
            <p className="text-sm text-purple-300 mb-4">
              Kelola konfigurasi untuk 5 modul workspace
            </p>
            <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              Configure
            </button>
          </div>

          {/* User Management */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6">
            <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              User Management
            </h3>
            <p className="text-sm text-purple-300 mb-4">
              Kelola user dan permission access
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Manage Users
            </button>
          </div>

          {/* System Settings */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6">
            <div className="bg-green-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              System Settings
            </h3>
            <p className="text-sm text-purple-300 mb-4">
              Konfigurasi API keys dan settings sistem
            </p>
            <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              Settings
            </button>
          </div>
        </div>

        {/* Placeholder */}
        <div className="mt-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-12 text-center">
          <p className="text-purple-300 text-lg">
            🚧 Admin features coming soon... 🚧
          </p>
          <p className="text-purple-400 text-sm mt-2">
            Ini adalah placeholder untuk admin panel. Fitur lengkap akan
            ditambahkan nanti.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
