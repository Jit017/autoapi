const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { generateExpressAPI } = require('../services/apiGenerator');
const { generateSwaggerDocs } = require('../services/swaggerGenerator');

// Path to data directory
const dataDir = path.join(__dirname, '../data');

/**
 * Generate API from schema
 */
exports.generateApi = async (req, res) => {
  try {
    console.log('Generate API request received');
    
    const { name, description, schema, config } = req.body;
    
    // Validate required parameters
    if (!name || !schema) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        message: 'Missing required parameters: name and schema' 
      });
    }

    // Validate schema structure
    if (!schema.entities || !Array.isArray(schema.entities)) {
      return res.status(400).json({ 
        error: 'Invalid schema', 
        message: 'Schema must include an array of entities' 
      });
    }

    // Validate entities have fields
    for (const entity of schema.entities) {
      if (!entity.name) {
        return res.status(400).json({
          error: 'Invalid entity',
          message: 'Each entity must have a name'
        });
      }
      if (!entity.fields || !Array.isArray(entity.fields) || entity.fields.length === 0) {
        return res.status(400).json({
          error: 'Invalid entity fields',
          message: `Entity '${entity.name}' must have at least one field`
        });
      }
    }
    
    // Default values for config
    const apiConfig = {
      dbType: 'json',
      auth: false,
      generateSwagger: true,
      ...config
    };
    
    // Generate a unique project ID
    const projectId = uuidv4();
    
    // Create the project directory structure
    const projectDir = path.join(dataDir, 'projects', projectId);
    const filesDir = path.join(projectDir, 'files');
    
    await fs.ensureDir(projectDir);
    await fs.ensureDir(filesDir);
    
    try {
      // Create project object
      const project = {
        id: projectId,
        name,
        description: description || `API for ${name}`,
        schema,
        config: apiConfig,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Generate the API files
      console.log('Generating API files...');
      const routes = await generateExpressAPI(project, filesDir);
      console.log(`Generated ${routes.length} routes`);
      
      // Generate Swagger docs if enabled
      let hasSwagger = false;
      if (apiConfig.generateSwagger) {
        try {
          await generateSwaggerDocs(project, filesDir);
          console.log('Generated Swagger documentation');
          hasSwagger = true;
        } catch (error) {
          console.error('Error generating Swagger docs:', error);
        }
      }
      
      // Update project info with routes and Swagger status
      project.routes = routes;
      project.hasSwagger = hasSwagger;
      
      // Save project info
      await fs.writeJson(path.join(projectDir, 'info.json'), project, { spaces: 2 });
      console.log('API project created successfully');
      
      return res.status(201).json({
        message: 'API generated successfully',
        project: project
      });
    } catch (error) {
      console.error('Error generating API:', error);
      
      // Clean up in case of error
      try {
        if (await fs.pathExists(projectDir)) {
          await fs.remove(projectDir);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up project directory:', cleanupError);
      }
      
      // Return appropriate error
      if (error.message.includes('schema')) {
        return res.status(400).json({ 
          error: 'Schema validation failed', 
          message: error.message 
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to generate API', 
        message: error.message || 'An unexpected error occurred'
      });
    }
  } catch (error) {
    console.error('Unexpected error in generateApi controller:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: 'An unexpected error occurred while processing your request'
    });
  }
}; 