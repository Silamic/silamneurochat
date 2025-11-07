export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg bg-pink-100 text-pink-700 hover:bg-pink-200 transition"
    >
      {theme === "light" ? "Dark" : "Light"}
    </button>
  );
}
