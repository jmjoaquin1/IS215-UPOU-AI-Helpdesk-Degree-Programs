import { useState } from "react";

function extractReply(payload) {
  const inner =
    typeof payload?.body === "string" ? JSON.parse(payload.body) : payload?.body || payload;

  if (inner?.content) return inner.content;
  if (inner?.message) return inner.message;
  return JSON.stringify(inner, null, 2);
}

export default function App() {
  const [apiUrl, setApiUrl] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I’m your UPOU chatbot. Ask me about programs, courses, or faculty contacts.",
    },
  ]);

  const quickReplies = [
    "What are the MIS courses?",
    "Tell me about MIS",
    "What diploma programs are offered?",
    "Who are the FICS faculty contacts?",
  ];

  async function sendMessage(textOverride) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      let reply = "";

      if (!apiUrl.trim()) {
        reply =
          "Frontend is working. Paste your Lambda Function URL above to connect this UI to your real backend.";
      } else {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: text }),
        });

        const payload = await response.json();
        reply = extractReply(payload);
      }

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Request failed: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.sidebar}>
          <h1 style={styles.title}>UPOU Helpdesk Chatbot</h1>
          <p style={styles.subtitle}>
            Frontend prototype connected to your Lambda + S3 backend.
          </p>

          <label style={styles.label}>Lambda Function URL</label>
          <input
            style={styles.input}
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="Paste your Lambda Function URL here"
          />

          <div style={styles.infoBox}>
            <strong>Quick notes</strong>
            <ul style={styles.list}>
              <li>Leave the URL blank to test the UI only.</li>
              <li>Paste your Lambda Function URL to use the real backend.</li>
              <li>Your Lambda must allow CORS for browser requests.</li>
            </ul>
          </div>

          <div style={styles.quickReplies}>
            {quickReplies.map((reply) => (
              <button
                key={reply}
                style={styles.quickButton}
                onClick={() => sendMessage(reply)}
                disabled={loading}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.chatPanel}>
          <div style={styles.chatHeader}>Chat</div>

          <div style={styles.messages}>
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  ...styles.messageRow,
                  justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    ...styles.messageBubble,
                    ...(message.role === "user" ? styles.userBubble : styles.assistantBubble),
                  }}
                >
                  <div style={styles.messageRole}>
                    {message.role === "user" ? "You" : "Assistant"}
                  </div>
                  <div style={styles.messageText}>{message.text}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={styles.messageRow}>
                <div style={{ ...styles.messageBubble, ...styles.assistantBubble }}>
                  <div style={styles.messageRole}>Assistant</div>
                  <div style={styles.messageText}>Thinking...</div>
                </div>
              </div>
            )}
          </div>

          <div style={styles.inputRow}>
            <input
              style={styles.chatInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about UPOU programs, courses, or contacts"
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button
              style={styles.sendButton}
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "24px",
  },
  sidebar: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "24px",
  },
  subtitle: {
    margin: "0 0 20px 0",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    fontSize: "14px",
  },
  input: {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  marginBottom: "16px",
  boxSizing: "border-box",
  background: "#ffffff",
  color: "#111827",
  },
  infoBox: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "14px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  list: {
    paddingLeft: "18px",
    margin: "8px 0 0 0",
    color: "#4b5563",
  },
  quickReplies: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  quickButton: {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  cursor: "pointer",
  textAlign: "left",
  fontSize: "14px",
  fontWeight: "500",
},
  chatPanel: {
    background: "#ffffff",
    borderRadius: "18px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    minHeight: "80vh",
  },
  chatHeader: {
    padding: "18px 20px",
    borderBottom: "1px solid #e5e7eb",
    fontWeight: "bold",
    fontSize: "20px",
  },
  messages: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    background: "#f9fafb",
  },
  messageRow: {
    display: "flex",
    marginBottom: "14px",
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: "16px",
    padding: "12px 14px",
    whiteSpace: "pre-wrap",
    lineHeight: 1.5,
  },
  userBubble: {
    background: "#111827",
    color: "#ffffff",
  },
  assistantBubble: {
    background: "#ffffff",
    color: "#111827",
    border: "1px solid #e5e7eb",
  },
  messageRole: {
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "6px",
    opacity: 0.8,
  },
  messageText: {
    fontSize: "14px",
  },
  inputRow: {
    display: "flex",
    gap: "12px",
    padding: "16px 20px",
    borderTop: "1px solid #e5e7eb",
  },
  chatInput: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
  },
  sendButton: {
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#111827",
    color: "#ffffff",
    cursor: "pointer",
  },
};