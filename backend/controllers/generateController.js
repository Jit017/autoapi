const path = require('path');
const fs = require('fs-extra');
const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const { generateExpressAPI } = require('../services/apiGenerator');
const { generateSwaggerDocs } = require('../services/swaggerGenerator');

// Generate API from schema
exports.generateAPI = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, schema, config } = req.body;

    if (!schema || !schema.entities || !Array.isArray(schema.entities) || schema.entities.length === 0) {
      return res.status(400).json({ error: 'Valid schema with entities is required' });
    }

    // Create project record
    const project = await Project.create({
      name,
      description,
      schema,
      config
    });

    // Generate API structure based on schema
    const projectDir = path.join(__dirname, '..', 'data', 'projects', project.id);
    const routes = await generateExpressAPI(project, projectDir);

    // Generate Swagger docs if enabled
    if (config && config.generateSwagger) {
      await generateSwaggerDocs(project, projectDir);
    }

    // Update project with generated routes
    await Project.update(project.id, { routes });

    res.status(201).json({
      success: true,
      message: 'API generated successfully',
      project: {
        ...project,
        routes
      }
    });
  } catch (error) {
    console.error('Error generating API:', error);
    res.status(500).json({ error: 'Failed to generate API', details: error.message });
  }
}; 