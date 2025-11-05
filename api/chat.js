export default async function handler(req, res) {
  try {
    const { message } = await req.json();

    if (!message) {
      return res.status(400).json({ reply: "No message provided." });
    }

    // ✅ Use the OpenAI API (or your backend logic)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();

    // If OpenAI returns an error
    if (data.error) {
      return res.status(500).json({ reply: "Silam failed to reply." });
    }

    const reply =
      data.choices?.[0]?.message?.content?.trim() || "No response from Silam.";

    res.status(200).json({ reply });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ reply: "Error connecting to Silam." });
  }
}
