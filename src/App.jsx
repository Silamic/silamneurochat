import { useState } from "react";
import "./styles.css";

function App() {
  const [messages, setMessages] = useState([{ sender: "bot", text: "Hey there! How can I help you today?" }]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { sender: "bot", text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { sender: "bot", text: "Hmm, I couldn’t get a response." }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: "bot", text: "Error connecting to server." }]);
    }
  };

  return (
    <div className="chat-container">
      <h1>Silam</h1>
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
