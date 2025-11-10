import { useState } from "react";
import { Send } from "lucide-react";

export default function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <div className="flex gap-3 items-center bg-white border border-pink-300 rounded-2xl px-4 py-3 shadow-sm">
      <input
        placeholder="Ask anything..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
        disabled={disabled}
        className="flex-1 outline-none text-pink-900 placeholder-pink-400"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transition disabled:opacity-50"
      >
        <Send size={18} />
      </button>
    </div>
  );
}
