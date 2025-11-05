import { useState } from "react";
import "./styles.css";

function App() {
  const [messages, setMessages] = useState([
    { sender: "Silam", text: "Hey there 👋 I'm Silam NeuroChat. How can I help?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "You", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const assistantText = data.reply || "No response from Silam.";

      setMessages([...newMessages, { sender: "Silam", text: assistantText }]);
    } catch (err) {
      console.error("Error:", err);
      setMessages([
        ...newMessages,
        { sender: "Silam", text: "⚠️ Connection issue. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-container">
      <h1 className="chat-title">Silam NeuroChat 🤖</h1>
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${
              msg.sender === "You" ? "user-message" : "ai-message"
            }`}
          >
            <strong>{msg.sender}:</strong> <span>{msg.text}</span>
          </div>
        ))}
        {loading && <div className="typing">Silam is thinking...</div>}
      </div>
      <div className="input-area">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;
