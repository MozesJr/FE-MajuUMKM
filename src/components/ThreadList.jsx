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
    loadThreads();
  }, [workspaceSlug]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const data = await getWorkspaceThreads(workspaceSlug);

      // AnythingLLM returns threads array directly in workspace data
      // or { threads: [...] }
      const threadList = Array.isArray(data) ? data : data.threads || [];

      console.log("Thread list loaded:", threadList);
      setThreads(threadList);
    } catch (error) {
      console.error("Failed to load threads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewThread = async () => {
    try {
      setCreating(true);
      const newThread = await createNewThread(workspaceSlug);

      await loadThreads(); // Reload list

      if (onNewThread) {
        onNewThread(newThread.thread);
      }
    } catch (error) {
      console.error("Failed to create thread:", error);
      alert("Gagal membuat thread baru");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteThread = async (threadSlug, e) => {
    e.stopPropagation();

    if (!confirm("Hapus percakapan ini?")) return;

    try {
      await deleteThread(workspaceSlug, threadSlug);
      await loadThreads();

      // If deleted current thread, create new one
      if (threadSlug === currentThreadSlug && onNewThread) {
        handleNewThread();
      }
    } catch (error) {
      console.error("Failed to delete thread:", error);
      alert("Gagal menghapus thread");
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
      <div className="space-y-1">
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
                  {thread.name || `Thread ${thread.slug.slice(0, 8)}`}
                </p>
                {thread.createdAt && (
                  <p className="text-xs opacity-70 truncate">
                    {new Date(thread.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
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
