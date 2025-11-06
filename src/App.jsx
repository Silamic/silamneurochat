import { useState, useEffect, useRef } from "react";
import ChatBubble from "./components/ChatBubble";
import ChatInput from "./components/ChatInput";
import ModelSelector from "./components/ModelSelector";
import PromptEditor from "./components/PromptEditor";
import ThemeToggle from "./components/ThemeToggle";
import CostBadge from "./components/CostBadge";
import { saveConversation, loadConversations } from "./lib/db";

const DEFAULT_PROMPT = "You are Silam, a super-intelligent, witty, and helpful AI.";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [model, setModel] = useState("gpt-4o-mini");
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT);
  const [theme, setTheme] = useState("dark");
  const esRef = useRef(null);
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

    if (esRef.current) esRef.current.close();

    const es = new EventSource("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "system", content: systemPrompt }, ...messages, userMsg],
        model,
      }),
    });

    esRef.current = es;

    es.onmessage = (e) => {
      if (e.data === "[DONE]") {
        es.close();
        setStreaming(false);
        return;
      }
      try {
        const data = JSON.parse(e.data);
        if (data.content) {
          setMessages((m) => {
            const newM = [...m];
            newM[newM.length - 1].content += data.content;
            return newM;
          });
        }
        if (data.cost) {
          setMessages((m) => {
            const newM = [...m];
            newM[newM.length - 1].cost = data.cost;
            return newM;
          });
        }
      } catch {}
    };

    es.onerror = () => {
      es.close();
      setStreaming(false);
      setMessages((m) => {
        const newM = [...m];
        newM[newM.length - 1].content += "\n\n*Connection lost.*";
        return newM;
      });
    };
  };

  const regenerateLast = () => {
    if (messages[messages.length - 1]?.role !== "assistant") return;
    setMessages((m) => m.slice(0, -1));
    const lastUser = messages[messages.length - 2];
    if (lastUser) sendMessage(lastUser.content);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto p-4">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
            Silam NeuroChat
          </h1>
          <div className="flex gap-2 items-center">
            <ModelSelector model={model} onChange={setModel} />
            <ThemeToggle theme={theme} onToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} />
            <CostBadge />
          </div>
        </header>

        <PromptEditor prompt={systemPrompt} onChange={setSystemPrompt} />

        <div className="bg-black/30 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <ChatBubble
                key={i}
                msg={msg}
                onRegenerate={i === messages.length - 1 ? regenerateLast : null}
              />
            ))}
            <div ref={bottomRef} />
          </div>
          <ChatInput onSend={sendMessage} disabled={streaming} />
        </div>
      </div>
    </div>
  );
}
