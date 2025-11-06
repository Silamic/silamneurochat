export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
