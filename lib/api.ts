// API base URL with fallback options
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use the same host as the current page
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:3001`;
  }
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

// Backup URLs to try if primary fails
const BACKUP_URLS = [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://0.0.0.0:3001',
];

// API endpoints
const API_ENDPOINTS = {
  GENERATE: `${API_BASE_URL}/api/generate`,
  PROJECTS: `${API_BASE_URL}/api/projects`,
  PROJECT: (id: string) => `${API_BASE_URL}/api/projects/${id}`,
  DOWNLOAD: (id: string) => `${API_BASE_URL}/api/projects/${id}/download`,
  DOCS: (id: string) => `${API_BASE_URL}/projects/${id}/docs`,
  HEALTH: `${API_BASE_URL}/health`,
};

// Type definitions
export interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface SchemaEntity {
  name: string;
  fields: SchemaField[];
}

export interface Schema {
  entities: SchemaEntity[];
}

export interface ApiConfig {
  dbType: 'json' | 'sqlite' | 'mongodb';
  auth: boolean;
  generateSwagger: boolean;
}

export interface Route {
  method: string;
  path: string;
  description: string;
}

export interface ProjectData {
  name: string;
  description?: string;
  schema: Schema;
  config: ApiConfig;
}

export interface Project extends ProjectData {
  id: string;
  userId?: string;
  routes: Route[];
  createdAt: string;
  updatedAt: string;
  hasSwagger: boolean;
}

/**
 * Get standard headers for API requests
 */
async function getHeaders() {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  return headers;
}

/**
 * Try different localhost URLs to handle network connectivity issues
 */
async function tryMultipleUrls(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const errors: string[] = [];
  
  // Get the relative path from the endpoint
  const url = new URL(endpoint);
  const path = url.pathname + url.search;
  
  // Try the primary URL first
  try {
    console.log(`[API] Trying primary URL: ${endpoint}`);
    const response = await fetch(endpoint, {
      ...options,
      signal: AbortSignal.timeout(10000), // 10 second timeout per attempt
    });
    console.log(`[API] Primary URL successful: ${response.status}`);
    return response;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[API] Primary URL failed: ${errorMsg}`);
    errors.push(`Primary (${endpoint}): ${errorMsg}`);
  }
  
  // Try backup URLs
  for (const backupUrl of BACKUP_URLS) {
    if (backupUrl === API_BASE_URL) continue; // Skip if same as primary
    
    const fullUrl = `${backupUrl}${path}`;
    try {
      console.log(`[API] Trying backup URL: ${fullUrl}`);
      const response = await fetch(fullUrl, {
        ...options,
        signal: AbortSignal.timeout(10000),
      });
      console.log(`[API] Backup URL successful: ${response.status}`);
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[API] Backup URL failed: ${errorMsg}`);
      errors.push(`Backup (${fullUrl}): ${errorMsg}`);
    }
  }
  
  // All URLs failed
  throw new Error(`All connection attempts failed:\n${errors.join('\n')}`);
}

/**
 * Enhanced fetch with better error handling and multiple URL attempts
 */
async function enhancedFetch(url: string, options: RequestInit = {}) {
  console.log(`[API] Starting request to: ${url}`);
  console.log(`[API] Request details:`, {
    method: options.method || 'GET',
    headers: options.headers,
    bodyLength: options.body ? (options.body as string).length : 0
  });

  try {
    const response = await tryMultipleUrls(url, options);
    
    console.log(`[API] Response received: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorData;
      try {
        const text = await response.text();
        errorData = text ? JSON.parse(text) : { message: 'Empty response' };
      } catch (e) {
        errorData = { 
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status
        };
      }
      
      console.error('[API] Error response data:', errorData);
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[API] Success - data received');
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('[API] Request timeout after 10 seconds');
        throw new Error('Request timed out. Please check if the backend server is running on port 3001.');
      } else if (error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        console.error('[API] Network connection error:', error.message);
        throw new Error('Cannot connect to the backend server. Please ensure:\n1. Backend is running: npm run backend\n2. Backend is accessible at http://localhost:3001\n3. No firewall is blocking the connection');
      }
    }
    console.error('[API] Request failed with error:', error);
    throw error;
  }
}

// API client
const apiClient = {
  /**
   * Test backend connection with multiple URLs
   */
  async testConnection(): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      console.log('[API] Testing backend connection...');
      
      // Try to find a working backend URL
      for (const testUrl of [API_BASE_URL, ...BACKUP_URLS]) {
        try {
          const healthUrl = `${testUrl}/health`;
          console.log(`[API] Testing: ${healthUrl}`);
          
          const response = await fetch(healthUrl, {
            signal: AbortSignal.timeout(5000),
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`[API] Backend connection successful at: ${testUrl}`, data);
            return { success: true, url: testUrl };
          }
        } catch (error) {
          console.log(`[API] Failed to connect to: ${testUrl}`);
          continue;
        }
      }
      
      return { 
        success: false, 
        error: 'Could not connect to backend server on any attempted URL' 
      };
    } catch (error) {
      console.error('[API] Connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Generate a new API
   */
  async generateApi(data: ProjectData): Promise<Project> {
    console.log('[API] Generating API with data:', {
      name: data.name,
      entitiesCount: data.schema.entities.length,
      config: data.config
    });
    
    const headers = await getHeaders();
    
    const response = await enhancedFetch(API_ENDPOINTS.GENERATE, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return response.project;
  },

  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    console.log('[API] Fetching all projects...');
    const headers = await getHeaders();
    
    const response = await enhancedFetch(API_ENDPOINTS.PROJECTS, {
      headers,
    });

    console.log(`[API] Retrieved ${response.projects.length} projects`);
    return response.projects;
  },

  /**
   * Get project by ID
   */
  async getProject(id: string): Promise<Project> {
    console.log('[API] Fetching project:', id);
    const headers = await getHeaders();
    
    const response = await enhancedFetch(API_ENDPOINTS.PROJECT(id), {
      headers,
    });

    return response.project;
  },

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<boolean> {
    console.log('[API] Deleting project:', id);
    const headers = await getHeaders();
    
    await enhancedFetch(API_ENDPOINTS.PROJECT(id), {
      method: 'DELETE',
      headers,
    });

    console.log('[API] Project deleted successfully');
    return true;
  },

  /**
   * Download project
   */
  async downloadProject(id: string): Promise<void> {
    console.log('[API] Downloading project:', id);
    const downloadUrl = API_ENDPOINTS.DOWNLOAD(id);
    window.open(downloadUrl, '_blank');
  },

  /**
   * View project docs
   */
  async viewProjectDocs(id: string): Promise<void> {
    console.log('[API] Opening project docs:', id);
    const docsUrl = API_ENDPOINTS.DOCS(id);
    window.open(docsUrl, '_blank');
  },
};

export default apiClient; 