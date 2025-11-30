const API_BASE = "http://148.230.97.68:3001/api/v1";
const API_KEY = "62A184M-G7P4QRQ-JJTAMAW-35Z6SFA";

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  accept: "application/json",
};

// ===== WORKSPACES =====

export async function getAllWorkspaces() {
  try {
    console.log("📋 Fetching all workspaces...");

    const response = await fetch(`${API_BASE}/workspaces`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workspaces: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Workspaces loaded:", data);
    return data.workspaces || [];
  } catch (error) {
    console.error("❌ Error fetching workspaces:", error);
    throw error;
  }
}

export async function getWorkspaceInfo(workspaceSlug) {
  try {
    const response = await fetch(`${API_BASE}/workspace/${workspaceSlug}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch workspace info");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching workspace info:", error);
    throw error;
  }
}

// ===== THREADS =====

export async function getWorkspaceThreads(workspaceSlug) {
  try {
    console.log(`📥 Fetching threads for: ${workspaceSlug}`);

    const response = await fetch(
      `${API_BASE}/workspace/${workspaceSlug}/threads`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch threads: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Threads loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching threads:", error);
    throw error;
  }
}

export async function createNewThread(workspaceSlug) {
  try {
    console.log(`📤 Creating new thread for: ${workspaceSlug}`);

    const response = await fetch(
      `${API_BASE}/workspace/${workspaceSlug}/thread/new`,
      {
        method: "POST",
        headers,
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to create thread: ${response.status} - ${text}`);
    }

    const data = await response.json();
    console.log("✅ Thread created:", data);
    return data;
  } catch (error) {
    console.error("❌ Error creating thread:", error);
    throw error;
  }
}

export async function getThreadChats(workspaceSlug, threadSlug) {
  try {
    console.log(`📥 Fetching chats for thread: ${threadSlug}`);

    const response = await fetch(
      `${API_BASE}/workspace/${workspaceSlug}/thread/${threadSlug}/chats`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch chats: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Chats loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching chats:", error);
    throw error;
  }
}

export async function deleteThread(workspaceSlug, threadSlug) {
  try {
    console.log(`🗑️ Deleting thread: ${threadSlug}`);

    const response = await fetch(
      `${API_BASE}/workspace/${workspaceSlug}/thread/${threadSlug}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete thread: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Thread deleted");
    return data;
  } catch (error) {
    console.error("❌ Error deleting thread:", error);
    throw error;
  }
}

// ===== CHAT =====

export async function sendMessageToThread(
  workspaceSlug,
  threadSlug,
  message,
  mode = "chat"
) {
  try {
    console.log(`📤 Sending message to thread: ${threadSlug}`);
    console.log(`Message: ${message.substring(0, 50)}...`);

    const response = await fetch(
      `${API_BASE}/workspace/${workspaceSlug}/thread/${threadSlug}/chat`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          message,
          mode,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to send message: ${response.status} - ${text}`);
    }

    const data = await response.json();
    console.log("✅ Message sent:", data);
    return data;
  } catch (error) {
    console.error("❌ Error sending message:", error);
    throw error;
  }
}

export async function streamChatToThread(
  workspaceSlug,
  threadSlug,
  message,
  onChunk
) {
  try {
    console.log(`📤 Streaming chat to thread: ${threadSlug}`);

    const response = await fetch(
      `${API_BASE}/workspace/${workspaceSlug}/thread/${threadSlug}/stream-chat`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          message,
          mode: "chat",
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Stream failed: ${response.status} - ${text}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (onChunk) onChunk(data);
          } catch (e) {
            console.error("Error parsing SSE:", e);
          }
        }
      }
    }

    console.log("✅ Stream completed");
    return { success: true };
  } catch (error) {
    console.error("❌ Error streaming:", error);
    throw error;
  }
}

// ===== SUGGESTED MESSAGES (Optional) =====

export async function getSuggestedMessages(workspaceSlug) {
  try {
    const response = await fetch(
      `${API_BASE}/workspace/${workspaceSlug}/suggested-messages`,
      { headers }
    );

    if (!response.ok) {
      return { suggestions: [] };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching suggested messages:", error);
    return { suggestions: [] };
  }
}
