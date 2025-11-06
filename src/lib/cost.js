// src/lib/cost.js
import { PRICING } from "./pricing.js";
import { initDB } from "./db.js";

const COST_STORE = "cost_log";

export async function initCostDB() {
  const db = await initDB();
  if (!db.objectStoreNames.contains(COST_STORE)) {
    // Created on first write
  }
}

export function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

export function calculateCost(model, inputTokens, outputTokens) {
  const rates = PRICING.openai[model];
  if (!rates) return 0;
  return (inputTokens * rates.input + outputTokens * rates.output) / 1_000_000;
}

export async function logMessageCost({ model, inputTokens, outputTokens, cost }) {
  const db = await initDB();
  const date = new Date().toISOString().split("T")[0];
  const key = `${date}_${model}`;

  const existing = await db.get(COST_STORE, key);
  const updated = {
    id: key,
    date,
    model,
    inputTokens: (existing?.inputTokens || 0) + inputTokens,
    outputTokens: (existing?.outputTokens || 0) + outputTokens,
    cost: (existing?.cost || 0) + cost,
    count: (existing?.count || 0) + 1,
  };

  await db.put(COST_STORE, updated);
  return updated;
}

export async function getTodayCost() {
  await initCostDB();
  const db = await initDB();
  const today = new Date().toISOString().split("T")[0];
  const all = await db.getAll(COST_STORE);
  return all
    .filter((c) => c.date === today)
    .reduce((sum, c) => sum + c.cost, 0)
    .toFixed(4);
}

export async function getTotalCost() {
  await initCostDB();
  const db = await initDB();
  const all = await db.getAll(COST_STORE);
  return all.reduce((sum, c) => sum + c.cost, 0).toFixed(4);
}
