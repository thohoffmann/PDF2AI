"use client"

import React, { useState, useEffect, useRef } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"
import ContextMenu from "./context-menu"
import PDFViewer from "./PDFViewer"
import { createPortal } from "react-dom"

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
  onDelete?: () => void
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
  onDelete,
}: DocumentIconProps) {
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasStartedScan, setHasStartedScan] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [scanPosition, setScanPosition] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showModal, setShowModal] = useState(false)
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

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

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

  // Keyboard navigation for expanded view (integrated mode only)
  useEffect(() => {
    if (!isExpanded || showModal) return

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault()
          goToPreviousPage()
          break
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault()
          goToNextPage()
          break
        case "Escape":
          event.preventDefault()
          handleExpandClick()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isExpanded, showModal, currentPage, numPages])

  // Document icon styles
  const isIntegratedExpanded = isExpanded && !showModal
  const documentStyle: React.CSSProperties = {
    position: "relative",
    width: isIntegratedExpanded ? "100%" : `${width}px`,
    height: isIntegratedExpanded ? "80vh" : `${height}px`,
    maxWidth: isIntegratedExpanded ? "800px" : "none",
    maxHeight: isIntegratedExpanded ? "80vh" : "none",
    margin: isIntegratedExpanded ? "20px auto" : "0",
    backgroundColor: "white",
    borderRadius: "4px",
    boxShadow: isIntegratedExpanded ? "0 10px 40px rgba(0, 0, 0, 0.15)" : "0 2px 4px rgba(0, 0, 0, 0.1)",
    overflow: "visible",
    cursor: isIntegratedExpanded ? "default" : "pointer",
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: isActive && !isIntegratedExpanded ? "scale(1.05)" : "scale(1)",
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

  // Expand button styles (only show when not in modal mode)
  const expandButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "4px",
    right: "4px",
    width: "20px",
    height: "20px",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: "50%",
    display: showModal ? "none" : "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
    transition: "all 0.2s ease",
    opacity: isIntegratedExpanded ? 1 : 0.7,
  }



  // Navigation controls styles
  const navControlsStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: "25px",
    padding: "8px 16px",
    zIndex: 11,
    opacity: isIntegratedExpanded && numPages && numPages > 1 ? 1 : 0,
    visibility: isIntegratedExpanded && numPages && numPages > 1 ? "visible" : "hidden",
    transition: "all 0.3s ease",
  }

  const navButtonStyle: React.CSSProperties = {
    backgroundColor: "transparent",
    border: "none",
    color: "white",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    width: "32px",
    height: "32px",
  }

  const pageInfoStyle: React.CSSProperties = {
    color: "white",
    fontSize: "14px",
    fontWeight: "500",
    minWidth: "60px",
    textAlign: "center",
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

  // Bottom overlay for text readability
  const bottomOverlayStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "30%",
    background: "linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)",
    borderBottomLeftRadius: "4px",
    borderBottomRightRadius: "4px",
    zIndex: 2,
    display: isIntegratedExpanded ? "none" : "block",
  }

  // File name styles
  const fileNameStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "12px",
    left: "4px",
    right: "4px",
    fontSize: "9px",
    fontWeight: "500",
    color: "white",
    zIndex: 3,
    lineHeight: "1.2",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: isIntegratedExpanded ? "none" : "block",
  }

  // File size indicator styles
  const fileSizeStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "2px",
    right: "4px",
    fontSize: "8px",
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    zIndex: 3,
    fontFamily: "monospace",
    lineHeight: "1",
    display: isIntegratedExpanded ? "none" : "block",
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
    setShowModal(true)
  }

  const handleExpandClick = () => {
    if (isExpanded) {
      // Collapsing: reset to preview mode (page 1)
      setIsExpanded(false)
      setCurrentPage(1)
    } else {
      // Expanding: enter integrated full view mode
      setIsExpanded(true)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setCurrentPage(1)
  }

  const handleDelete = () => {
    setShowContextMenu(false)
    onDelete?.()
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (numPages && currentPage < numPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <>
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
        onMouseEnter={() => !isIntegratedExpanded && setShowContextMenu(true)}
        onMouseLeave={() => !isIntegratedExpanded && setShowContextMenu(false)}
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
            
            .pdf-page-expanded {
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
              border-radius: 4px !important;
            }
            
            .pdf-page-preview {
              border-radius: 4px !important;
            }
            
            .react-pdf__Page__canvas {
              max-width: 100% !important;
              max-height: 100% !important;
              object-fit: contain !important;
            }
          `}
        </style>
        {/* Folded corner - only show in small preview mode */}
        {!isIntegratedExpanded && <div style={foldedCornerStyle} />}
        <div style={previewContainerStyle}>
          {pdfUrl && (
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={null}
            >
              <Page
                pageNumber={isIntegratedExpanded ? currentPage : 1}
                width={isIntegratedExpanded ? undefined : width}
                height={isIntegratedExpanded ? Math.min(window.innerHeight * 0.8, 1000) : undefined}
                renderTextLayer={isIntegratedExpanded}
                renderAnnotationLayer={isIntegratedExpanded}
                className={isIntegratedExpanded ? "pdf-page-expanded" : "pdf-page-preview"}
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

          {/* Navigation Controls - only visible when expanded and multi-page */}
          <div style={navControlsStyle}>
            <button
              style={{
                ...navButtonStyle,
                opacity: currentPage > 1 ? 1 : 0.5,
                cursor: currentPage > 1 ? "pointer" : "not-allowed",
              }}
              onClick={goToPreviousPage}
              disabled={currentPage <= 1}
              onMouseEnter={(e) => {
                if (currentPage > 1) {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            
            <div style={pageInfoStyle}>
              {currentPage} / {numPages}
            </div>
            
            <button
              style={{
                ...navButtonStyle,
                opacity: numPages && currentPage < numPages ? 1 : 0.5,
                cursor: numPages && currentPage < numPages ? "pointer" : "not-allowed",
              }}
              onClick={goToNextPage}
              disabled={!numPages || currentPage >= numPages}
              onMouseEnter={(e) => {
                if (numPages && currentPage < numPages) {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>
          </div>
        </div>
        {/* Bottom overlay for text readability - only show in preview mode */}
        {!isIntegratedExpanded && <div style={bottomOverlayStyle} />}
        
        {/* Status indicator - only show in preview mode */}
        {!isIntegratedExpanded && <div style={statusIndicatorStyle} />}
        
        {/* File name - only show in preview mode */}
        {!isIntegratedExpanded && (
          <div style={fileNameStyle} title={file.name}>
            {file.name}
          </div>
        )}
        
        {/* File size indicator - only show in preview mode */}
        {!isIntegratedExpanded && (
          <div style={fileSizeStyle}>
            {formatFileSize(file.size)}
          </div>
        )}
        
        {hasStartedScan && <div style={scanLineStyle} />}
        {onSummarize && !isIntegratedExpanded && (
          <ContextMenu
            isVisible={showContextMenu}
            onSummarize={handleSummarize}
            onShow={handleShow}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Modal PDF Viewer - triggered by "Show" from context menu */}
      {showModal && createPortal(
        <PDFViewer
          file={file}
          onClose={handleModalClose}
        />,
        document.body
      )}
    </>
  )
}

