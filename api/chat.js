export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    // 🧠 Simulate AI thinking (you can later plug in a real OpenAI API here)
    const replies = {
      hi: "Hey there 👋 I'm Silam — your NeuroChat assistant.",
      hello: "Hi! How are you feeling today?",
      "how are you": "I'm doing great, just processing thoughts in 0s and 1s 🤖",
      "what is money": "Money is a medium of exchange — something humans created to measure value 💸",
    };

    // find a relevant response or default
    const lower = message.toLowerCase();
    const reply =
      replies[lower] ||
      `You said: "${message}". I'm still learning to answer that better!`;

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ reply: "Server error: Could not process your request." });
  }
}
