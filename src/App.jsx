const send = async () => {
  if (!input.trim()) return;

  const userMessage = { sender: "You", text: input };
  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  setLoading(true);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();
    const assistantText = data.reply || "No response from Silam.";

    const botMessage = { sender: "Silam", text: assistantText };
    setMessages((prev) => [...prev, botMessage]);
  } catch (err) {
    console.error("Error:", err);
    const errorMessage = {
      sender: "Silam",
      text: "Error connecting to Silam.",
    };
    setMessages((prev) => [...prev, errorMessage]);
  } finally {
    setLoading(false);
  }
};
