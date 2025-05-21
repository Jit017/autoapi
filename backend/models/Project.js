const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to projects data file
const dataDir = path.join(__dirname, '..', 'data');
const projectsFile = path.join(dataDir, 'projects.json');

// Initialize projects data file if it doesn't exist
if (!fs.existsSync(projectsFile)) {
  fs.writeJSONSync(projectsFile, { projects: [] });
}

class Project {
  static async getAll() {
    const data = await fs.readJSON(projectsFile);
    return data.projects;
  }

  static async getById(id) {
    const data = await fs.readJSON(projectsFile);
    return data.projects.find(project => project.id === id);
  }

  static async create(projectData) {
    const data = await fs.readJSON(projectsFile);
    
    const newProject = {
      id: uuidv4(),
      name: projectData.name,
      description: projectData.description || '',
      schema: projectData.schema,
      config: projectData.config,
      routes: projectData.routes || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hasSwagger: projectData.config?.generateSwagger || false
    };
    
    data.projects.push(newProject);
    await fs.writeJSON(projectsFile, data, { spaces: 2 });
    
    // Create project directory
    const projectDir = path.join(dataDir, 'projects', newProject.id);
    await fs.ensureDir(projectDir);
    
    return newProject;
  }

  static async update(id, updates) {
    const data = await fs.readJSON(projectsFile);
    const index = data.projects.findIndex(project => project.id === id);
    
    if (index === -1) return null;
    
    data.projects[index] = {
      ...data.projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeJSON(projectsFile, data, { spaces: 2 });
    return data.projects[index];
  }

  static async delete(id) {
    const data = await fs.readJSON(projectsFile);
    const filteredProjects = data.projects.filter(project => project.id !== id);
    
    if (filteredProjects.length === data.projects.length) {
      return false;
    }
    
    data.projects = filteredProjects;
    await fs.writeJSON(projectsFile, data, { spaces: 2 });
    
    // Remove project directory
    const projectDir = path.join(dataDir, 'projects', id);
    if (fs.existsSync(projectDir)) {
      await fs.remove(projectDir);
    }
    
    return true;
  }
}

module.exports = Project; 