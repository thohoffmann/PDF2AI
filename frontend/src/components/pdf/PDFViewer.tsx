import React, { useState, useCallback, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download, FileText } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

// Configure PDF.js worker - use local file with correct version
pdfjs.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`

interface PDFViewerProps {
  file: File
  className?: string
}

export function PDFViewer({ file, className }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.2)
  const [rotation, setRotation] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [useFallback, setUseFallback] = useState<boolean>(false)
  const [useFileObject, setUseFileObject] = useState<boolean>(false)
  const [retryCount, setRetryCount] = useState<number>(0)

  // Create object URL from file for better compatibility
  useEffect(() => {
    let currentUrl: string | null = null
    
    if (file) {
      // Test file readability first
      const testFile = async () => {
        try {
          const buffer = await file.arrayBuffer()
          const bytes = new Uint8Array(buffer)
          const signature = Array.from(bytes.slice(0, 8)).map(b => String.fromCharCode(b)).join('')
          
          console.log('File signature check:', signature)
          console.log('File size:', buffer.byteLength, 'bytes')
          
          if (!signature.startsWith('%PDF-')) {
            setError('File is not a valid PDF document')
            setIsLoading(false)
            return
          }
          
          // Create URL after validation
          const url = URL.createObjectURL(file)
          currentUrl = url
          setFileUrl(url)
          
          console.log('Created file URL:', url)
          console.log('File details:', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: new Date(file.lastModified).toISOString()
          })
          
        } catch (error) {
          console.error('File read test failed:', error)
          setError('Unable to read the PDF file')
          setIsLoading(false)
        }
      }
      
      // Reset state when file changes
      setNumPages(0)
      setPageNumber(1)
      setIsLoading(true)
      setError(null)
      setFileUrl(null)
      
      testFile()
    }
    
    // Cleanup function
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl)
        console.log('Revoked file URL:', currentUrl)
      }
    }
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
    console.error('File URL:', fileUrl)
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
  }, [file.name, file.size, file.type, file.lastModified, fileUrl, useFileObject])

  const onPageLoadError = useCallback((error: Error) => {
    console.error('Page load error:', error)
    setError('Failed to load this page. The PDF may be corrupted.')
  }, [])

  const goToPrevPage = useCallback(() => {
    setPageNumber(prev => Math.max(1, prev - 1))
  }, [])

  const goToNextPage = useCallback(() => {
    setPageNumber(prev => Math.min(numPages, prev + 1))
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
    if (fileUrl) {
      const a = document.createElement('a')
      a.href = fileUrl
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }, [fileUrl, file.name])

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
          console.log('File URL for testing:', fileUrl)
          
          if (fileUrl) {
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
  }, [fileUrl])

  // Don't render if no file URL
  if (!fileUrl) {
    return (
      <div className={`w-full max-w-4xl mx-auto ${className || ''}`.trim()}>
        <Card className="overflow-hidden">
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Preparing PDF...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${className || ''}`.trim()}>
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{file.name}</CardTitle>
                <p className="text-sm text-gray-600">
                  {formatFileSize(file.size)} • {numPages > 0 && `${numPages} pages`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={downloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm font-medium px-3 py-1 bg-white rounded">
                {pageNumber} of {numPages}
              </span>
              
              <Button
                variant="secondary"
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <span className="text-sm font-medium px-3 py-1 bg-white rounded min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              
              <Button variant="secondary" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              <Button variant="secondary" onClick={rotate}>
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* PDF Display */}
          <div className="flex justify-center">
            <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg bg-white">
              {isLoading && (
                <div className="flex items-center justify-center h-96 w-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading PDF...</p>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="flex items-center justify-center h-96 w-full">
                  <div className="text-center text-red-600 max-w-md p-6">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">PDF Loading Error</p>
                    <p className="text-sm">{error}</p>
                    <p className="text-xs text-gray-500 mt-3">
                      File: {file.name} ({formatFileSize(file.size)})
                    </p>
                    <div className="mt-4 text-xs text-left bg-gray-100 p-3 rounded">
                      <p><strong>Debug Info:</strong></p>
                      <p>File URL: {fileUrl ? 'Created' : 'Not available'}</p>
                      <p>Worker: {pdfjs.GlobalWorkerOptions.workerSrc}</p>
                      <p>PDF.js API Version: {pdfjs.version}</p>
                      <p>Using File Direct: {useFileObject ? 'Yes' : 'No'}</p>
                      <div className="mt-2 space-y-2">
                        <Button 
                          variant="secondary" 
                          onClick={testWorker}
                          className="text-xs px-2 py-1"
                        >
                          Test Worker
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => setUseFallback(true)}
                          className="text-xs px-2 py-1 ml-2"
                        >
                          Try Browser Viewer
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => setUseFileObject(true)}
                          className="text-xs px-2 py-1 ml-2"
                        >
                          Try File Direct
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => {
                            setError(null)
                            setIsLoading(true)
                            setRetryCount(prev => prev + 1)
                            setUseFileObject(false)
                          }}
                          className="text-xs px-2 py-1 ml-2"
                        >
                          Retry ({retryCount})
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {!error && !useFallback && (
                <Document
                  key={`pdf-${retryCount}-${useFileObject ? 'file' : 'url'}`}
                  file={useFileObject ? file : fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading=""
                  error=""
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    rotate={rotation}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    onLoadError={onPageLoadError}
                    loading=""
                    error=""
                  />
                </Document>
              )}
              
              {useFallback && fileUrl && (
                <div className="w-full">
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Browser PDF Viewer</strong> - Using your browser's built-in PDF viewer
                    </p>
                    <Button 
                      variant="secondary" 
                      onClick={() => setUseFallback(false)}
                      className="text-xs px-2 py-1 mt-2"
                    >
                      Switch Back to Advanced Viewer
                    </Button>
                  </div>
                  <iframe
                    src={fileUrl}
                    width="100%"
                    height="600px"
                    title={`PDF Viewer - ${file.name}`}
                    className="border border-gray-300 rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 