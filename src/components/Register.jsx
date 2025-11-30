import React, { useState } from "react";
import { Sparkles, Loader2, AlertCircle, CheckCircle } from "lucide-react";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    namaUsaha: "",
    jenisUsaha: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validasi
    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password minimal 8 karakter");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8061/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Registrasi gagal");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Registrasi Berhasil!
          </h2>
          <p className="text-purple-300 mb-6">
            Email verifikasi telah dikirim ke <strong>{formData.email}</strong>
          </p>
          <p className="text-sm text-purple-400 mb-6">
            Silakan cek inbox email Anda dan klik link verifikasi untuk
            mengaktifkan akun.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Daftar MajuUKM</h1>
          <p className="text-purple-300">Buat akun baru untuk memulai</p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                placeholder="Username untuk login"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                placeholder="Minimal 8 karakter"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Konfirmasi Password *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                placeholder="Ulangi password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Nama Usaha (Opsional)
              </label>
              <input
                type="text"
                value={formData.namaUsaha}
                onChange={(e) =>
                  setFormData({ ...formData, namaUsaha: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                placeholder="Nama UMKM Anda"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Jenis Usaha (Opsional)
              </label>
              <select
                value={formData.jenisUsaha}
                onChange={(e) =>
                  setFormData({ ...formData, jenisUsaha: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Pilih Jenis Usaha</option>
                <option value="Kuliner">Kuliner</option>
                <option value="Fashion">Fashion</option>
                <option value="Jasa">Jasa</option>
                <option value="Retail">Retail</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Mendaftar...</span>
                </>
              ) : (
                <span>Daftar</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-purple-300">
              Sudah punya akun?{" "}
              <a
                href="/"
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Login di sini
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
