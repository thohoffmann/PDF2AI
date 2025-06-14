import React, { useState } from 'react';
import { PDFUpload } from './components/pdf/PDFUpload';
import { BackendConnectionTest } from './components/test/BackendConnectionTest';
import './globals.css';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showConnectionTest, setShowConnectionTest] = useState<boolean>(true);

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
          {/* Backend Connection Test */}
          {showConnectionTest && (
            <div className="relative">
              <BackendConnectionTest />
              <button
                onClick={() => setShowConnectionTest(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl font-bold"
                title="Hide connection test"
              >
                ×
              </button>
            </div>
          )}

          {/* Toggle button to show connection test if hidden */}
          {!showConnectionTest && (
            <div className="text-center">
              <button
                onClick={() => setShowConnectionTest(true)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Show Backend Connection Test
              </button>
            </div>
          )}

          <PDFUpload 
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
