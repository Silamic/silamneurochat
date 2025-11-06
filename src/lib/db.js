import { openDB } from "idb";

const DB_NAME = "SilamChat";
const STORE = "conversations";

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      if (!db.objectStoreNames.contains("cost_log")) {
        db.createObjectStore("cost_log", { keyPath: "id" });
      }
    },
  });
}

export async function saveConversation(messages) {
  const db = await initDB();
  await db.put(STORE, { messages, timestamp: Date.now() });
}

export async function loadConversations() {
  const db = await initDB();
  return db.getAll(STORE);
}
