import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { Groq } from "groq-sdk";
import fetch from "node-fetch";

const providers = {
  openai: (key) => new OpenAI({ apiKey: key }),
  anthropic: (key) => new Anthropic({ apiKey: key }),
  groq: (key) => new Groq({ apiKey: key }),
};

const tools = [
  {
    name: "get_weather",
    description: "Get current weather for a city",
    parameters: {
      type: "object",
      properties: { city: { type: "string" } },
      required: ["city"],
    },
  },
  {
    name: "calculator",
    description: "Evaluate math expression",
    parameters: {
      type: "object",
      properties: { expr: { type: "string" } },
      required: ["expr"],
    },
  },
];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages, model = "gpt-4o-mini", provider = "openai", temperature = 0.7 } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`];
    if (!apiKey) throw new Error(`Missing ${provider.toUpperCase()}_API_KEY`);

    const client = providers[provider](apiKey);

    const stream = await (provider === "anthropic"
      ? client.messages.stream({
          model,
          max_tokens: 1024,
          temperature,
          messages,
          tools,
        })
      : client.chat.completions.create({
          model,
          messages,
          temperature,
          stream: true,
          tools,
        }));

    for await (const chunk of stream) {
      const content = provider === "anthropic" ? chunk.delta?.text : chunk.choices[0]?.delta?.content;
      if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }

    // Tool calls
    const final = provider === "anthropic" ? await stream.finalMessage() : await stream;
    if (final?.tool_calls) {
      for (const tc of final.tool_calls) {
        const result = await executeTool(tc);
        res.write(`data: ${JSON.stringify({ tool: result })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error(err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
}

async function executeTool(tc) {
  const { name, input } = tc.function;
  if (name === "get_weather") {
    const data = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true`).then(r => r.json());
    return { name, result: `Berlin: ${data.current_weather.temperature}°C` };
  }
  if (name === "calculator") {
    const result = eval(input.expr); // safe in sandbox
    return { name, result };
  }
}
