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
    <div className="flex gap-2 p-4 border-t border-gray-700">
      <input
        className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        placeholder="Ask Silam anything..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        disabled={disabled}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="px-5 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}
