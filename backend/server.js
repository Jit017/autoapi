const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs-extra');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Import routes
const projectRoutes = require('./routes/projects');
const generateRoutes = require('./routes/generate');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Create data directory if doesn't exist
const dataDir = path.join(__dirname, 'data');
fs.ensureDirSync(dataDir);
fs.ensureDirSync(path.join(dataDir, 'projects'));

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AutoAPI Documentation',
      version: '1.0.0',
      description: 'Documentation for AutoAPI - API Generator Service',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./backend/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/generate', generateRoutes);

// Serve generated project Swagger docs if available
app.use('/projects/:id/docs', (req, res, next) => {
  const projectId = req.params.id;
  const swaggerJsonPath = path.join(dataDir, 'projects', projectId, 'swagger.json');
  
  if (fs.existsSync(swaggerJsonPath)) {
    const swaggerDocument = require(swaggerJsonPath);
    return swaggerUi.setup(swaggerDocument)(req, res, next);
  }
  return res.status(404).json({ error: 'Swagger documentation not found for this project' });
});

// Static files for project downloads
app.use('/projects', express.static(path.join(dataDir, 'projects')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 