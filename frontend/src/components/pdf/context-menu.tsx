"use client"

import type React from "react"

interface ContextMenuProps {
  isVisible: boolean
  onSummarize: () => void
}

export default function ContextMenu({ isVisible, onSummarize }: ContextMenuProps) {
  // Context menu styles
  const contextMenuStyle: React.CSSProperties = {
    position: "absolute",
    top: "0",
    left: `calc(100% + 2px)`, // Reduced from 8px to 2px to position closer to the document
    background: "white",
    borderRadius: "6px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    padding: "4px 0",
    minWidth: "100px",
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateX(0)" : "translateX(-10px)",
    transition: "all 0.2s ease-in-out",
    pointerEvents: isVisible ? "auto" : "none",
    zIndex: 10,
  }

  const menuItemStyle: React.CSSProperties = {
    padding: "1px 12px", // Reduced from 6px to 1px (10px reduction in height)
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#374151",
    transition: "background-color 0.1s ease",
    borderRadius: "4px",
    margin: "2px 4px",
  }

  return (
    <div style={contextMenuStyle}>
      <div
        style={menuItemStyle}
        onClick={onSummarize}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "#f3f4f6"
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "transparent"
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="21" y1="6" x2="3" y2="6"></line>
          <line x1="17" y1="12" x2="3" y2="12"></line>
          <line x1="13" y1="18" x2="3" y2="18"></line>
        </svg>
        Summarize
      </div>
    </div>
  )
}
