import React, { useCallback, useState } from 'react'
import { Upload, FileText, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PDFUploadProps {
  onFileSelect: (file: File) => void
  selectedFile?: File | null
  className?: string
}

export function PDFUpload({ onFileSelect, selectedFile, className }: PDFUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

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
    const pdfFile = files.find(file => file.type === 'application/pdf')
    
    if (pdfFile) {
      setIsProcessing(true)
      setTimeout(() => {
        onFileSelect(pdfFile)
        setIsProcessing(false)
      }, 500) // Simulate processing time
    }
  }, [onFileSelect])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setIsProcessing(true)
      setTimeout(() => {
        onFileSelect(file)
        setIsProcessing(false)
      }, 500)
    }
  }, [onFileSelect])

  const handleRemoveFile = useCallback(() => {
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
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {!selectedFile ? (
        <Card
          className={cn(
            "relative border-2 border-dashed transition-all duration-200 hover:border-primary/50",
            isDragOver ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/25",
            isProcessing && "border-primary bg-primary/5"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className={cn(
              "mb-6 rounded-full p-6 transition-all duration-200",
              isDragOver ? "bg-primary/10 scale-110" : "bg-muted/50",
              isProcessing && "animate-pulse bg-primary/10"
            )}>
              <Upload className={cn(
                "h-12 w-12 transition-colors duration-200",
                isDragOver ? "text-primary" : "text-muted-foreground",
                isProcessing && "text-primary"
              )} />
            </div>
            
            <h3 className="mb-2 text-xl font-semibold">
              {isProcessing ? "Processing PDF..." : "Upload your PDF document"}
            </h3>
            
            <p className="mb-6 text-sm text-muted-foreground max-w-sm">
              {isProcessing 
                ? "Please wait while we prepare your document"
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
                  asChild
                >
                  <span>
                    {isProcessing ? "Processing..." : "Choose PDF File"}
                  </span>
                </Button>
              </label>
              
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>PDF files only • Max 50MB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-100 p-3">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900">{selectedFile.name}</h4>
                  <p className="text-sm text-green-700">
                    {formatFileSize(selectedFile.size)} • PDF Document
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
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