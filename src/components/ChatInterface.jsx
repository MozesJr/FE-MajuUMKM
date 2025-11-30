import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Loader2,
  Menu,
  X,
  LogOut,
  Shield,
  MessageSquarePlus,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ThreadList from "./ThreadList";
import {
  getAllWorkspaces,
  getThreadChats,
  createNewThread,
  streamChatToThread,
} from "../utils/anythingllm";

function ChatInterface() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Workspace & Thread State
  const [workspaces, setWorkspaces] = useState([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [currentThread, setCurrentThread] = useState(null);
  const [messages, setMessages] = useState([]);

  // UI State
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [error, setError] = useState("");

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load workspaces on mount
  useEffect(() => {
    loadWorkspaces();
  }, []);

  // Initialize workspace when selected
  useEffect(() => {
    if (currentWorkspace) {
      initializeWorkspace();
    }
  }, [currentWorkspace]);

  // Load messages when thread changes
  useEffect(() => {
    if (currentThread) {
      loadThreadMessages();
    }
  }, [currentThread]);

  // Auto-scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadWorkspaces = async () => {
    try {
      setLoadingWorkspaces(true);
      const workspaceList = await getAllWorkspaces();

      console.log("📋 Loaded workspaces:", workspaceList);

      setWorkspaces(workspaceList);

      // Set first workspace as default
      if (workspaceList.length > 0) {
        setCurrentWorkspace(workspaceList[0]);
      } else {
        setError("Tidak ada workspace yang tersedia");
      }
    } catch (error) {
      console.error("Failed to load workspaces:", error);
      setError("Gagal memuat workspace");
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  const initializeWorkspace = async () => {
    try {
      setIsLoading(true);
      setMessages([]);
      setError("");

      console.log(`🔄 Initializing workspace: ${currentWorkspace.slug}`);

      // Create new thread for workspace
      const newThread = await createNewThread(currentWorkspace.slug);
      setCurrentThread(newThread.thread);

      // Add welcome message
      setMessages([
        {
          role: "assistant",
          content: `Selamat datang di **${currentWorkspace.name}**! 👋\n\nSaya siap membantu Anda. Silakan ajukan pertanyaan Anda.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to initialize workspace:", error);
      setError(`Gagal memuat workspace: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadThreadMessages = async () => {
    if (!currentThread) return;

    try {
      setIsLoading(true);
      setError("");

      console.log(`📥 Loading messages from thread: ${currentThread.slug}`);

      const data = await getThreadChats(
        currentWorkspace.slug,
        currentThread.slug
      );

      console.log("Raw chat data:", data);

      // Convert to message format
      // AnythingLLM returns { history: [{role, content, ...}] }
      const formattedMessages =
        data.history?.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.createdAt || new Date().toISOString(),
        })) || [];

      console.log("Formatted messages:", formattedMessages);

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setError(`Gagal memuat riwayat chat: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !currentThread) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setError("");

    // Add user message
    const newUserMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Add placeholder for assistant
      const assistantMessageIndex = messages.length + 1;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
          isStreaming: true,
        },
      ]);

      // Stream response
      let fullResponse = "";

      await streamChatToThread(
        currentWorkspace.slug,
        currentThread.slug,
        userMessage,
        (data) => {
          if (data.textResponse) {
            fullResponse += data.textResponse;

            setMessages((prev) => {
              const updated = [...prev];
              updated[assistantMessageIndex] = {
                role: "assistant",
                content: fullResponse,
                timestamp: new Date().toISOString(),
                isStreaming: true,
              };
              return updated;
            });
          }
        }
      );

      // Mark complete
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[assistantMessageIndex]) {
          updated[assistantMessageIndex].isStreaming = false;
        }
        return updated;
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setError(`Gagal mengirim pesan: ${error.message}`);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleNewThread = async (newThread) => {
    setCurrentThread(newThread);
    setMessages([
      {
        role: "assistant",
        content: `Thread baru dimulai! Silakan ajukan pertanyaan Anda.`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleThreadSelect = async (thread) => {
    setCurrentThread(thread);
  };

  const handleWorkspaceChange = (workspace) => {
    setCurrentWorkspace(workspace);
    setCurrentThread(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // Loading state
  if (loadingWorkspaces) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Memuat workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <div
        className={`
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        fixed lg:relative lg:translate-x-0
        w-80 h-full bg-slate-800 border-r border-slate-700
        transition-transform duration-300 ease-in-out z-30
        flex flex-col
      `}
      >
        {/* User Info */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {user?.username}
              </p>
              <div className="flex items-center gap-1">
                {user?.role === "admin" ? (
                  <>
                    <Shield className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-amber-400">Admin</span>
                  </>
                ) : (
                  <span className="text-xs text-purple-400">User</span>
                )}
              </div>
            </div>
          </div>

          {/* Admin Panel Button */}
          {isAdmin() && (
            <button
              onClick={() => navigate("/admin")}
              className="w-full flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm mb-2"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          )}
        </div>

        {/* Workspace Selector */}
        {workspaces.length > 0 && currentWorkspace && (
          <div className="p-4 border-b border-slate-700">
            <label className="block text-xs text-slate-400 mb-2">
              PILIH MODUL
            </label>
            <select
              value={currentWorkspace?.slug || ""}
              onChange={(e) => {
                const workspace = workspaces.find(
                  (w) => w.slug === e.target.value
                );
                if (workspace) handleWorkspaceChange(workspace);
              }}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            >
              {workspaces.map((workspace) => (
                <option key={workspace.slug} value={workspace.slug}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Thread List */}
        {currentWorkspace && (
          <div className="flex-1 overflow-y-auto p-4">
            <label className="block text-xs text-slate-400 mb-2">
              RIWAYAT CHAT
            </label>
            <ThreadList
              workspaceSlug={currentWorkspace.slug}
              currentThreadSlug={currentThread?.slug}
              onThreadSelect={handleThreadSelect}
              onNewThread={handleNewThread}
            />
          </div>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>

          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">
              {currentWorkspace?.name || "MajuUKM"}
            </h1>
            <p className="text-purple-300 text-sm">
              {currentWorkspace?.slug || "Loading..."}
            </p>
          </div>

          {currentThread && (
            <button
              onClick={() => initializeWorkspace()}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Thread Baru</span>
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`
                max-w-[80%] rounded-2xl px-4 py-3
                ${
                  message.role === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-700 text-slate-100"
                }
              `}
              >
                <div className="prose prose-invert max-w-none">
                  {message.content.split("\n").map((line, i) => (
                    <p key={i} className="mb-2 last:mb-0">
                      {line
                        .split("**")
                        .map((part, j) =>
                          j % 2 === 0 ? part : <strong key={j}>{part}</strong>
                        )}
                    </p>
                  ))}
                </div>
                {message.isStreaming && (
                  <div className="flex items-center gap-1 mt-2">
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="bg-slate-700 rounded-2xl px-4 py-3">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mb-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-slate-800 border-t border-slate-700">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ketik pertanyaan Anda..."
              disabled={isLoading || !currentThread}
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim() || !currentThread}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
        />
      )}
    </div>
  );
}

export default ChatInterface;
