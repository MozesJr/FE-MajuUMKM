// Mock users - ganti dengan API real di production
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
];

export const login = async (username, password) => {
  // Simulasi API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        const { password, ...userWithoutPassword } = user;
        resolve(userWithoutPassword);
      } else {
        reject(new Error("Username atau password salah"));
      }
    }, 500);
  });
};

export const logout = () => {
  localStorage.removeItem("auth_user");
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("auth_user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const saveUser = (user) => {
  localStorage.setItem("auth_user", JSON.stringify(user));
};

export const isAdmin = (user) => {
  return user?.role === "admin";
};

export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};
