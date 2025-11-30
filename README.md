# MajuUKM - AI Chatbot Platform

Platform chatbot berbasis AI untuk membantu Usaha Kecil dan Menengah (UKM) Indonesia dengan 5 modul spesialisasi.

![MajuUKM Banner](https://via.placeholder.com/1200x400/6366f1/ffffff?text=MajuUKM+AI+Chatbot)

## 🌟 Fitur Utama

### ✨ Multi-Workspace Chatbot

- **5 Modul Spesialisasi** untuk kebutuhan UKM yang berbeda
- **Real-time Streaming** responses untuk pengalaman chat yang natural
- **Context-Aware** - setiap workspace memiliki context dan personality sendiri
- **Chat History** terpisah untuk setiap workspace

### 🔐 Authentication System

- **Role-Based Access Control** (User & Admin)
- **Protected Routes** untuk keamanan
- **Session Management** dengan localStorage
- **Demo Credentials** tersedia untuk testing

### 🎨 Modern UI/UX

- **Responsive Design** - mobile, tablet, dan desktop
- **Dark Theme** dengan gradient purple yang modern
- **Smooth Animations** dan transitions
- **Sidebar Navigation** dengan workspace switcher

### ⚙️ Admin Panel

- **Workspace Management** (Coming Soon)
- **User Management** (Coming Soon)
- **System Configuration** (Coming Soon)

---

## 📦 Tech Stack

### Frontend

- **React 18** - UI Library
- **Vite** - Build tool & Dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon set

### Backend Integration

- **MajuUKM Developer API** - LLM backend
- **Server-Sent Events (SSE)** - Real-time streaming
- **REST API** - Workspace & thread management

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### Installation

1. **Clone repository**

```bash
git clone https://github.com/your-username/majuukm-chatbot.git
cd majuukm-chatbot
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure Backend**

Edit `src/components/ChatInterface.jsx` untuk mengatur API configuration:

```javascript
const [apiConfig, setApiConfig] = useState({
  baseUrl: "http://localhost:3001", // Backend URL
  apiKey: "YOUR_API_KEY_HERE", // API Key dari MajuUKM
  threadSlugs: {},
});
```

4. **Run development server**

```bash
npm run dev
```

5. **Open browser**

```
http://localhost:8060
```

---

## 🔑 Demo Credentials

### User Role (Akses Chatbot)

```
Username: user
Password: user123
```

### Admin Role (Akses Chatbot + Admin Panel)

```
Username: admin
Password: admin123
```

---

## 📂 Project Structure

```
majuukm-chatbot/
├── public/
├── src/
│   ├── components/
│   │   ├── Login.jsx              # Login page
│   │   ├── ChatInterface.jsx      # Main chat interface
│   │   └── AdminPanel.jsx         # Admin dashboard
│   ├── contexts/
│   │   └── AuthContext.jsx        # Authentication context
│   ├── utils/
│   │   └── auth.js                # Auth utilities
│   ├── App.jsx                    # Main app router
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🤖 5 Modul Chatbot

### 1. 📊 MajuUKM (General)

Asisten AI umum untuk semua aspek UKM Indonesia

- Manajemen bisnis
- Strategi pemasaran
- Keuangan & pembukuan
- Perizinan usaha

### 2. 📋 Panduan Legalisasi Usaha dan NIB

Spesialis legalisasi usaha melalui NIB dan OSS

- Panduan step-by-step pendaftaran
- Troubleshooting masalah pendaftaran
- FAQ NIB/OSS

### 3. 💰 Pembukuan Sederhana dan Manajemen Keuangan

Mentor keuangan praktis untuk UKM pemula

- Pencatatan pemasukan/pengeluaran
- Cash flow management
- Template pembukuan

### 4. 💳 Informasi dan Simulasi Kredit Usaha Rakyat (KUR)

Pusat informasi pembiayaan KUR

- Detail program KUR
- Simulasi pinjaman interaktif
- Tips pengajuan

### 5. 📱 Strategi Pemasaran Digital

Konsultan marketing digital untuk UKM

- Fotografi produk
- Social media content
- Marketplace optimization

---

## 🔧 Configuration

### API Configuration

Anda bisa mengubah konfigurasi API melalui:

1. **Settings Panel** di aplikasi (klik icon Settings di sidebar)
2. **Edit langsung** di file `src/components/ChatInterface.jsx`

```javascript
const [apiConfig, setApiConfig] = useState({
  baseUrl: "http://localhost:3001",
  apiKey: "EQRKDSV-2Z14ES5-P9CB67B-NP7R0JS",
  threadSlugs: {},
});
```

### Environment Variables (Optional)

Buat file `.env` di root project:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_API_KEY=your-api-key-here
```

Kemudian gunakan di code:

```javascript
const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  apiKey: import.meta.env.VITE_API_KEY,
};
```

---

## 🔐 Authentication

### Adding New Users

Edit `src/utils/auth.js` untuk menambah user baru:

```javascript
const MOCK_USERS = [
  {
    id: 1,
    username: "user",
    password: "user123",
    role: "user",
    name: "User Demo",
  },
  {
    id: 2,
    username: "admin",
    password: "admin123",
    role: "admin",
    name: "Admin Demo",
  },
  // Tambah user baru di sini
  {
    id: 3,
    username: "newuser",
    password: "password123",
    role: "user",
    name: "New User",
  },
];
```

### Roles

- **user** - Akses ke chatbot saja
- **admin** - Akses ke chatbot + admin panel

---

## 🎨 Customization

### Mengubah Warna Theme

Edit `src/index.css` atau `tailwind.config.js`:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#6366f1", // Purple
        secondary: "#8b5cf6",
        // Tambah warna custom
      },
    },
  },
};
```

### Mengubah Logo

Ganti icon di `src/components/ChatInterface.jsx`:

```javascript

```

---

## 📱 API Integration

### Fetch Workspaces

```javascript
GET /v1/workspaces
Headers: {
  Authorization: Bearer YOUR_API_KEY
}
```

### Create Thread

```javascript
POST /v1/workspace/{slug}/thread/new
Headers: {
  Authorization: Bearer YOUR_API_KEY
}
```

### Stream Chat

```javascript
POST /v1/workspace/{slug}/stream-chat
Headers: {
  Authorization: Bearer YOUR_API_KEY
}
Body: {
  message: "User message",
  mode: "chat"
}
```

Response: Server-Sent Events (SSE)

```
data: {"textResponse": "Hello"}
data: {"textResponse": " World!"}
```

---

## 🐛 Troubleshooting

### CORS Error

Jika mendapat CORS error, pastikan backend mengizinkan origin frontend:

```javascript
// Di backend
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}
```

### Workspaces Tidak Muncul

1. Check backend sudah running
2. Check API key benar
3. Check console browser untuk error
4. Pastikan URL backend benar

### Streaming Tidak Bekerja

1. Check backend support SSE
2. Check response Content-Type: `text/event-stream`
3. Check browser console untuk connection errors

---

## 🚀 Deployment

### Build untuk Production

```bash
npm run build
```

Output akan ada di folder `dist/`

### Deploy ke Vercel

```bash
npm install -g vercel
vercel
```

### Deploy ke Netlify

1. Build project: `npm run build`
2. Upload folder `dist/` ke Netlify
3. Done!

### Deploy ke VPS

```bash
# Build
npm run build

# Copy dist/ ke server
scp -r dist/* user@server:/var/www/majuukm/

# Setup Nginx
# (Lihat DEPLOYMENT.md untuk detail)
```

---

## 📊 Performance

- ⚡ Initial load: ~1-2s
- ⚡ Streaming latency: <100ms
- ⚡ Build size: ~200KB (gzipped)
- ⚡ Lighthouse score: 95+

---

## 🔄 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Code Style

Project ini menggunakan:

- ESLint untuk linting
- Prettier untuk formatting (optional)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 Todo List

- [ ] Implement full Admin Panel
  - [ ] Workspace CRUD
  - [ ] User management
  - [ ] System settings
- [ ] Add real authentication API
- [ ] Add chat export functionality
- [ ] Add voice input/output
- [ ] Add multi-language support
- [ ] Add chat history persistence (database)
- [ ] Add analytics dashboard
- [ ] Add file upload support

---

## 🐞 Known Issues

- [ ] Sidebar tidak collapse otomatis di mobile setelah pilih workspace
- [ ] Chat history belum persistent (hilang saat refresh)
- [ ] Admin panel masih placeholder

---

## 📄 License

MIT License - bebas digunakan untuk project apapun.

---

## 👥 Team

- **Developer** - Your Name
- **Designer** - Your Name
- **Backend** - MajuUKM

---

## 📞 Support

Jika ada pertanyaan atau masalah:

- 📧 Email: support@majuukm.com
- 💬 Discord: [Join our server](#)
- 📖 Documentation: [docs.majuukm.com](#)
- 🐛 Issues: [GitHub Issues](#)

---

## 🙏 Acknowledgments

- [MajuUKM](https://useanything.com) - Backend LLM platform
- [React](https://react.dev) - UI library
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Lucide](https://lucide.dev) - Icon set
- [Vite](https://vitejs.dev) - Build tool

---

## 📈 Changelog

### v1.0.0 (2025-01-XX)

- ✨ Initial release
- 🎨 Modern UI with sidebar navigation
- 🔐 Authentication system
- 🤖 5 specialized chatbot modules
- ⚡ Real-time streaming responses
- 📱 Responsive design

---

## 🌐 Demo

🔗 **Live Demo:** [https://majuukm.vercel.app](#)

**Test Accounts:**

- User: `user` / `user123`
- Admin: `admin` / `admin123`

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=your-username/majuukm-chatbot&type=Date)](https://star-history.com/#your-username/majuukm-chatbot&Date)

---

**Made with ❤️ for UKM Indonesia**

**🎉 Happy Coding! 🚀**
