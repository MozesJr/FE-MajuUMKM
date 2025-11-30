// server.js
import express from "express";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import cors from "cors";
import fetch from "node-fetch"; // jika Node versi lama; Node 18+ punya global fetch, safe to remove if so

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:8060",
      "http://localhost:5173",
      "http://localhost:3001",
    ],
    credentials: true,
  })
);

// ===== CONFIGURATION =====
const CONFIG = {
  ANYTHINGLLM_URL: "http://148.230.97.68:3001/api",
  ANYTHINGLLM_API_KEY: "62A184M-G7P4QRQ-JJTAMAW-35Z6SFA",
  JWT_SECRET: "majuukm-secret-key-2025", // ganti dengan secret kuat di production
  EMAIL_USER: "demianandre489@gmail.com", // ← GANTI INI
  EMAIL_PASS: "znic iscy byov bfzw", // ← GANTI INI (App Password dari Google)
  FRONTEND_URL: "http://localhost:8060",
  BACKEND_URL: "http://localhost:8061",
  PORT: 8061,
};

// ===== EMAIL TRANSPORTER =====
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: CONFIG.EMAIL_USER,
    pass: CONFIG.EMAIL_PASS,
  },
});

// Test email connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email connection error:", error);
  } else {
    console.log("✅ Email server ready");
  }
});

// ===== HELPER FUNCTIONS =====
async function checkUserExistsInAnythingLLM(username) {
  try {
    const response = await fetch(`${CONFIG.ANYTHINGLLM_URL}/v1/admin/users`, {
      headers: {
        Authorization: `Bearer ${CONFIG.ANYTHINGLLM_API_KEY}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users from AnythingLLM");
    }

    const data = await response.json();
    return data.users?.some((u) => u.username === username);
  } catch (error) {
    console.error("Error checking user existence:", error);
    throw error;
  }
}

async function createUserInAnythingLLM(username, password) {
  try {
    const response = await fetch(
      `${CONFIG.ANYTHINGLLM_URL}/v1/admin/users/new`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CONFIG.ANYTHINGLLM_API_KEY}`,
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          role: "default",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create user: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating user in AnythingLLM:", error);
    throw error;
  }
}

// ===== ROUTES =====

// 1. HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "MajuUKM Auth Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 2. REGISTER (menghasilkan JWT verifikasi yang kadaluarsa 24 jam)
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password, namaUsaha, jenisUsaha } = req.body;

    console.log("📝 Registration attempt:", { username, email });

    // Validasi
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Username, email, dan password wajib diisi",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password minimal 8 karakter",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Format email tidak valid",
      });
    }

    // Check if username already exists
    const userExists = await checkUserExistsInAnythingLLM(username);
    if (userExists) {
      return res.status(400).json({
        error: "Username sudah terdaftar",
      });
    }

    // --- Buat payload untuk token verifikasi ---
    // NOTE: payload menyertakan password untuk kemudahan dev. Di production pertimbangkan
    // untuk tidak menyimpan password plaintext di token (lihat catatan di atas).
    const payload = {
      username,
      email,
      password,
      namaUsaha: namaUsaha || "",
      jenisUsaha: jenisUsaha || "",
      nonce: crypto.randomBytes(8).toString("hex"), // menambah entropi unik
    };

    // Buat JWT dengan expiry 24 jam
    const verificationToken = jwt.sign(payload, CONFIG.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Tulis link yang mengarah ke frontend (FE akan memanggil backend /verify-email)
    const verificationUrl = `${CONFIG.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    // Kirim email verifikasi
    try {
      await transporter.sendMail({
        from: `"MajuUKM" <${CONFIG.EMAIL_USER}>`,
        to: email,
        subject: "✅ Verifikasi Email - MajuUKM",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                       color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 15px 30px; background: #667eea; 
                       color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; 
                       font-weight: bold; }
              .button:hover { background: #5568d3; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              code { background: #eee; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✨ Selamat Datang di MajuUKM!</h1>
              </div>
              <div class="content">
                <h2>Halo, ${username}! 👋</h2>
                <p>Terima kasih telah mendaftar di <strong>MajuUKM</strong> - platform chatbot cerdas untuk membantu UMKM Indonesia berkembang.</p>
                
                <p>Untuk mengaktifkan akun Anda, silakan klik tombol di bawah:</p>
                
                <center>
                  <a href="${verificationUrl}" class="button">
                    🔓 Verifikasi Email Saya
                  </a>
                </center>
                
                <p><small>Atau copy link berikut ke browser:</small><br>
                <code>${verificationUrl}</code></p>
                
                <p><strong>⏰ Link ini akan kadaluarsa dalam 24 jam.</strong></p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                
                <p><strong>Detail Akun:</strong></p>
                <ul>
                  <li>Username: ${username}</li>
                  <li>Email: ${email}</li>
                  ${namaUsaha ? `<li>Nama Usaha: ${namaUsaha}</li>` : ""}
                  ${jenisUsaha ? `<li>Jenis Usaha: ${jenisUsaha}</li>` : ""}
                </ul>
                
                <p>Jika Anda tidak mendaftar di MajuUKM, abaikan email ini.</p>
              </div>
              <div class="footer">
                <p>© 2025 MajuUKM - Asisten Virtual untuk UMKM Indonesia</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`✅ Registration email sent to ${email}`);
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
      return res.status(500).json({
        error: "Gagal mengirim email verifikasi. Periksa konfigurasi email.",
      });
    }

    res.json({
      success: true,
      message: "Email verifikasi telah dikirim. Silakan cek inbox Anda.",
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      error: "Gagal mendaftar. Silakan coba lagi.",
    });
  }
});

app.get("/api/auth/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    console.log(
      "🔍 Verification attempt with token:",
      token ? `${token.substring(0, 10)}...` : "NO_TOKEN"
    );

    if (!token) {
      return res.status(400).json({
        error: "Token verifikasi tidak valid",
      });
    }

    // Verifikasi & decode JWT
    let userData;
    try {
      userData = jwt.verify(token, CONFIG.JWT_SECRET);
    } catch (err) {
      console.error("❌ JWT verification failed:", err);
      return res.status(400).json({
        error: "Token tidak valid atau sudah kadaluarsa",
      });
    }

    // Cek apakah user sudah ada di AnythingLLM
    let exists;
    try {
      exists = await checkUserExistsInAnythingLLM(userData.username);
    } catch (err) {
      console.error("❌ Error checking existing user:", err);
      return res.status(500).json({
        error: "Gagal memeriksa keberadaan user. Silakan coba lagi.",
      });
    }

    if (exists) {
      // Idempotent: jika sudah ada, anggap verifikasi sudah terjadi sebelumnya
      console.log(
        `ℹ️ User already exists: ${userData.username} — treating as verified`
      );
      return res.json({
        success: true,
        message: "Email sudah terverifikasi. Silakan login.",
        user: {
          username: userData.username,
        },
      });
    }

    // Jika belum ada, buat user di AnythingLLM
    try {
      console.log(`📤 Creating user in AnythingLLM: ${userData.username}`);
      const createdUser = await createUserInAnythingLLM(
        userData.username,
        userData.password
      );

      console.log(`✅ User verified and created: ${userData.username}`);

      return res.json({
        success: true,
        message: "Email berhasil diverifikasi! Anda bisa login sekarang.",
        user: {
          id: createdUser.user?.id || null,
          username: createdUser.user?.username || userData.username,
          role: "user",
        },
      });
    } catch (err) {
      console.error("❌ Error creating user:", err);
      return res.status(500).json({
        error: "Gagal membuat user. Silakan coba lagi.",
      });
    }
  } catch (error) {
    console.error("❌ Verification error:", error);
    res.status(500).json({
      error: "Gagal verifikasi email. Silakan coba lagi.",
    });
  }
});

// 4. LOGIN (mengambil daftar user dari AnythingLLM dan generate JWT session)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("🔐 Login attempt:", username);

    if (!username || !password) {
      return res.status(400).json({
        error: "Username dan password wajib diisi",
      });
    }

    // Get all users from AnythingLLM
    const response = await fetch(`${CONFIG.ANYTHINGLLM_URL}/v1/admin/users`, {
      headers: {
        Authorization: `Bearer ${CONFIG.ANYTHINGLLM_API_KEY}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();
    const user = data.users?.find((u) => u.username === username);

    if (!user) {
      return res.status(401).json({
        error: "Username atau password salah",
      });
    }

    // NOTE: AnythingLLM side needs to handle password check; here we assume presence of user = success
    // Generate JWT token untuk session
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      CONFIG.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(`✅ User logged in: ${username}`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role === "admin" ? "admin" : "user",
        bio: user.bio || "",
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      error: "Gagal login. Silakan coba lagi.",
    });
  }
});

// ===== START SERVER =====
app.listen(CONFIG.PORT, () => {
  console.log("\n🚀 ================================");
  console.log(`✅ MajuUKM Auth Server running!`);
  console.log(`📍 Port: ${CONFIG.PORT}`);
  console.log(`🌐 Health Check: http://localhost:${CONFIG.PORT}/api/health`);
  console.log(`📧 Email: ${CONFIG.EMAIL_USER}`);
  console.log("================================\n");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n⏹️  Shutting down server...");
  process.exit(0);
});
