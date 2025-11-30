import React, { useState, useEffect } from "react";
import { MessageSquare, Trash2, Plus, Loader2 } from "lucide-react";
import {
  getWorkspaceThreads,
  createNewThread,
  deleteThread,
} from "../utils/anythingllm";

function ThreadList({
  workspaceSlug,
  currentThreadSlug,
  onThreadSelect,
  onNewThread,
}) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (workspaceSlug) {
      loadThreads();
    }
  }, [workspaceSlug]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const data = await getWorkspaceThreads(workspaceSlug);

      console.log("Raw threads data:", data);

      // Handle different response structures
      let threadList = [];

      if (data.threads && Array.isArray(data.threads)) {
        threadList = data.threads;
      } else if (data.workspace && data.workspace.threads) {
        threadList = data.workspace.threads;
      } else if (Array.isArray(data)) {
        threadList = data;
      }

      console.log("Parsed thread list:", threadList);
      setThreads(threadList);
    } catch (error) {
      console.error("Failed to load threads:", error);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewThread = async () => {
    try {
      setCreating(true);
      const result = await createNewThread(workspaceSlug);

      console.log("New thread created:", result);

      // Reload threads
      await loadThreads();

      // Notify parent
      if (onNewThread && result.thread) {
        onNewThread(result.thread);
      }
    } catch (error) {
      console.error("Failed to create thread:", error);
      alert("Gagal membuat thread baru: " + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteThread = async (threadSlug, e) => {
    e.stopPropagation();

    if (!confirm("Hapus percakapan ini?")) return;

    try {
      await deleteThread(workspaceSlug, threadSlug);

      // Reload threads
      await loadThreads();

      // If deleted current thread, create new one
      if (threadSlug === currentThreadSlug) {
        await handleNewThread();
      }
    } catch (error) {
      console.error("Failed to delete thread:", error);
      alert("Gagal menghapus thread: " + error.message);
    }
  };

  const getThreadTitle = (thread) => {
    // Try to get a meaningful title
    if (thread.name && thread.name !== "Thread") {
      return thread.name;
    }

    // Use first few chars of slug as title
    return `Chat ${thread.slug.substring(0, 8)}...`;
  };

  const getThreadDate = (thread) => {
    if (!thread.createdAt) return "";

    try {
      return new Date(thread.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* New Thread Button */}
      <button
        onClick={handleNewThread}
        disabled={creating}
        className="w-full flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors"
      >
        {creating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        <span>Thread Baru</span>
      </button>

      {/* Thread List */}
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {threads.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            Belum ada percakapan
          </p>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.slug}
              onClick={() => onThreadSelect(thread)}
              className={`
                group relative flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors
                ${
                  thread.slug === currentThreadSlug
                    ? "bg-purple-600 text-white"
                    : "bg-slate-700/50 hover:bg-slate-700 text-slate-200"
                }
              `}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {getThreadTitle(thread)}
                </p>
                <p className="text-xs opacity-70 truncate">
                  {getThreadDate(thread)}
                </p>
              </div>
              <button
                onClick={(e) => handleDeleteThread(thread.slug, e)}
                className={`
                  opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-opacity
                  ${
                    thread.slug === currentThreadSlug
                      ? "text-white"
                      : "text-red-400"
                  }
                `}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ThreadList;
