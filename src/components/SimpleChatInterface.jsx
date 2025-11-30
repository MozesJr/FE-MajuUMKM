import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://148.230.97.68:3001/api";
const API_KEY = "62A184M-G7P4QRQ-JJTAMAW-35Z6SFA";

function SimpleChatInterface() {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentWorkspace] = useState("majuukm");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      },
    ]);

    setIsLoading(true);

    try {
      // Test simple chat endpoint
      const response = await fetch(
        `${API_BASE}/v1/workspace/${currentWorkspace}/chat`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            mode: "chat",
          }),
        }
      );

      console.log("Response status:", response.status);
      console.log("Content-Type:", response.headers.get("content-type"));

      const text = await response.text();
      console.log("Response preview:", text.substring(0, 200));

      if (response.ok) {
        const data = JSON.parse(text);

        // Add assistant message
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.textResponse || data.message || "No response",
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        throw new Error(`Request failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">
              MajuUKM - Simple Test
            </h1>
            <p className="text-purple-300 text-sm">User: {user?.username}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
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
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-slate-800 border-t border-slate-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ketik pertanyaan..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white rounded-lg flex items-center gap-2"
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
    </div>
  );
}

export default SimpleChatInterface;
