import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function ChatBubble({ msg, onRegenerate }) {
  return (
    <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
          msg.role === "user" ? "bg-cyan-600 text-white" : "bg-gray-700 text-gray-100"
        }`}
      >
        {msg.role === "assistant" && (
          <button
            onClick={onRegenerate}
            className="float-right ml-2 text-xs opacity-70 hover:opacity-100"
          >
            Regenerate
          </button>
        )}
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {msg.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
