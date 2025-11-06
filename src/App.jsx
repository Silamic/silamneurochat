import React, { useState } from "react";
import "./styles.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "You", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const reply = data.reply || "No response from Silam.";
      setMessages((prev) => [...prev, { sender: "Silam", text: reply }]);
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "Silam", text: "Error connecting to Silam." },
      ]);
    }
  };

  return (
    <div className="chat-container">
      <h1 className="title">Silam NeuroChat 🤖</h1>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === "You" ? "user" : "bot"}`}
          >
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
