import { useState, useEffect, useRef } from "react";
import ChatInput from "./components/ChatInput";
import ModelSelector from "./components/ModelSelector";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { MessageCircle, Plus, Mic, Send } from "lucide-react";

const DEFAULT_PROMPT = "You are Silam, a super-intelligent, witty, and helpful AI.";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [model, setModel] = useState("llama3-8b-8192");
  const [systemPrompt] = useState(DEFAULT_PROMPT);
  const bottomRef = useRef(null);

  useEffect(() => {
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

  const newChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-50 to-pink-100">
      {/* Sidebar */}
      <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-pink-200 p-4 flex flex-col">
        <button
          onClick={newChat}
          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-pink-300 text-pink-700 hover:bg-pink-50 transition mb-4"
        >
          <Plus size={20} />
          <span className="font-medium">New Chat</span>
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-3 text-pink-600">
          <MessageCircle size={20} />
          <span className="text-sm font-medium">Silam NeuroChat</span>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-pink-200 bg-white/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
          <ModelSelector model={model} onChange={setModel} />
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-pink-100 transition">
              <Mic size={20} className="text-pink-600" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mb-6">
                <MessageCircle size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-pink-900 mb-2">How can I help you today?</h1>
              <p className="text-pink-600">Ask anything — I'm here to help.</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xl px-5 py-3 rounded-2xl shadow-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-pink-500 to-pink-600 text-white"
                        : "bg-white text-pink-900 border border-pink-200"
                    }`}
                  >
                    {msg.role === "assistant" && i === messages.length - 1 && (
                      <button
                        onClick={regenerateLast}
                        className="float-right ml-3 text-xs opacity-70 hover:opacity-100"
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
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-pink-200 bg-white/80 backdrop-blur-sm p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={sendMessage} disabled={streaming} />
          </div>
        </div>
      </div>
    </div>
  );
}
