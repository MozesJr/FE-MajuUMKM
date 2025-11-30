import React, { useState, useEffect } from "react";
import {
  Shield,
  ArrowLeft,
  Users,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getAllUsers, createUser, updateUser, deleteUser } from "../utils/auth";

function AdminPanel() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notification, setNotification] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "default",
    bio: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      showNotification("error", "Failed to fetch users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(formData);
      showNotification("success", "User created successfully!");
      setShowCreateModal(false);
      setFormData({ username: "", password: "", role: "default", bio: "" });
      fetchUsers();
    } catch (error) {
      showNotification("error", "Failed to create user: " + error.message);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await updateUser(selectedUser.id, {
        username: formData.username,
        role: formData.role,
        bio: formData.bio,
      });
      showNotification("success", "User updated successfully!");
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ username: "", password: "", role: "default", bio: "" });
      fetchUsers();
    } catch (error) {
      showNotification("error", "Failed to update user: " + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(userId);
      showNotification("success", "User deleted successfully!");
      fetchUsers();
    } catch (error) {
      showNotification("error", "Failed to delete user: " + error.message);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: "",
      role: user.role === "admin" ? "admin" : "default",
      bio: user.bio || "",
    });
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
              notification.type === "success"
                ? "bg-green-500/20 border border-green-500/50 text-green-200"
                : "bg-red-500/20 border border-red-500/50 text-red-200"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p className="text-sm">{notification.message}</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500/20 p-3 rounded-xl">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <p className="text-purple-300">
                  Kelola users dan konfigurasi sistem
                </p>
              </div>
            </div>
            <button
              onClick={() => (window.location.href = "/")}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Chat</span>
            </button>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">User Management</h2>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
              <p className="text-purple-300">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-purple-300 font-medium">
                      Username
                    </th>
                    <th className="text-left py-3 px-4 text-purple-300 font-medium">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 text-purple-300 font-medium">
                      Bio
                    </th>
                    <th className="text-left py-3 px-4 text-purple-300 font-medium">
                      Created
                    </th>
                    <th className="text-left py-3 px-4 text-purple-300 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30"
                    >
                      <td className="py-3 px-4 text-white">{u.username}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            u.role === "admin"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-purple-300 text-sm truncate max-w-xs">
                        {u.bio || "-"}
                      </td>
                      <td className="py-3 px-4 text-purple-300 text-sm">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={u.id === user.id}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-purple-500/20 p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  Create New User
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      username: "",
                      password: "",
                      role: "default",
                      bio: "",
                    });
                  }}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-purple-300" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="default">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Bio (Optional)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    rows="3"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Create User</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-purple-500/20 p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Edit User</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                    setFormData({
                      username: "",
                      password: "",
                      role: "default",
                      bio: "",
                    });
                  }}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-purple-300" />
                </button>
              </div>

              <form onSubmit={handleEditUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="default">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    rows="3"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Update User</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
