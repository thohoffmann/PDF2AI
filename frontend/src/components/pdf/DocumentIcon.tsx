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
  summary?: string | null
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
  summary = null,
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
  const [showSummaryExpanded, setShowSummaryExpanded] = useState(false)
  const animationStartTime = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Drag functionality state
  const [isDragging, setIsDragging] = useState(false)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hasDragged, setHasDragged] = useState(false)
  const dragStartPos = useRef({ x: 0, y: 0 })

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
    if (hasStartedScan && isSuccess && summary && !scanComplete) {
      // Add a small delay to let the scan animation show for a bit
      const timer = setTimeout(() => {
        setScanComplete(true)
      }, 1000) // 1 second minimum scan time
      
      return () => clearTimeout(timer)
    }
  }, [hasStartedScan, isSuccess, summary, scanComplete])



  // Handle scan completion
  useEffect(() => {
    if (scanComplete) {
      // Cancel any ongoing animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      // Immediately hide scan line when complete
      setHasStartedScan(false)
      setScanPosition(0)
      
      // Auto-expand summary if available
      if (summary && isSuccess) {
        setTimeout(() => {
          setShowSummaryExpanded(true)
        }, 300) // Small delay after scan line disappears
      }
    }
  }, [scanComplete, height, summary, isSuccess])

  // Keyboard navigation for expanded view (integrated mode only)
  useEffect(() => {
    if ((!isExpanded && !showSummaryExpanded) || showModal) return

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp":
          if (!showSummaryExpanded) {
            event.preventDefault()
            goToPreviousPage()
          }
          break
        case "ArrowRight":
        case "ArrowDown":
          if (!showSummaryExpanded) {
            event.preventDefault()
            goToNextPage()
          }
          break
        case "Escape":
          event.preventDefault()
          if (showSummaryExpanded) {
            setShowSummaryExpanded(false)
          } else {
            handleExpandClick()
          }
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isExpanded, showSummaryExpanded, showModal, currentPage, numPages])

  // Document icon styles  
  // Only expand if we're not currently scanning
  const isIntegratedExpanded = (isExpanded && !showModal) || (showSummaryExpanded && !hasStartedScan)
  console.log('Render state:', { isIntegratedExpanded, isExpanded, showSummaryExpanded, hasStartedScan, showModal })
  const documentStyle: React.CSSProperties = {
    position: "relative",
    width: isIntegratedExpanded ? "100%" : `${width}px`,
    height: isIntegratedExpanded ? "80vh" : `${height}px`,
    maxWidth: isIntegratedExpanded ? "800px" : "none",
    maxHeight: isIntegratedExpanded ? "80vh" : "none",
    margin: isIntegratedExpanded ? "20px auto" : "0",
    backgroundColor: (isExpanded && !showSummaryExpanded) || showSummaryExpanded ? "transparent" : "white",
    borderRadius: (isExpanded && !showSummaryExpanded) || showSummaryExpanded ? "0" : "4px",
    boxShadow: isIntegratedExpanded ? "none" : "0 2px 4px rgba(0, 0, 0, 0.1)",
    overflow: "visible",
    cursor: isIntegratedExpanded ? "default" : isDragging ? "grabbing" : "grab",
    transition: isDragging ? "none" : "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: isIntegratedExpanded 
      ? "scale(1)" 
      : `translate(${dragPosition.x}px, ${dragPosition.y}px) ${isActive ? "scale(1.05)" : "scale(1)"}`,
    zIndex: isDragging ? 1000 : isIntegratedExpanded ? "auto" : 10,
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

  // Expand button styles (only show when not in modal mode and not in PDF expanded mode)
  const expandButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "4px",
    right: "4px",
    width: "20px",
    height: "20px",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: "50%",
    display: showModal || (isExpanded && !showSummaryExpanded) || showSummaryExpanded ? "none" : "flex",
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
    opacity: isExpanded && !showSummaryExpanded && numPages && numPages > 1 ? 1 : 0,
    visibility: isExpanded && !showSummaryExpanded && numPages && numPages > 1 ? "visible" : "hidden",
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
    textAlign: "center",
    display: isIntegratedExpanded ? "none" : "block",
  }

  // File size indicator styles
  const fileSizeStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "2px",
    right: "4px",
    fontSize: "7px",
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

  const [isHovered, setIsHovered] = useState(false)
  const [menuCloseTimeout, setMenuCloseTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleMenuMouseEnter = () => {
    if (menuCloseTimeout) {
      clearTimeout(menuCloseTimeout)
      setMenuCloseTimeout(null)
    }
    setShowContextMenu(true)
  }

  const handleMenuMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowContextMenu(false)
    }, 300) // 300ms delay before closing
    setMenuCloseTimeout(timeout)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (menuCloseTimeout) {
        clearTimeout(menuCloseTimeout)
      }
    }
  }, [menuCloseTimeout])

  const handleSummarize = () => {
    setHasStartedScan(true)
    setScanComplete(false)
    onSummarize?.()
  }

  const handleShow = () => {
    setShowContextMenu(false)
    setShowModal(true)
  }

  const handleExpandClick = (e?: React.MouseEvent) => {
    // Prevent expand if we just finished dragging
    if (e && hasDragged) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    
    if (showSummaryExpanded) {
      // Close summary expansion
      setShowSummaryExpanded(false)
    } else if (isExpanded) {
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

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging in preview mode (not expanded)
    if (isIntegratedExpanded) return
    
    e.preventDefault()
    setIsDragging(true)
    setHasDragged(false)
    
    // Store the initial mouse position and current drag position
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    
    // Calculate offset from mouse to current element position
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - (rect.left + dragPosition.x),
        y: e.clientY - (rect.top + dragPosition.y)
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    
    e.preventDefault()
    
    // Check if we've moved enough to consider it a drag
    const deltaX = Math.abs(e.clientX - dragStartPos.current.x)
    const deltaY = Math.abs(e.clientY - dragStartPos.current.y)
    
    if (deltaX > 5 || deltaY > 5) {
      setHasDragged(true)
    }
    
    // Calculate movement delta from start position
    const deltaFromStart = {
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y
    }
    
    // Update position by adding the delta to the starting position
    setDragPosition(prev => ({
      x: prev.x + deltaFromStart.x,
      y: prev.y + deltaFromStart.y
    }))
    
    // Update the start position for next movement calculation
    dragStartPos.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    // Reset hasDragged after a short delay to allow click handlers to check it
    setTimeout(() => setHasDragged(false), 100)
  }



  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          if (!hasDragged && !isIntegratedExpanded) {
            handleExpandClick(e)
          }
        }}
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
                        <>
              {showSummaryExpanded && summary ? (
                // Summary view with PDF background
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                  }}
                >
                  {/* Background PDF */}
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    loading={null}
                  >
                    <Page
                      pageNumber={1}
                      height={Math.min(window.innerHeight * 0.8, 1000)}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="pdf-page-expanded"
                    />
                  </Document>
                  
                  {/* Summary overlay matching PDF size */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "4px",
                      padding: "24px",
                      overflow: "auto",
                      boxSizing: "border-box",
                      zIndex: 5,
                    }}
                  >
                    <h2 
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#111827",
                        marginBottom: "24px",
                        paddingRight: "40px",
                      }}
                    >
                      PDF Summary
                    </h2>
                    <div
                      style={{
                        color: "#374151",
                        lineHeight: "1.6",
                        whiteSpace: "pre-wrap",
                        fontSize: "16px",
                      }}
                    >
                      {summary}
                    </div>
                  </div>
                  
                  {/* Close button positioned on the summary */}
                  <div 
                    style={{
                      position: "absolute",
                      top: "18px",
                      right: "8px",
                      width: "20px",
                      height: "20px",
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 1000,
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                    }}
                    onClick={handleExpandClick}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.9)"
                      e.currentTarget.style.transform = "scale(1.1)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.8)"
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
                      <path d="M19 13H5v-2h14v2z" />
                    </svg>
                  </div>
                </div>
              ) : isExpanded ? (
                // Expanded PDF view
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                  }}
                >
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    loading={null}
                  >
                    <Page
                      pageNumber={currentPage}
                      height={Math.min(window.innerHeight * 0.8, 1000)}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      className="pdf-page-expanded"
                    />
                  </Document>
                  
                  {/* Close button positioned on the PDF document */}
                  <div 
                    style={{
                      position: "absolute",
                      top: "18px",
                      right: "8px",
                      width: "20px",
                      height: "20px",
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 1000,
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                    }}
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
                      <path d="M19 13H5v-2h14v2z" />
                    </svg>
                  </div>
                </div>
              ) : (
                // Preview mode
                <Document
                  file={pdfUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={null}
                >
                  <Page
                    pageNumber={1}
                    width={width}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="pdf-page-preview"
                  />
                </Document>
              )}
            </>
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
              {(isExpanded || showSummaryExpanded) ? (
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
        {/* Bottom overlay for text readability - always show in preview mode */}
        {!isIntegratedExpanded && <div style={bottomOverlayStyle} />}
        
        {/* Status indicator - only show in preview mode */}
        {!isIntegratedExpanded && <div style={statusIndicatorStyle} />}
        
        {/* File name - always show in preview mode */}
        {!isIntegratedExpanded && (
          <div style={fileNameStyle} title={file.name}>
            {file.name}
          </div>
        )}
        
        {/* File size indicator - always show in preview mode */}
        {!isIntegratedExpanded && (
          <div style={fileSizeStyle}>
            {formatFileSize(file.size)}
          </div>
        )}
        
        {hasStartedScan && <div style={scanLineStyle} />}
        {/* Menu trigger button */}
        {!isIntegratedExpanded && (
          <div 
            style={{
              position: "absolute",
              top: "32px",
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
              opacity: isHovered ? 0.7 : 0,
            }}
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMenuMouseLeave}
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="white"
              style={{ transition: "transform 0.2s ease" }}
            >
              <circle cx="12" cy="5" r="2"/>
              <circle cx="12" cy="12" r="2"/>
              <circle cx="12" cy="19" r="2"/>
            </svg>
          </div>
        )}
        {onSummarize && !isIntegratedExpanded && (
          <ContextMenu
            isVisible={showContextMenu}
            onSummarize={handleSummarize}
            onShow={handleShow}
            onDelete={handleDelete}
            onClose={() => setShowContextMenu(false)}
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMenuMouseLeave}
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

