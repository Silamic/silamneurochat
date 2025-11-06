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
  const [provider, setProvider] = useState("openai");
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT);
  const [theme, setTheme] = useState("dark");
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
      provider,
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
    <div className={`min-h-screen ${theme === "dark" ? "dark" : "light"}`}>
      <div className="app-container">

        <header className="header">
          <h1 className="title">Silam NeuroChat</h1>
          <div className="controls">
            <ModelSelector model={model} provider={provider} onChange={setModel} onProviderChange={setProvider} />
            <ThemeToggle theme={theme} onToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} />
            <CostBadge className="cost-badge" />
          </div>
        </header>

        <div className="prompt-editor">
          <PromptEditor prompt={systemPrompt} onChange={setSystemPrompt} />
        </div>

        <div className="chat-box">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`bubble ${msg.role === "user" ? "user-bubble" : "bot-bubble"}`}
              style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start" }}
            >
              {msg.role === "assistant" && i === messages.length - 1 && (
                <button className="regen-btn" onClick={regenerateLast}>Regenerate</button>
              )}
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {msg.content}
              </ReactMarkdown>
              {msg.cost && <div className="cost">Cost: <strong>${parseFloat(msg.cost).toFixed(6)}</strong></div>}
            </div>
          ))}
          <div ref={bottomRef}
