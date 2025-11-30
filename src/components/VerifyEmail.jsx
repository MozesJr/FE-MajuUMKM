import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token verifikasi tidak valid");
      return;
    }

    // Verify email
    fetch(
      `http://localhost:8061/api/auth/verify-email?token=${encodeURIComponent(
        token
      )}`
    )
      .then(async (res) => {
        // try parse JSON safely
        let data;
        try {
          data = await res.json();
        } catch (e) {
          // jika respon bukan JSON
          throw new Error("Respons server tidak valid");
        }

        if (res.ok && data.success) {
          setStatus("success");
          setMessage(data.message || "Verifikasi berhasil. Silakan login.");
          return;
        }

        // Jika backend mengembalikan 400 dengan pesan "Username sudah terdaftar"
        // kita anggap ini sebagai *already verified* (idempotent).
        if (!res.ok && data && typeof data.error === "string") {
          const err = data.error.toLowerCase();
          if (
            err.includes("sudah terdaftar") ||
            err.includes("sudah terverifikasi")
          ) {
            setStatus("success");
            setMessage("Email sudah terverifikasi. Silakan login.");
            return;
          }

          // token invalid / expired
          setStatus("error");
          setMessage(data.error || "Verifikasi gagal");
          return;
        }

        // fallback error
        setStatus("error");
        setMessage(data.error || "Verifikasi gagal");
      })
      .catch((err) => {
        setStatus("error");
        setMessage("Terjadi kesalahan. Silakan coba lagi.");
        console.error("VerifyEmail fetch error:", err);
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Memverifikasi Email...
            </h2>
            <p className="text-purple-300">Mohon tunggu sebentar</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Verifikasi Berhasil!
            </h2>
            <p className="text-purple-300 mb-6">{message}</p>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Login Sekarang
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Verifikasi Gagal
            </h2>
            <p className="text-purple-300 mb-6">{message}</p>
            <button
              onClick={() => (window.location.href = "/register")}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Daftar Ulang
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
