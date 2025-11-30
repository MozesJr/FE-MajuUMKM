import React from "react";
import ReactMarkdown from "react-markdown";

function MessageContent({ content }) {
  return (
    <ReactMarkdown
      components={{
        // Paragraphs
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,

        // Bold text
        strong: ({ children }) => (
          <strong className="font-bold">{children}</strong>
        ),

        // Italic text
        em: ({ children }) => <em className="italic">{children}</em>,

        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
        ),

        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-2 space-y-1">
            {children}
          </ol>
        ),

        li: ({ children }) => <li className="ml-2">{children}</li>,

        // Headings
        h1: ({ children }) => (
          <h1 className="text-xl font-bold mb-2">{children}</h1>
        ),

        h2: ({ children }) => (
          <h2 className="text-lg font-bold mb-2">{children}</h2>
        ),

        h3: ({ children }) => (
          <h3 className="text-base font-bold mb-2">{children}</h3>
        ),

        // Code blocks
        code: ({ inline, children }) =>
          inline ? (
            <code className="bg-slate-800 px-1 py-0.5 rounded text-sm">
              {children}
            </code>
          ) : (
            <pre className="bg-slate-800 p-3 rounded mb-2 overflow-x-auto">
              <code>{children}</code>
            </pre>
          ),

        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-300 hover:text-purple-200 underline"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default MessageContent;
