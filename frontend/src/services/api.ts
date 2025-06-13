/**
 * API service for communicating with the PDF2AI backend
 */

const API_BASE_URL = 'http://127.0.0.1:8000';

export interface ApiResponse<T = any> {
  [key: string]: T;
}

export interface HealthCheckResponse {
  status: string;
  message: string;
  timestamp: string;
  version: string;
}

export interface TestConnectionResponse {
  message: string;
  backend: string;
  timestamp: string;
  version: string;
  available_endpoints: string[];
  cors_origins: string[];
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic API request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`🌐 Making API request to: ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ API response:`, data);
      return data;
    } catch (error) {
      console.error(`❌ API request failed:`, error);
      throw error;
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>('/api/health');
  }

  /**
   * Test connection endpoint
   */
  async testConnection(): Promise<TestConnectionResponse> {
    return this.request<TestConnectionResponse>('/api/test');
  }

  /**
   * Check if backend is reachable
   */
  async isBackendReachable(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('Backend is not reachable:', error);
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService; 