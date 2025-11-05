import React, { useState, useEffect, useRef } from 'react';
import './styles.css';

const STORAGE_KEY = 'silam_neurochat_history';

const defaultSystemMessage = {
  role: 'system',
  content: 'You are Silam, a friendly and intelligent AI assistant. Keep your responses concise and helpful.'
};

export default function App() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [defaultSystemMessage];
    } catch {
      return [defaultSystemMessage];
    }
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Temporary typing indicator
    setMessages(m => [...m, { role: 'assistant', content: 'Silam is thinking...' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await res.json();
      const reply =
        data?.choices?.[0]?.message?.content ||
        data?.generated_text ||
        'No response from Silam.';

      setMessages(m => {
        const updated = m.slice(0, -1);
        return [...updated, { role: 'assistant', content: reply }];
      });
    } catch (err) {
      setMessages(m => {
        const updated = m.slice(0, -1);
        return [...updated, { role: 'assistant', content: `Error: ${err.message}` }];
      });
    } finally {
      setLoading(false);
    }
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([defaultSystemMessage]);
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="avatar">S</div>
          <div>
            <div className="name">Silam</div>
            <div className="tagline">Your NeuroChat Assistant</div>
          </div>
        </div>
        <button className="clear-btn" onClick={clearHistory}>Clear</button>
      </header>

      <main className="chat-area">
        {messages.filter(m => m.role !== 'system').map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="bubble">{msg.content}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </main>

      <footer className="input-area">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </footer>
    </div>
  );
}
