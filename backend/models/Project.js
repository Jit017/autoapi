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
  static async getAll(userId = null) {
    const data = await fs.readJSON(projectsFile);
    console.log(`Project.getAll called with userId: ${userId || 'null'}`);
    console.log(`Total projects: ${data.projects.length}`);
    
    // If userId is provided, filter projects by userId
    if (userId) {
      const filteredProjects = data.projects.filter(project => project.userId === userId);
      console.log(`Filtered projects for user ${userId}: ${filteredProjects.length}`);
      console.log('Projects with userIds:', data.projects.map(p => ({ id: p.id, userId: p.userId })));
      return filteredProjects;
    }
    console.log('No userId provided, returning all projects');
    return data.projects;
  }

  static async getById(id, userId = null) {
    const data = await fs.readJSON(projectsFile);
    const project = data.projects.find(project => project.id === id);
    
    // If userId is provided, ensure the project belongs to the user
    if (userId && project && project.userId !== userId) {
      return null;
    }
    
    return project;
  }

  static async create(projectData) {
    const data = await fs.readJSON(projectsFile);
    console.log('Creating project with data:', {
      name: projectData.name,
      userId: projectData.userId || 'null'
    });
    
    const newProject = {
      id: uuidv4(),
      userId: projectData.userId || null, // Store the userId
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

  static async update(id, updates, userId = null) {
    const data = await fs.readJSON(projectsFile);
    const index = data.projects.findIndex(project => project.id === id);
    
    if (index === -1) return null;
    
    // If userId is provided, ensure the project belongs to the user
    if (userId && data.projects[index].userId !== userId) {
      return null;
    }
    
    data.projects[index] = {
      ...data.projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeJSON(projectsFile, data, { spaces: 2 });
    return data.projects[index];
  }

  static async delete(id, userId = null) {
    const data = await fs.readJSON(projectsFile);
    
    // If userId is provided, only delete if project belongs to user
    if (userId) {
      const project = data.projects.find(project => project.id === id);
      if (!project || project.userId !== userId) {
        return false;
      }
    }
    
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