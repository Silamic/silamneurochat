import React, { useState, useEffect, useRef } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text) return;

    const userMsg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        setMessages((m) => [...m, { role: "assistant", content: "Error: " + (err.error || err.message) }]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const assistantText = data.reply || "No response from Silam.";
      setMessages((m) => [...m, { role: "assistant", content: assistantText }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Error connecting to Silam." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="avatar">🤖</div>
          <div className="titles">
            <h1>Silam NeuroChat</h1>
            <p>Hey there! How can I help you today?</p>
          </div>
        </div>
      </header>

      <main className="chat">
        {messages.map((m, i) => (
          <div key={i} className={"msg " + (m.role === "assistant" ? "assistant" : "user")}>
            <div className="bubble">
              <strong>{m.role === "assistant" ? "Silam" : "You"}:</strong> {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </main>

      <footer className="composer">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={loading}
        />
        <button onClick={send} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </footer>
    </div>
  );
}
