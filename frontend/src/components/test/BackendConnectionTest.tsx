import React, { useState, useEffect } from 'react';
import { apiService, HealthCheckResponse, TestConnectionResponse } from '../../services/api';

interface ConnectionStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  healthData: HealthCheckResponse | null;
  testData: TestConnectionResponse | null;
}

export const BackendConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isLoading: false,
    error: null,
    healthData: null,
    testData: null,
  });

  const testConnection = async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Test health endpoint
      const healthData = await apiService.healthCheck();
      
      // Test connection endpoint
      const testData = await apiService.testConnection();

      setStatus({
        isConnected: true,
        isLoading: false,
        error: null,
        healthData,
        testData,
      });
    } catch (error) {
      setStatus({
        isConnected: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        healthData: null,
        testData: null,
      });
    }
  };

  // Test connection on component mount
  useEffect(() => {
    testConnection();
  }, []);

  const getStatusColor = () => {
    if (status.isLoading) return 'text-yellow-600';
    if (status.isConnected) return 'text-green-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (status.isLoading) return '⏳';
    if (status.isConnected) return '✅';
    return '❌';
  };

  const getStatusText = () => {
    if (status.isLoading) return 'Testing connection...';
    if (status.isConnected) return 'Backend Connected';
    return 'Backend Disconnected';
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Backend Connection Status
        </h2>
        <div className={`text-lg font-semibold ${getStatusColor()}`}>
          {getStatusIcon()} {getStatusText()}
        </div>
      </div>

      <div className="space-y-4">
        {/* Test Button */}
        <div className="text-center">
          <button
            onClick={testConnection}
            disabled={status.isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status.isLoading ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {/* Error Display */}
        {status.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Connection Error</h3>
            <p className="text-red-600">{status.error}</p>
            <p className="text-sm text-red-500 mt-2">
              Make sure the backend server is running on http://localhost:8000
            </p>
          </div>
        )}

        {/* Success Display */}
        {status.isConnected && status.healthData && status.testData && (
          <div className="space-y-4">
            {/* Health Check Results */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-3">🏥 Health Check</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span className="ml-2 text-green-600">{status.healthData.status}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Version:</span>
                  <span className="ml-2">{status.healthData.version}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-gray-700">Message:</span>
                  <span className="ml-2">{status.healthData.message}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-gray-700">Timestamp:</span>
                  <span className="ml-2 font-mono text-xs">{status.healthData.timestamp}</span>
                </div>
              </div>
            </div>

            {/* Connection Test Results */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">🔗 Connection Test</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Backend:</span>
                  <span className="ml-2">{status.testData.backend}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Message:</span>
                  <span className="ml-2 text-green-600">{status.testData.message}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Available Endpoints:</span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {status.testData.available_endpoints.map((endpoint, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono"
                      >
                        {endpoint}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">CORS Origins:</span>
                  <div className="mt-2">
                    {status.testData.cors_origins.map((origin, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono mr-2"
                      >
                        {origin}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 