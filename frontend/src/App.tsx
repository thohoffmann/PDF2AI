import React, { useState } from 'react';
import { PDFUpload } from './components/pdf/PDFUpload';
import { BackendConnectionTest } from './components/test/BackendConnectionTest';
import './globals.css';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showConnectionTest, setShowConnectionTest] = useState<boolean>(false);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <main className="space-y-8">
          {/* Test Connection Button */}
          {!showConnectionTest && (
            <div className="text-center">
              <button
                onClick={() => setShowConnectionTest(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Test Connection
              </button>
            </div>
          )}

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
