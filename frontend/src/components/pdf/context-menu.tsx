"use client"

import type React from "react"

interface ContextMenuProps {
  isVisible: boolean
  onSummarize: () => void
  onShow: () => void
  onDelete: () => void
  onClose: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function ContextMenu({
  isVisible,
  onSummarize,
  onShow,
  onDelete,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: ContextMenuProps) {
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

  const menuDividerStyle: React.CSSProperties = {
    height: "1px",
    backgroundColor: "#e5e7eb",
    margin: "4px 8px",
  }

  return (
    <div 
      style={contextMenuStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        style={menuItemStyle}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onSummarize()
          onClose()
        }}
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
      <div style={menuDividerStyle} />
      <div
        style={menuItemStyle}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onShow()
          onClose()
        }}
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
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        Show
      </div>
      <div style={menuDividerStyle} />
      <div
        style={menuItemStyle}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDelete()
          onClose()
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "#fef2f2"
          e.currentTarget.style.color = "#dc2626"
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "transparent"
          e.currentTarget.style.color = "#374151"
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
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c-1 0 2 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
        Delete
      </div>
    </div>
  )
}
