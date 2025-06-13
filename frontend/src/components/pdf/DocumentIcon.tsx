"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import ContextMenu from "./context-menu"

interface DocumentIconProps {
  className?: string
  state?: "default" | "active" | "processing" | "success" | "error"
  size?: "sm" | "md" | "lg"
}

export default function DocumentIcon({ className = "", state = "default", size = "md" }: DocumentIconProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [hasStartedScan, setHasStartedScan] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Size configurations
  const sizeStyles = {
    sm: { width: "48px", height: "64px", fontSize: "10px", padding: "4px" },
    md: { width: "64px", height: "80px", fontSize: "12px", padding: "6px" },
    lg: { width: "96px", height: "128px", fontSize: "16px", padding: "8px" },
  }

  // State-based styling
  const stateStyles = {
    default: {
      background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
      borderColor: "#d1d5db",
      textColor: "#374151",
    },
    active: {
      background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
      borderColor: "#93c5fd",
      textColor: "#1d4ed8",
    },
    processing: {
      background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
      borderColor: "#fbbf24",
      textColor: "#92400e",
    },
    success: {
      background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
      borderColor: "#6ee7b7",
      textColor: "#065f46",
    },
    error: {
      background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
      borderColor: "#f87171",
      textColor: "#991b1b",
    },
  }

  // Handle scan animation - now triggered by summarize click, not hover
  useEffect(() => {
    if (hasStartedScan) {
      setScanComplete(false)

      // Set timeout for scan completion
      scanTimeoutRef.current = setTimeout(() => {
        setScanComplete(true)
      }, 2000) // Match the transition duration
    }

    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current)
      }
    }
  }, [hasStartedScan])

  const currentSize = sizeStyles[size]
  const currentState = stateStyles[state]

  const containerStyle: React.CSSProperties = {
    position: "relative",
    overflow: "visible", // Changed from hidden to visible to allow context menu to show
    cursor: "pointer",
    ...currentSize,
  }

  const pdfDocumentStyle: React.CSSProperties = {
    position: "relative",
    background: currentState.background,
    borderRadius: "8px",
    padding: currentSize.padding,
    width: "100%",
    height: "100%",
    border: `2px solid ${currentState.borderColor}`,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease",
    overflow: "hidden",
    transform: isHovered ? "scale(1.05)" : "scale(1)",
  }

  const cornerFoldStyle: React.CSSProperties = {
    position: "absolute",
    top: "0",
    right: "0",
    width: "12px",
    height: "12px",
    backgroundColor: currentState.borderColor,
    transform: "rotate(45deg) translate(6px, -6px)",
    zIndex: 2,
  }

  const cornerInnerStyle: React.CSSProperties = {
    position: "absolute",
    top: "0",
    right: "0",
    width: "8px",
    height: "8px",
    backgroundColor: currentState.background.split(",")[0].split("(")[1],
    borderLeft: `1px solid ${currentState.borderColor}`,
    borderBottom: `1px solid ${currentState.borderColor}`,
    zIndex: 2,
  }

  const contentLinesStyle: React.CSSProperties = {
    marginTop: size === "sm" ? "8px" : size === "md" ? "12px" : "16px",
    display: "flex",
    flexDirection: "column",
    gap: size === "sm" ? "2px" : size === "md" ? "3px" : "4px",
    position: "relative",
    zIndex: 2,
  }

  const lineBaseStyle: React.CSSProperties = {
    height: size === "sm" ? "1px" : size === "md" ? "2px" : "3px",
    backgroundColor: "#9ca3af",
    borderRadius: "1px",
    transition: "background-color 0.3s ease",
  }

  const pdfLabelStyle: React.CSSProperties = {
    position: "absolute",
    bottom: currentSize.padding,
    left: currentSize.padding,
    fontSize: currentSize.fontSize,
    fontWeight: "700",
    color: currentState.textColor,
    zIndex: 2,
    transition: "color 0.3s ease",
  }

  // Determine scan line position
  const getScanLinePosition = () => {
    if (!hasStartedScan) {
      return "translateY(-4px)" // Initial position (hidden)
    }
    if (scanComplete) {
      return `translateY(${Number.parseInt(currentSize.height) - 4}px)` // Bottom position
    }
    // If scan started but not complete, animate to bottom
    return `translateY(${Number.parseInt(currentSize.height) - 4}px)`
  }

  const scanLineStyle: React.CSSProperties = {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "4px",
    background: "linear-gradient(90deg, transparent 0%, #ef4444 50%, transparent 100%)",
    boxShadow: "0 0 15px rgba(239, 68, 68, 0.9)",
    transition: hasStartedScan ? "all 2s ease-in-out" : "opacity 0.3s ease",
    opacity: hasStartedScan ? 1 : 0,
    transform: getScanLinePosition(),
    zIndex: 3,
  }

  const handleSummarize = () => {
    console.log("Summarize document")
    // Start the scan animation when Summarize is clicked
    setHasStartedScan(true)
    // Add your summarize functionality here
  }

  return (
    <div
      className={className}
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={pdfDocumentStyle}>
        {/* Document corner fold */}
        <div style={cornerFoldStyle}></div>
        <div style={cornerInnerStyle}></div>

        {/* Document lines representing text content */}
        <div style={contentLinesStyle}>
          <div style={{ ...lineBaseStyle, width: "75%" }}></div>
          <div style={lineBaseStyle}></div>
          <div style={{ ...lineBaseStyle, width: "85%" }}></div>
          <div style={{ ...lineBaseStyle, width: "65%" }}></div>
        </div>

        {/* PDF Text */}
        <div style={pdfLabelStyle}>PDF</div>

        {/* Scan Line Animation */}
        <div style={scanLineStyle}></div>
      </div>

      {/* Context Menu as a separate component */}
      <ContextMenu isVisible={isHovered} onSummarize={handleSummarize} />
    </div>
  )
}
