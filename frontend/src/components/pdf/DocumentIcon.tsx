"use client"

import React, { useState, useEffect, useRef } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import ContextMenu from "./context-menu"

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface DocumentIconProps {
  file: File
  size?: "sm" | "md" | "lg"
  isActive?: boolean
  isProcessing?: boolean
  isSuccess?: boolean
  isError?: boolean
  onSummarize?: () => void
}

export default function DocumentIcon({
  file,
  size = "md",
  isActive = false,
  isProcessing = false,
  isSuccess = false,
  isError = false,
  onSummarize,
}: DocumentIconProps) {
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [hasStartedScan, setHasStartedScan] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Create object URL for the PDF file
  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPdfUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Handle scan animation
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

  // Size configurations
  const sizeConfig = {
    sm: { width: 48, height: 64 },
    md: { width: 64, height: 84 },
    lg: { width: 80, height: 104 },
  }

  const { width, height } = sizeConfig[size]

  // Document icon styles
  const documentStyle: React.CSSProperties = {
    position: "relative",
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: "white",
    borderRadius: "4px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    overflow: "visible",
    cursor: "pointer",
    transition: "transform 0.2s ease-in-out",
    transform: isActive ? "scale(1.05)" : "scale(1)",
  }

  // Folded corner styles
  const foldedCornerStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    right: 0,
    width: "20%",
    height: "20%",
    background: "linear-gradient(135deg, transparent 50%, #f3f4f6 50%)",
    borderBottomLeftRadius: "4px",
    zIndex: 2,
  }

  // PDF preview container styles
  const previewContainerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    overflow: "hidden",
    borderRadius: "4px",
  }

  // Status indicator styles
  const statusIndicatorStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "4px",
    right: "4px",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: isError
      ? "#ef4444"
      : isSuccess
      ? "#22c55e"
      : isProcessing
      ? "#f59e0b"
      : "transparent",
    zIndex: 2,
  }

  // Scan line styles
  const scanLineStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "4px",
    background: "linear-gradient(90deg, transparent 0%, #ef4444 50%, transparent 100%)",
    boxShadow: "0 0 15px rgba(239, 68, 68, 0.9)",
    transition: hasStartedScan ? "all 2s ease-in-out" : "opacity 0.3s ease",
    opacity: hasStartedScan ? 1 : 0,
    transform: hasStartedScan
      ? `translateY(${height}px)`
      : "translateY(-4px)",
    zIndex: 3,
  }

  const handleSummarize = () => {
    if (onSummarize) {
      setHasStartedScan(true)
      onSummarize()
    }
  }

  return (
    <div
      ref={containerRef}
      style={documentStyle}
      onMouseEnter={() => setShowContextMenu(true)}
      onMouseLeave={() => setShowContextMenu(false)}
    >
      <div style={previewContainerStyle}>
        {pdfUrl && (
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<div>Loading...</div>}
          >
            <Page
              pageNumber={pageNumber}
              width={width}
              height={height}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="pdf-page-preview"
            />
          </Document>
        )}
      </div>
      <div style={foldedCornerStyle} />
      <div style={statusIndicatorStyle} />
      <div style={scanLineStyle} />
      {onSummarize && (
        <ContextMenu
          isVisible={showContextMenu}
          onSummarize={handleSummarize}
        />
      )}
    </div>
  )
}
