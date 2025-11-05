export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse the incoming request body
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const messages = body?.messages;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request: messages array required" });
    }

    // Get API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OpenAI API key" });
    }

    // Call OpenAI Chat API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OpenAI API error",
        details: data,
      });
    }

    // Extract the assistant’s reply text
    const reply = data?.choices?.[0]?.message?.content || "No response from Silam.";

    // Send it back to frontend
    return res.status(200).json({
      reply,
      raw: data,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return res.status(500).json({
      error: "Server error",
      message: error.message,
    });
  }
}
