const API_BASE_URL = "http://148.230.97.68:3001/api";
const API_KEY = "62A184M-G7P4QRQ-JJTAMAW-35Z6SFA";

const getHeaders = () => ({
  accept: "application/json",
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
});

// Helper function untuk handle response
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    // Jika response bukan JSON, throw generic error
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const errorData = await response.json();
    throw new Error(errorData.error || errorData.message || "Request failed");
  }

  // Check if response is JSON
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Server returned non-JSON response");
  }

  return response.json();
};

// Login - Karena MajuUKM tidak punya endpoint login terpisah,
// kita akan validasi dengan mengecek apakah user ada di database
export const login = async (username, password) => {
  try {
    // Cek apakah user ada di database
    const response = await fetch(`${API_BASE_URL}/v1/admin/users`, {
      headers: getHeaders(),
    });

    const data = await handleResponse(response);

    // Cari user berdasarkan username
    const user = data.users.find((u) => u.username === username);

    if (!user) {
      throw new Error("Username tidak ditemukan");
    }

    // Karena MajuUKM tidak ada endpoint untuk validasi password,
    // kita akan return user jika username ditemukan
    // CATATAN: Ini tidak secure untuk production!
    // Sebaiknya ada endpoint /auth/login yang proper

    return {
      id: user.id,
      username: user.username,
      name: user.username,
      role: user.role === "admin" ? "admin" : "user",
      pfpFilename: user.pfpFilename,
      bio: user.bio || "",
      suspended: user.suspended,
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Get all users (Admin only)
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/admin/users`, {
      headers: getHeaders(),
    });

    const data = await handleResponse(response);

    return data.users.map((user) => ({
      id: user.id,
      username: user.username,
      name: user.username,
      role: user.role === "admin" ? "admin" : "user",
      pfpFilename: user.pfpFilename,
      bio: user.bio || "",
      suspended: user.suspended,
      createdAt: user.createdAt,
      lastUpdatedAt: user.lastUpdatedAt,
      dailyMessageLimit: user.dailyMessageLimit,
    }));
  } catch (error) {
    console.error("Get users error:", error);
    throw error;
  }
};

// Create new user (Admin only)
export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/admin/users/new`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        username: userData.username,
        password: userData.password,
        role: userData.role || "default",
      }),
    });

    const data = await handleResponse(response);
    return data.user;
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};

// Update user (Admin only)
export const updateUser = async (userId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/admin/users/${userId}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });

    const data = await handleResponse(response);
    return data.user;
  } catch (error) {
    console.error("Update user error:", error);
    throw error;
  }
};

// Delete user (Admin only)
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    await handleResponse(response);
    return true;
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
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
