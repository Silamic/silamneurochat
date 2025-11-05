import { useState } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const send = async () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input };
    setMessages([...messages, newMessage]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const assistantText = data.reply || "No response from Silam.";

      setMessages((prev) => [...prev, { role: "assistant", content: assistantText }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Error connecting to Silam." }]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Silam NeuroChat 🤖
      </h1>
      <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg max-w-xl ${
              msg.role === "user"
                ? "bg-blue-100 self-end text-right"
                : "bg-gray-200 self-start text-left"
            }`}
          >
            <b>{msg.role === "user" ? "You" : "Silam"}:</b> {msg.content}
          </div>
        ))}
      </div>
      <div className="mt-4 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-l-lg p-2"
        />
        <button
          onClick={send}
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
