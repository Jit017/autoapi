const path = require('path');
const fs = require('fs-extra');
const archiver = require('archiver');
const Project = require('../models/Project');

// Path to data directory
const dataDir = path.join(__dirname, '..', 'data');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.getAll();
    res.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.getById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

// Download project as ZIP
exports.downloadProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.getById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const projectDir = path.join(dataDir, 'projects', projectId);
    
    if (!fs.existsSync(projectDir)) {
      return res.status(404).json({ error: 'Project files not found' });
    }
    
    // Create a file to stream archive data to
    const zipFileName = `${project.name.replace(/\s+/g, '-').toLowerCase()}-api.zip`;
    res.attachment(zipFileName);
    
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level
    });
    
    // Pipe archive data to the response
    archive.pipe(res);
    
    // Append files from the project directory
    archive.directory(projectDir, false);
    
    // Finalize the archive
    await archive.finalize();
  } catch (error) {
    console.error('Error creating project archive:', error);
    res.status(500).json({ error: 'Failed to create project archive' });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const success = await Project.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
}; 