"use client"

import React, { useCallback, useState, useRef, useEffect } from 'react'
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
  const [summary, setSummary] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Add global drag and drop event listeners
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault()
      setIsDragOver(true)
      
      // Hide the default drag image by setting a custom empty one
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'copy'
        e.dataTransfer.dropEffect = 'copy'
      }
    }

    const handleGlobalDragEnter = (e: DragEvent) => {
      e.preventDefault()
      setIsDragOver(true)
      document.body.classList.add('dragging')
    }

    const handleGlobalDragLeave = (e: DragEvent) => {
      // Only hide drag overlay if we're leaving the window entirely
      if (!e.relatedTarget) {
        setIsDragOver(false)
        document.body.classList.remove('dragging')
      }
    }

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      document.body.classList.remove('dragging')
      
      const files = Array.from(e.dataTransfer?.files || [])
      if (files.length === 0) return
      
      const file = files[0]
      processFile(file)
    }

    // Add event listeners to document
    document.addEventListener('dragover', handleGlobalDragOver)
    document.addEventListener('dragenter', handleGlobalDragEnter)
    document.addEventListener('dragleave', handleGlobalDragLeave)
    document.addEventListener('drop', handleGlobalDrop)

    return () => {
      document.removeEventListener('dragover', handleGlobalDragOver)
      document.removeEventListener('dragenter', handleGlobalDragEnter)
      document.removeEventListener('dragleave', handleGlobalDragLeave)
      document.removeEventListener('drop', handleGlobalDrop)
    }
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

  const handleSummarize = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setValidationError(null)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      // Simulate progress for text extraction (30%)
      setProgress(30)
      await new Promise(resolve => setTimeout(resolve, 500))

      const response = await fetch("http://localhost:8000/api/summarize", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to summarize PDF")
      }

      const data = await response.json()
      
      // Update progress based on response
      if (data.progress) {
        setProgress(data.progress)
      } else {
        setProgress(100)
      }
      
      setSummary(data.summary)
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      {/* Full-screen drag overlay */}
      {isDragOver && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 rounded-full p-8 bg-blue-100 inline-block">
              <Upload className="h-16 w-16 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Drop your PDF file</h2>
            <p className="text-blue-700">Release to upload</p>
          </div>
        </div>
      )}

      {/* CSS to hide drag ghost image */}
      <style>
        {`
          body.dragging {
            cursor: grabbing !important;
          }
          
          body.dragging * {
            cursor: grabbing !important;
            pointer-events: none;
          }
          
          /* Hide drag ghost image */
          .drag-ghost-hidden {
            opacity: 0 !important;
            transform: translate(-9999px, -9999px) !important;
          }
        `}
      </style>

      <div className={`w-full relative ${className || ''}`.trim()}>
        {/* Background upload area - always visible with transparency */}
        <div className="fixed inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <div className={`mb-6 rounded-full p-8 transition-all duration-200 ${isProcessing ? 'bg-green-100' : 'bg-gray-100'} opacity-50`.trim()}>
            <Upload className={`h-16 w-16 transition-colors duration-200 ${isProcessing ? 'text-green-600' : 'text-gray-600'}`.trim()} />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 opacity-50">
            {isProcessing ? "Processing PDF..." : "Drag and Drop your PDF File anywhere!"}
          </h2>
        </div>

        {/* Hidden file input for programmatic access */}
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInput}
          className="hidden"
          id="pdf-upload"
          disabled={isProcessing}
          ref={fileInputRef}
        />

        {/* Content area - shows on top of background */}
        {selectedFile ? (
          <div className="relative z-10 min-h-screen flex items-center justify-center">
            <div className="space-y-4 max-w-2xl mx-auto">
              <DocumentIcon
                file={selectedFile}
                size="lg"
                isProcessing={isProcessing}
                isSuccess={!!summary}
                isError={!!validationError}
                progress={progress}
                summary={summary}
                onSummarize={handleSummarize}
                onDelete={handleRemoveFile}
              />

              {/* Only show the green card for errors */}
              {validationError && (
                <Card className="bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
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

                    {/* Summary Section */}
                    {summary && (
                      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Summary</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{summary}</p>
                      </div>
                    )}

                    {/* Error Message */}
                    {validationError && (
                      <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-600">{validationError}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          /* Error messages when no file selected */
          validationError && (
            <div className="relative z-10 min-h-screen flex items-center justify-center">
              <div className="max-w-md mx-auto">
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
              </div>
            </div>
          )
        )}
      </div>
    </>
  )
} 