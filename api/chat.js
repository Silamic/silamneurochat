export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Invalid message input" });
  }

  try {
    // 🔑 Replace this key with your own from https://platform.openai.com/api-keys
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OpenAI API key." });
    }

    // Send the user's message to OpenAI's API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are Silam, a smart, friendly AI assistant." },
          { role: "user", content: message },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API Error:", errorText);
      return res.status(500).json({ error: "Error from OpenAI API" });
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I didn’t quite catch that.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: "Server error: " + err.message });
  }
}
