import { MODELS } from "../lib/models";

export default function ModelSelector({ model, onChange }) {
  return (
    <select
      value={model}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2 rounded-xl border border-pink-300 text-pink-700 bg-white hover:bg-pink-50 transition text-sm font-medium"
    >
      {MODELS.groq.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
}
