export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    // This is your simple “AI” response logic
    // Later you can replace this with OpenAI, Gemini, or your backend logic
    let reply = "I'm not sure I understood that.";

    if (message.toLowerCase().includes("hi")) reply = "Hey you 😄";
    else if (message.toLowerCase().includes("how are you")) reply = "I'm doing great, thanks for asking!";
    else if (message.toLowerCase().includes("bye")) reply = "Goodbye 👋";
    else reply = `You said: "${message}"`;

    // ✅ Always respond with a JSON object containing `reply`
    res.status(200).json({ reply });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ reply: "A server error occurred." });
  }
}
