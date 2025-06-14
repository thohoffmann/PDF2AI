import React, { useState, useCallback, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download, FileText } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.entry')

interface PDFViewerProps {
  file: File
  onClose?: () => void
}

export default function PDFViewer({ file, onClose }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState<number>(1.2)
  const [rotation, setRotation] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [useFallback, setUseFallback] = useState<boolean>(false)
  const [useFileObject, setUseFileObject] = useState<boolean>(false)
  const [retryCount, setRetryCount] = useState<number>(0)

  // Create object URL for the PDF file
  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPdfUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setIsLoading(false)
    setError(null)
    console.log('PDF loaded successfully:', { numPages, fileName: file.name })
  }, [file.name])

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('=== PDF LOAD ERROR DETAILS ===')
    console.error('PDF load error:', error)
    console.error('Error message:', error.message)
    console.error('Error name:', error.name)
    console.error('Error stack:', error.stack)
    console.error('File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    })
    console.error('File URL:', pdfUrl)
    console.error('Using file object directly:', useFileObject)
    console.error('PDF.js version:', pdfjs.version)
    console.error('================================')
    
    // More specific error messages
    let errorMessage = 'Failed to load PDF. Please try uploading a different file.'
    
    if (error.message.includes('Invalid PDF')) {
      errorMessage = 'This file appears to be corrupted or not a valid PDF.'
    } else if (error.message.includes('Password')) {
      errorMessage = 'This PDF is password protected. Please use an unprotected PDF.'
    } else if (error.message.includes('fetch')) {
      errorMessage = 'Network error loading PDF. Please try again.'
    } else if (error.message.includes('Missing PDF')) {
      errorMessage = 'PDF file format is not supported or corrupted.'
    } else if (error.message.includes('worker')) {
      errorMessage = 'PDF processing service unavailable. Please refresh and try again.'
    } else if (error.message.includes('Loading task cancelled')) {
      errorMessage = 'PDF loading was interrupted. Please try again.'
    }
    
    setError(`${errorMessage}\n\nTechnical details: ${error.message}`)
    setIsLoading(false)
  }, [file.name, file.size, file.type, file.lastModified, pdfUrl, useFileObject])

  const onPageLoadError = useCallback((error: Error) => {
    console.error('Page load error:', error)
    setError('Failed to load this page. The PDF may be corrupted.')
  }, [])

  const goToPrevPage = useCallback(() => {
    setPageNumber(prev => Math.max(1, prev - 1))
  }, [])

  const goToNextPage = useCallback(() => {
    setPageNumber(prev => Math.min(numPages || prev, prev + 1))
  }, [numPages])

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(3, prev + 0.2))
  }, [])

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(0.5, prev - 0.2))
  }, [])

  const rotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360)
  }, [])

  const downloadPDF = useCallback(() => {
    if (pdfUrl) {
      const a = document.createElement('a')
      a.href = pdfUrl
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }, [pdfUrl, file.name])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Test worker availability
  const testWorker = useCallback(async () => {
    try {
      console.log('=== PDF.js Diagnostic Test ===')
      console.log('PDF.js version:', pdfjs.version)
      console.log('Worker source:', pdfjs.GlobalWorkerOptions.workerSrc)
      
      const response = await fetch(pdfjs.GlobalWorkerOptions.workerSrc)
      console.log('Worker fetch response:', response.status, response.statusText)
      
      if (response.ok) {
        console.log('✅ Worker is accessible')
        
        // Test if PDF.js can load anything
        try {
          console.log('Testing PDF.js basic functionality...')
          console.log('File URL for testing:', pdfUrl)
          
          if (pdfUrl) {
            // Try to get document info without full loading
            console.log('File appears ready for PDF.js processing')
          }
        } catch (testError) {
          console.error('PDF.js basic test failed:', testError)
        }
      } else {
        console.error('❌ Worker is not accessible')
      }
      
      return response.ok
    } catch (error) {
      console.error('❌ Worker test failed:', error)
      return false
    }
  }, [pdfUrl])

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  }

  const viewerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  }

  const controlsStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '10px 20px',
    borderRadius: '8px',
    zIndex: 1001,
  }

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#4a5568',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  }

  const closeButtonStyle: React.CSSProperties = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '8px 16px',
    backgroundColor: '#4a5568',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    zIndex: 1001,
  }

  return (
    <div style={containerStyle} onClick={onClose}>
      <div style={viewerStyle} onClick={e => e.stopPropagation()}>
        {pdfUrl && (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            error={error}
            className="pdf-document"
          >
            <Page
              pageNumber={pageNumber}
              width={Math.min(window.innerWidth * 0.8, 800)}
              scale={scale}
              rotate={rotation}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              onLoadError={onPageLoadError}
              loading={null}
              error={error}
            />
          </Document>
        )}
        <div style={controlsStyle}>
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            style={buttonStyle}
          >
            Previous
          </button>
          <span style={{ color: 'white', padding: '8px 16px' }}>
            Page {pageNumber} of {numPages || '--'}
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1)}
            style={buttonStyle}
          >
            Next
          </button>
        </div>
        {onClose && (
          <button onClick={onClose} style={closeButtonStyle}>
            Close
          </button>
        )}
      </div>
    </div>
  )
} 