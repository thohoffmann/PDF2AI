import React, { useCallback, useState } from 'react'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import DocumentIcon from './DocumentIcon'

interface PDFUploadProps {
  onFileSelect: (file: File) => void
  selectedFile?: File | null
  className?: string
}

export function PDFUpload({ onFileSelect, selectedFile, className }: PDFUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Enhanced PDF validation
  const validatePDFFile = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
    // Check file extension
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return { isValid: false, error: 'File must have .pdf extension' }
    }

    // Check MIME type
    if (file.type !== 'application/pdf') {
      return { isValid: false, error: 'Invalid file type. Please select a PDF file.' }
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 50MB limit' }
    }

    // Check if file is empty
    if (file.size === 0) {
      return { isValid: false, error: 'File appears to be empty' }
    }

    // Basic PDF signature check
    try {
      const buffer = await file.slice(0, 8).arrayBuffer()
      const bytes = new Uint8Array(buffer)
      const signature = Array.from(bytes).map(b => String.fromCharCode(b)).join('')
      
      if (!signature.startsWith('%PDF-')) {
        return { isValid: false, error: 'File does not appear to be a valid PDF' }
      }
    } catch (error) {
      return { isValid: false, error: 'Unable to read file contents' }
    }

    return { isValid: true }
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setValidationError(null)

    try {
      const validation = await validatePDFFile(file)
      
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid PDF file')
        setIsProcessing(false)
        return
      }

      // Simulate processing time for better UX
      setTimeout(() => {
        onFileSelect(file)
        setIsProcessing(false)
      }, 800)
    } catch (error) {
      setValidationError('Error processing file. Please try again.')
      setIsProcessing(false)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return
    
    const file = files[0] // Take the first file
    processFile(file)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
    // Reset input
    e.target.value = ''
  }, [])

  const handleRemoveFile = useCallback(() => {
    setValidationError(null)
    onFileSelect(null as any)
  }, [onFileSelect])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${className || ''}`.trim()}>
      {!selectedFile ? (
        <div className="space-y-4">
          <Card
            className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${isProcessing ? 'drag-over' : ''}`.trim()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className={`mb-6 rounded-full p-6 transition-all duration-200 ${isDragOver || isProcessing ? 'bg-green-100' : 'bg-gray-100'}`.trim()}>
                <Upload className={`h-12 w-12 transition-colors duration-200 ${isDragOver || isProcessing ? 'text-green-600' : 'text-gray-600'}`.trim()} />
              </div>
              
              <h3 className="mb-2 text-xl font-semibold">
                {isProcessing ? "Processing PDF..." : "Upload your PDF document"}
              </h3>
              
              <p className="mb-6 text-sm text-gray-600 max-w-sm">
                {isProcessing 
                  ? "Please wait while we validate and prepare your document"
                  : "Drag and drop your PDF file here, or click to browse and select a file"
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileInput}
                  className="hidden"
                  id="pdf-upload"
                  disabled={isProcessing}
                />
                <label htmlFor="pdf-upload">
                  <Button
                    type="button"
                    disabled={isProcessing}
                    className="cursor-pointer"
                  >
                    {isProcessing ? "Processing..." : "Choose PDF File"}
                  </Button>
                </label>
                
                <div className="text-xs text-gray-600 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>PDF files only • Max 50MB</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {validationError && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Upload Error</p>
                    <p className="text-sm text-red-700">{validationError}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <DocumentIcon 
                  file={selectedFile}
                  isSuccess={true}
                  size="md"
                  onSummarize={() => {
                    // Add summarize functionality here
                    console.log("Summarizing document...")
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={handleRemoveFile}
                className="text-green-700 hover:text-green-900 hover:bg-green-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 