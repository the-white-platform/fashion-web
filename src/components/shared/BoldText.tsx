import React from 'react'

/**
 * Renders a plain string that may contain markdown-style **bold** segments.
 * Splits on `**...**` runs and wraps bold portions in `<strong>`.
 * Line breaks inside the string are preserved by parent `whitespace-pre-line`.
 */
export function BoldText({ text, className }: { text: string; className?: string }) {
  // Split on double-asterisk pairs; odd-indexed chunks are the bold content.
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return (
    <span className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i}>{part}</strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </span>
  )
}
