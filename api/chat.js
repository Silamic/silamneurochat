export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await req.json?.() || req.body;
    const messages = body?.messages;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array required' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing OpenAI API key' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: 'OpenAI API error', details: errText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Server error', message: e.message });
  }
}
