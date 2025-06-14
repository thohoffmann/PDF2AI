"use client"

import React, { useState, useEffect, useRef } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"
import ContextMenu from "./context-menu"

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/build/pdf.worker.entry")

interface DocumentIconProps {
  file: File
  size?: "sm" | "md" | "lg"
  isActive?: boolean
  isProcessing?: boolean
  isSuccess?: boolean
  isError?: boolean
  progress?: number
  onSummarize?: () => void
}

export default function DocumentIcon({
  file,
  size = "md",
  isActive = false,
  isProcessing = false,
  isSuccess = false,
  isError = false,
  progress = 0,
  onSummarize,
}: DocumentIconProps) {
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [hasStartedScan, setHasStartedScan] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [scanPosition, setScanPosition] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const animationStartTime = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Size configurations
  const sizeConfig = {
    sm: { width: 48, height: 64 },
    md: { width: 64, height: 84 },
    lg: { width: 80, height: 104 },
  }

  const { width, height } = sizeConfig[size]

  // Create object URL for the PDF file
  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPdfUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Handle scan animation with continuous progress estimation
  useEffect(() => {
    if (hasStartedScan && !scanComplete) {
      animationStartTime.current = Date.now()
      setScanPosition(0) // Start at top

      const updateScanPosition = () => {
        if (!animationStartTime.current) return

        const elapsed = Date.now() - animationStartTime.current
        const duration = 30000 // 30 seconds total estimated duration
        
        // Use logarithmic progression for more realistic progress feel
        let progressPercent = Math.min(elapsed / duration, 1)
        
        // Apply logarithmic curve: slower at the end, faster at the beginning
        if (progressPercent < 1) {
          progressPercent = Math.log(1 + progressPercent * 9) / Math.log(10)
        }
        
        const newPosition = progressPercent * (height - 4)
        setScanPosition(newPosition)

        if (progressPercent < 1 && hasStartedScan && !scanComplete) {
          animationFrameRef.current = requestAnimationFrame(updateScanPosition)
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateScanPosition)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [hasStartedScan, scanComplete, height])

  // Detect when summary is actually complete and trigger fast completion
  useEffect(() => {
    if (hasStartedScan && isSuccess && !scanComplete) {
      setScanComplete(true)
    }
  }, [hasStartedScan, isSuccess, scanComplete])

  // Handle scan completion
  useEffect(() => {
    if (scanComplete) {
      // Cancel any ongoing animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      // Quickly move to bottom with smooth transition
      setScanPosition(height - 4)
      
      // Wait 1 second then hide
      setTimeout(() => {
        setHasStartedScan(false)
        setScanPosition(0)
      }, 1000)
    }
  }, [scanComplete, height])

  // Document icon styles
  const documentStyle: React.CSSProperties = {
    position: isExpanded ? "fixed" : "relative",
    top: isExpanded ? "50%" : "auto",
    left: isExpanded ? "50%" : "auto",
    width: isExpanded ? "80vw" : `${width}px`,
    height: isExpanded ? "80vh" : `${height}px`,
    backgroundColor: "white",
    borderRadius: "4px",
    boxShadow: isExpanded ? "0 20px 60px rgba(0, 0, 0, 0.3)" : "0 2px 4px rgba(0, 0, 0, 0.1)",
    overflow: "visible",
    cursor: isExpanded ? "default" : "pointer",
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: isExpanded 
      ? "translate(-50%, -50%) scale(1)" 
      : isActive 
      ? "scale(1.05)" 
      : "scale(1)",
    zIndex: isExpanded ? 1000 : "auto",
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
    position: "relative",
    overflow: "hidden",
    borderRadius: "4px",
  }

  // Expand button styles
  const expandButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "4px",
    right: "4px",
    width: "20px",
    height: "20px",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
    transition: "all 0.2s ease",
    opacity: isExpanded ? 1 : 0.7,
  }

  // Backdrop styles for expanded view
  const backdropStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
    opacity: isExpanded ? 1 : 0,
    visibility: isExpanded ? "visible" : "hidden",
    transition: "all 0.3s ease",
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
    transition: scanComplete ? "transform 0.5s ease-out, opacity 0.3s ease" : "opacity 0.3s ease",
    opacity: hasStartedScan ? 1 : 0,
    transform: `translateY(${scanPosition}px)`,
    zIndex: 3,
  }

  const handleSummarize = () => {
    setHasStartedScan(true)
    setScanComplete(false)
    onSummarize?.()
  }

  const handleShow = () => {
    setShowContextMenu(false)
    setIsExpanded(true)
  }

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      {/* Backdrop for expanded view */}
      <div style={backdropStyle} onClick={() => setIsExpanded(false)} />
      
      <div
        ref={containerRef}
        style={documentStyle}
        className={`document-icon ${
          isActive ? "document-icon--active" : ""
        } ${
          isProcessing ? "document-icon--processing" : ""
        } ${
          isSuccess ? "document-icon--success" : ""
        } ${
          isError ? "document-icon--error" : ""
        }`}
        onMouseEnter={() => !isExpanded && setShowContextMenu(true)}
        onMouseLeave={() => !isExpanded && setShowContextMenu(false)}
      >
        <style>
          {`
            @keyframes scan {
              0% {
                transform: translateY(0%);
              }
              100% {
                transform: translateY(100%);
              }
            }
          `}
        </style>
        <div style={foldedCornerStyle} />
        <div style={previewContainerStyle}>
          {pdfUrl && (
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={null}
            >
              <Page
                pageNumber={pageNumber}
                width={isExpanded ? Math.min(window.innerWidth * 0.75, 800) : width}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          )}
          
          {/* Expand/Collapse Button */}
          <div 
            style={expandButtonStyle}
            onClick={handleExpandClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.9)"
              e.currentTarget.style.transform = "scale(1.1)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
              e.currentTarget.style.transform = "scale(1)"
            }}
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="white"
              style={{ transition: "transform 0.2s ease" }}
            >
              {isExpanded ? (
                // Minimize icon
                <path d="M19 13H5v-2h14v2z" />
              ) : (
                // Expand icon
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              )}
            </svg>
          </div>
        </div>
        <div style={statusIndicatorStyle} />
        {hasStartedScan && <div style={scanLineStyle} />}
        {onSummarize && !isExpanded && (
          <ContextMenu
            isVisible={showContextMenu}
            onSummarize={handleSummarize}
            onShow={handleShow}
          />
        )}
      </div>
    </>
  )
}

