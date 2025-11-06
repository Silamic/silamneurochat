// src/components/ModelSelector.jsx
import { MODELS } from "../lib/models";

export default function ModelSelector({ model, onChange }) {
  return (
    <select
      value={model}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-800 text-sm rounded px-2 py-1"
    >
      {MODELS.openai.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
}
