const path = require('path');
const fs = require('fs-extra');
const uuid = require('uuid');
const archiver = require('archiver');

// Path to data directory
const dataDir = path.join(__dirname, '..', 'data');

// Project data directory
const projectsDir = path.join(dataDir, 'projects');

/**
 * Get all projects
 */
exports.getAllProjects = async (req, res) => {
  try {
    // Ensure the directory exists
    fs.ensureDirSync(projectsDir);
    
    // Get all project directories
    const projectDirs = fs.readdirSync(projectsDir).filter(dir => 
      fs.statSync(path.join(projectsDir, dir)).isDirectory()
    );
    
    // Read each project's info.json
    const projects = [];
    for (const dir of projectDirs) {
      const infoPath = path.join(projectsDir, dir, 'info.json');
      if (fs.existsSync(infoPath)) {
        const project = fs.readJsonSync(infoPath);
        projects.push(project);
      }
    }
    
    return res.status(200).json({ projects });
  } catch (error) {
    console.error('Error getting projects:', error);
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

/**
 * Get a project by ID
 */
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const projectDir = path.join(projectsDir, id);
    
    // Check if project exists
    if (!fs.existsSync(projectDir)) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Read the project info
    const infoPath = path.join(projectDir, 'info.json');
    const project = fs.readJsonSync(infoPath);
    
    return res.status(200).json({ project });
  } catch (error) {
    console.error('Error getting project:', error);
    return res.status(500).json({ error: 'Failed to fetch project details' });
  }
};

/**
 * Download project as zip
 */
exports.downloadProject = async (req, res) => {
  try {
    const { id } = req.params;
    const projectDir = path.join(projectsDir, id);
    
    // Check if project exists
    if (!fs.existsSync(projectDir)) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Read the project info to get the name (for the zip filename)
    const infoPath = path.join(projectDir, 'info.json');
    const project = fs.readJsonSync(infoPath);
    
    // Set headers for the response
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${project.name}.zip`);
    
    // Create a zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression level
    });
    
    // Pipe the archive to the response
    archive.pipe(res);
    
    // Add the project files directory to the archive
    archive.directory(path.join(projectDir, 'files'), false);
    
    // Finalize the archive
    await archive.finalize();
  } catch (error) {
    console.error('Error downloading project:', error);
    return res.status(500).json({ error: 'Failed to download project' });
  }
};

/**
 * Delete a project
 */
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const projectDir = path.join(projectsDir, id);
    
    // Check if project exists
    if (!fs.existsSync(projectDir)) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Delete the project directory
    fs.removeSync(projectDir);
    
    return res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ error: 'Failed to delete project' });
  }
}; 