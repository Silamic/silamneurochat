import OpenAI from "openai";
import { estimateTokens, calculateCost, logMessageCost } from "../src/lib/cost.js";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  let body = "";
  for await (const chunk of req) body += chunk;
  const { messages = [], model = "gpt-4o-mini", temperature = 0.7 } = JSON.parse(body || "{}");

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const stream = await client.chat.completions.create({
      model,
      messages,
      temperature,
      stream: true,
    });

    let inputTokens = 0;
    let streamed = "";

    for (const m of messages) inputTokens += estimateTokens(m.content);

    for await (const chunk of stream) {
      const txt = chunk.choices[0]?.delta?.content || "";
      if (txt) {
        streamed += txt;
        res.write(`data: ${JSON.stringify({ content: txt })}\n\n`);
      }
    }

    const outputTokens = estimateTokens(streamed);
    const cost = calculateCost(model, inputTokens, outputTokens);
    await logMessageCost({ model, inputTokens, outputTokens, cost });

    res.write(`data: ${JSON.stringify({ cost: cost.toFixed(6) })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (e) {
    console.error(e);
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
    res.end();
  }
}
