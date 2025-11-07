import { MODELS } from "../lib/models";

export default function ModelSelector({ model, onChange }) {
  return (
    <select
      value={model}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 rounded-lg border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
    >
      {MODELS.groq.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
}
