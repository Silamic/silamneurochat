// api/chat.js
import OpenAI from "openai";
import { estimateTokens, calculateCost, logMessageCost, getTodayCost } from "../src/lib/cost.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages, model = "gpt-4o-mini", temperature = 0.7 } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

    const client = new OpenAI({ apiKey });
    const stream = await client.chat.completions.create({
      model,
      messages,
      temperature,
      stream: true,
    });

    let inputTokens = 0;
    let outputTokens = 0;
    let streamedContent = "";

    for (const msg of messages) {
      inputTokens += estimateTokens(msg.content);
    }

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        streamedContent += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    outputTokens = estimateTokens(streamedContent);
    const cost = calculateCost(model, inputTokens, outputTokens);
    await logMessageCost({ model, inputTokens, outputTokens, cost });

    res.write(`data: ${JSON.stringify({ cost: cost.toFixed(6), totalToday: await getTodayCost() })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error(err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
}
