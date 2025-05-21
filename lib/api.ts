// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API endpoints
const API_ENDPOINTS = {
  GENERATE: `${API_BASE_URL}/api/generate`,
  PROJECTS: `${API_BASE_URL}/api/projects`,
  PROJECT: (id: string) => `${API_BASE_URL}/api/projects/${id}`,
  DOWNLOAD: (id: string) => `${API_BASE_URL}/api/projects/${id}/download`,
  DOCS: (id: string) => `${API_BASE_URL}/projects/${id}/docs`,
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
  routes: Route[];
  createdAt: string;
  updatedAt: string;
  hasSwagger: boolean;
}

// API client
const apiClient = {
  /**
   * Generate a new API
   */
  async generateApi(data: ProjectData): Promise<Project> {
    const response = await fetch(API_ENDPOINTS.GENERATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate API');
    }

    const result = await response.json();
    return result.project;
  },

  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    const response = await fetch(API_ENDPOINTS.PROJECTS);
    
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    const result = await response.json();
    return result.projects;
  },

  /**
   * Get project by ID
   */
  async getProject(id: string): Promise<Project> {
    const response = await fetch(API_ENDPOINTS.PROJECT(id));
    
    if (!response.ok) {
      throw new Error('Failed to fetch project');
    }

    const result = await response.json();
    return result.project;
  },

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<boolean> {
    const response = await fetch(API_ENDPOINTS.PROJECT(id), {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete project');
    }

    return true;
  },

  /**
   * Download project
   */
  downloadProject(id: string): void {
    window.open(API_ENDPOINTS.DOWNLOAD(id), '_blank');
  },

  /**
   * View project docs
   */
  viewProjectDocs(id: string): void {
    window.open(API_ENDPOINTS.DOCS(id), '_blank');
  },
};

export default apiClient; 