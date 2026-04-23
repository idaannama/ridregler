import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "@/types/chat";

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm overflow-hidden ${
          isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{message.content}</span>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h1>,
              h2: ({ children }) => <h2 className="text-sm font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0">{children}</h3>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              code: ({ children }) => <code className="bg-gray-200 px-1 rounded text-xs font-mono">{children}</code>,
              table: ({ children }) => (
                <div className="overflow-x-auto mb-2">
                  <table className="text-xs border-collapse w-full">{children}</table>
                </div>
              ),
              th: ({ children }) => <th className="border border-gray-300 bg-gray-200 px-2 py-1 text-left font-semibold">{children}</th>,
              td: ({ children }) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
              img: ({ src, alt }) => (
                <span className="block my-3">
                  <img
                    src={src}
                    alt={alt ?? ""}
                    className="max-w-full rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    style={{ maxHeight: "320px", objectFit: "contain" }}
                    onClick={() => window.open(src as string, "_blank")}
                  />
                  {alt && <span className="block text-xs text-gray-500 mt-1 italic">{alt}</span>}
                </span>
              ),
              a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="glitter-link break-all">{children}</a>,
              hr: () => <hr className="border-gray-300 my-2" />,
              blockquote: ({ children }) => <blockquote className="border-l-2 border-gray-400 pl-3 italic text-gray-700 my-2">{children}</blockquote>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
