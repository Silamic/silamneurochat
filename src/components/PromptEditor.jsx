import { useState } from "react";

export default function PromptEditor({ prompt, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-2 text-right">
      <button onClick={() => setOpen(!open)} className="text-xs opacity-70 hover:opacity-100">
        {open ? "Hide" : "Edit"} System Prompt
      </button>
      {open && (
        <textarea
          className="w-full mt-1 p-2 bg-gray-800 rounded text-sm"
          rows={3}
          value={prompt}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
