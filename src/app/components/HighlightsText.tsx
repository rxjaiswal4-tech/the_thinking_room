import React from "react";

interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
}

export function HighlightText({ text, query, className = "" }: HighlightTextProps) {
  if (!query.trim() || !text) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters in the search query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  
  // Split on query while keeping match via capture group ()
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-[#EFE8D8] text-[#1A1816] font-medium px-0.5 rounded transition-colors"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}