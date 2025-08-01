import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import vscDarkPlus from "react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus";
import lightfair from "react-syntax-highlighter/dist/esm/styles/prism";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeBlock({
  code,
  language = "jsx",
  shouldCopy = false,
}: {
  code: string;
  language?: string;
  shouldCopy?: boolean;
}) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="relative mt-4 rounded-md overflow-hidden">
      {shouldCopy && (
        <button
          onClick={handleCopy}
          className="absolute top-4 right-4 z-10 flex items-center justify-center p-1.5 rounded-md transition "
          aria-label="Copy code"
        >
          {!copied ? (
            <Copy size={16} />
          ) : (
            <Check size={16} className="text-green-400" />
          )}
        </button>
      )}

      <SyntaxHighlighter
        language={language}
        style={theme === "light" ? lightfair : vscDarkPlus}
        customStyle={{
          padding: "1rem",
          borderRadius: "0.375rem",
          fontSize: "13px",
          margin: 0,
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
