import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  MessageSquare,
  Settings,
  Loader2,
  Sparkles,
  Menu,
  X,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function ChatInterface() {
  const { user, logout, isAdmin } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [messages, setMessages] = useState({});
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [apiConfig, setApiConfig] = useState({
    baseUrl: "http://localhost:3001/api",
    apiKey: "EQRKDSV-2Z14ES5-P9CB67B-NP7R0JS",
    threadSlugs: {},
  });
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedWorkspace]);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace && !apiConfig.threadSlugs[selectedWorkspace.slug]) {
      initializeThread(selectedWorkspace.slug);
    }
  }, [selectedWorkspace]);

  const getHeaders = () => {
    return {
      accept: "application/json",
      Authorization: `Bearer ${apiConfig.apiKey}`,
    };
  };

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/v1/workspaces`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data.workspaces || []);
        if (data.workspaces && data.workspaces.length > 0) {
          setSelectedWorkspace(data.workspaces[0]);
        }
      } else {
        console.error("Failed to fetch workspaces:", response.status);
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    }
  };

  const initializeThread = async (workspaceSlug) => {
    try {
      const response = await fetch(
        `${apiConfig.baseUrl}/v1/workspace/${workspaceSlug}/thread/new`,
        {
          method: "POST",
          headers: getHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setApiConfig((prev) => ({
          ...prev,
          threadSlugs: {
            ...prev.threadSlugs,
            [workspaceSlug]: data.thread?.slug || "new-thread",
          },
        }));
        console.log(
          "Thread initialized for",
          workspaceSlug,
          ":",
          data.thread?.slug
        );
      }
    } catch (error) {
      console.error("Error initializing thread:", error);
      setApiConfig((prev) => ({
        ...prev,
        threadSlugs: {
          ...prev.threadSlugs,
          [workspaceSlug]: "fallback-thread",
        },
      }));
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !selectedWorkspace) return;

    const workspaceSlug = selectedWorkspace.slug;
    const userMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [workspaceSlug]: [...(prev[workspaceSlug] || []), userMessage],
    }));

    const messageToSend = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${apiConfig.baseUrl}/v1/workspace/${workspaceSlug}/stream-chat`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            message: messageToSend,
            mode: "chat",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = {
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => ({
        ...prev,
        [workspaceSlug]: [...(prev[workspaceSlug] || []), assistantMessage],
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.textResponse) {
                assistantMessage.content += data.textResponse;
                setMessages((prev) => {
                  const workspaceMessages = [...(prev[workspaceSlug] || [])];
                  workspaceMessages[workspaceMessages.length - 1] = {
                    ...assistantMessage,
                  };
                  return {
                    ...prev,
                    [workspaceSlug]: workspaceMessages,
                  };
                });
              }
            } catch (e) {
              console.debug("Skipping invalid JSON chunk");
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);

      setMessages((prev) => ({
        ...prev,
        [workspaceSlug]: [
          ...(prev[workspaceSlug] || []),
          {
            role: "assistant",
            content: `Error: ${error.message}\n\nPlease check your configuration.`,
            timestamp: new Date().toISOString(),
            isError: true,
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentMessages = selectedWorkspace
    ? messages[selectedWorkspace.slug] || []
    : [];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 bg-slate-800/50 backdrop-blur-sm border-r border-purple-500/20 overflow-hidden flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-purple-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">MajuUKM</h2>
              <p className="text-xs text-purple-300">Pilih Modul</p>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-slate-700/50 rounded-lg p-3 flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isAdmin() ? "bg-amber-500/20" : "bg-purple-500/20"
              }`}
            >
              {isAdmin() ? (
                <Shield className="w-4 h-4 text-amber-400" />
              ) : (
                <User className="w-4 h-4 text-purple-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-purple-300 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Workspace List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {workspaces.length === 0 ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
              <p className="text-sm text-purple-300">Loading workspaces...</p>
            </div>
          ) : (
            workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => setSelectedWorkspace(workspace)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedWorkspace?.id === workspace.id
                    ? "bg-purple-600 text-white"
                    : "bg-slate-700/50 text-purple-300 hover:bg-slate-700"
                }`}
              >
                <div className="font-semibold text-sm mb-1">
                  {workspace.name}
                </div>
                <div className="text-xs opacity-70">
                  {workspace.chatModel || "Default Model"}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-purple-500/20 space-y-2">
          {isAdmin() && (
            <button
              onClick={() => (window.location.href = "/admin")}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm">Admin Panel</span>
            </button>
          )}
          {isAdmin() && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-slate-700/50 text-purple-300 hover:bg-slate-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Settings</span>
            </button>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm border-b border-purple-500/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5 text-purple-300 lg:hidden" />
                ) : (
                  <Menu className="w-5 h-5 text-purple-300" />
                )}
              </button>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors hidden lg:block"
              >
                <Menu className="w-5 h-5 text-purple-300" />
              </button>
              {selectedWorkspace && (
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {selectedWorkspace.name}
                  </h1>
                  <p className="text-sm text-purple-300">
                    {selectedWorkspace.chatMode === "chat"
                      ? "Chat Mode"
                      : "Query Mode"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-slate-800/90 backdrop-blur-sm border-b border-purple-500/20 px-6 py-4">
            <div className="max-w-6xl mx-auto space-y-3">
              <h3 className="text-white font-semibold mb-2">
                API Configuration
              </h3>
              <div>
                <label className="text-sm text-purple-300 block mb-1">
                  Base URL
                </label>
                <input
                  type="text"
                  value={apiConfig.baseUrl}
                  onChange={(e) =>
                    setApiConfig((prev) => ({
                      ...prev,
                      baseUrl: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="http://localhost:3001"
                />
              </div>
              <div>
                <label className="text-sm text-purple-300 block mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiConfig.apiKey}
                  onChange={(e) =>
                    setApiConfig((prev) => ({
                      ...prev,
                      apiKey: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Your API Key"
                />
              </div>
              <button
                onClick={fetchWorkspaces}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Reload Workspaces
              </button>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {!selectedWorkspace ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Pilih Modul
                </h2>
                <p className="text-purple-300">
                  Pilih salah satu modul di sidebar untuk mulai chat
                </p>
              </div>
            ) : currentMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Mulai Percakapan dengan {selectedWorkspace.name}
                </h2>
                <p className="text-purple-300 max-w-2xl mx-auto text-sm">
                  {selectedWorkspace.openAiPrompt?.split("\n")[0] ||
                    "Tanyakan apa saja!"}
                </p>
              </div>
            ) : (
              currentMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                      message.role === "user"
                        ? "bg-purple-600 text-white"
                        : message.isError
                        ? "bg-red-500/20 text-red-200 border border-red-500/30"
                        : "bg-slate-800 text-white border border-purple-500/20"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words leading-relaxed">
                      {message.content}
                    </p>
                    <span className="text-xs opacity-60 mt-2 block">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-purple-500/20 rounded-2xl px-6 py-4">
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-slate-800/50 backdrop-blur-sm border-t border-purple-500/20 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 bg-slate-800 border border-purple-500/30 rounded-2xl overflow-hidden focus-within:border-purple-500">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    selectedWorkspace
                      ? "Ketik pesan Anda di sini..."
                      : "Pilih workspace dulu..."
                  }
                  rows="1"
                  disabled={!selectedWorkspace}
                  className="w-full px-6 py-4 bg-transparent text-white placeholder-purple-300/50 focus:outline-none resize-none max-h-32 disabled:opacity-50"
                  style={{ minHeight: "56px" }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={
                  !inputMessage.trim() || isLoading || !selectedWorkspace
                }
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white p-4 rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-purple-300/50 mt-2 text-center">
              Press Enter untuk kirim • Shift + Enter untuk baris baru
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
