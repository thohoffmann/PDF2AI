import React, { useState } from 'react';
import { PDFUpload } from './components/pdf/PDFUpload';
import { PDFViewer } from './components/pdf/PDFViewer';
import './globals.css';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            PDF2AI
          </h1>
          <p className="text-lg text-muted-foreground">
            AI-powered PDF analysis and optimization tool
          </p>
        </header>

        <main className="space-y-8">
          <PDFUpload 
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
          />
          
          {selectedFile && (
            <PDFViewer file={selectedFile} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
