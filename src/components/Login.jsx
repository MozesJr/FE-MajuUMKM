import React, { useState } from "react";
import { Sparkles, Loader2, AlertCircle, UserPlus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(username, password);

      if (!result.success) {
        setError(result.error || "Login gagal");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login. Cek console untuk detail.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">MajuUKM</h1>
          <p className="text-purple-300">Masuk untuk melanjutkan</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-200">{error}</p>
                  <p className="text-xs text-red-300 mt-1">
                    Pastikan username sesuai dengan database MajuUKM
                  </p>
                </div>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Masukkan username"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Masukkan password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* Register Section */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="text-center mb-4">
              <p className="text-sm text-purple-300">Belum punya akun?</p>
            </div>
            <button
              onClick={() => navigate("/register")}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Daftar Sekarang</span>
            </button>
            <p className="text-xs text-purple-400 text-center mt-3">
              Daftar gratis dan mulai konsultasi bisnis UMKM Anda
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-purple-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
          <p className="text-sm text-purple-300 text-center">
            💡 <strong>Tips:</strong> Setelah registrasi, cek email untuk
            verifikasi akun
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
