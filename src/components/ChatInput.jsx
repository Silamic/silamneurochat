import { useState } from "react";

export default function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <div className="flex gap-2">
      <input
        placeholder="Send a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
        disabled={disabled}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="px-5 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition"
      >
        Send
      </button>
    </div>
  );
}
