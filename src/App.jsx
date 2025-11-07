import { useState, useEffect, useRef } from "react";
import ChatInput from "./components/ChatInput";
import ModelSelector from "./components/ModelSelector";
import ThemeToggle from "./components/ThemeToggle";
import CostBadge from "./components/CostBadge";
import { saveConversation, loadConversations } from "./lib/db";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const DEFAULT_PROMPT = "You are Silam, a super-intelligent, witty, and helpful AI.";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [model, setModel] = useState("llama3-8b-8192");
  const [systemPrompt] = useState(DEFAULT_PROMPT);
  const [theme, setTheme] = useState("light");
  const bottomRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  useEffect(() => {
    (async () => {
      const convos = await loadConversations();
      if (convos.length) setMessages(convos[0].messages);
    })();
  }, []);

  useEffect(() => {
    if (messages.length) saveConversation(messages);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setStreaming(true);

    const assistantMsg = { role: "assistant", content: "" };
    setMessages((m) => [...m, assistantMsg]);

    const payload = {
      messages: [{ role: "system", content: systemPrompt }, ...messages, userMsg],
      model,
    };

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.body) {
      setStreaming(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

      for (const line of lines) {
        const dataStr = line.slice(6);
        if (dataStr === "[DONE]") {
          setStreaming(false);
          return;
        }
        try {
          const data = JSON.parse(dataStr);
          if (data.content) {
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1].content += data.content;
              return copy;
            });
          }
          if (data.cost) {
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1].cost = data.cost;
              return copy;
            });
          }
          if (data.error) {
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1].content += `\n\n*Error: ${data.error}*`;
              return copy;
            });
            setStreaming(false);
          }
        } catch {}
      }
    }
    setStreaming(false);
  };

  const regenerateLast = () => {
    if (messages[messages.length - 1]?.role !== "assistant") return;
    setMessages((m) => m.slice(0, -1));
    const lastUser = messages[messages.length - 2];
    if (lastUser) sendMessage(lastUser.content);
  };

  return (
    <div className="min-h-screen flex flex-col bg-pink-50">
      {/* Header */}
      <header className="border-b border-pink-200 bg-white/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-semibold text-pink-700">Silam NeuroChat</h1>
        <div className="flex items-center gap-3">
          <ModelSelector model={model} onChange={setModel} />
          <ThemeToggle theme={theme} onToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} />
          <CostBadge />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-2xl px-5 py-3 rounded-2xl shadow-sm ${
                msg.role === "user"
                  ? "bg-pink-500 text-white"
                  : "bg-white text-gray-800 border border-pink-100"
              }`}
            >
              {msg.role === "assistant" && i === messages.length - 1 && (
                <button
                  onClick={regenerateLast}
                  className="float-right ml-2 text-xs opacity-70 hover:opacity-100 text-pink-600"
                >
                  Regenerate
                </button>
              )}
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                className="prose prose-sm max-w-none text-inherit"
              >
                {msg.content}
              </ReactMarkdown>
              {msg.cost && (
                <div className="text-xs opacity-70 mt-2 font-mono">
                  Cost: <strong>${parseFloat(msg.cost).toFixed(6)}</strong>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-pink-200 bg-white/80 backdrop-blur-sm p-4">
        <ChatInput onSend={sendMessage} disabled={streaming} />
      </div>
    </div>
  );
}
