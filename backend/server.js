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
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'http://0.0.0.0:3000',
    'http://[::1]:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AutoAPI Backend is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/generate', generateRoutes);

// Serve generated project Swagger docs if available
app.get('/projects/:id/docs', (req, res) => {
  const projectId = req.params.id;
  const swaggerJsonPath = path.join(dataDir, 'projects', projectId, 'files', 'swagger.json');
  
  console.log(`[Swagger] Looking for swagger.json at: ${swaggerJsonPath}`);
  
  if (fs.existsSync(swaggerJsonPath)) {
    try {
      const swaggerDocument = JSON.parse(fs.readFileSync(swaggerJsonPath, 'utf-8'));
      console.log(`[Swagger] Found and loaded swagger.json for project ${projectId}`);
      
      // Create a proper HTML page with embedded Swagger UI
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation - ${swaggerDocument.info?.title || 'Generated API'}</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
        .swagger-ui .topbar {
            display: none;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/projects/${projectId}/swagger.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`;
      
      res.send(html);
    } catch (error) {
      console.error(`[Swagger] Error loading swagger.json for project ${projectId}:`, error);
      res.status(500).json({ 
        error: 'Failed to load Swagger documentation',
        details: error.message 
      });
    }
  } else {
    console.log(`[Swagger] No swagger.json found for project ${projectId}`);
    res.status(404).json({ 
      error: 'Swagger documentation not found for this project. Make sure "Generate Swagger Docs" was enabled when creating the API.',
      path: swaggerJsonPath 
    });
  }
});

// Serve swagger.json files directly for reference
app.get('/projects/:id/swagger.json', (req, res) => {
  const projectId = req.params.id;
  const swaggerJsonPath = path.join(dataDir, 'projects', projectId, 'files', 'swagger.json');
  
  // Add CORS headers for browser access
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (fs.existsSync(swaggerJsonPath)) {
    try {
      const swaggerDocument = JSON.parse(fs.readFileSync(swaggerJsonPath, 'utf-8'));
      res.json(swaggerDocument);
    } catch (error) {
      console.error(`[Swagger] Error reading swagger.json for project ${projectId}:`, error);
      res.status(500).json({ 
        error: 'Failed to read Swagger documentation',
        details: error.message 
      });
    }
  } else {
    res.status(404).json({ 
      error: 'Swagger JSON not found for this project'
    });
  }
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

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server with better error handling
const server = app.listen(PORT, () => {
  console.log(`🚀 AutoAPI Backend server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error('Please either:');
    console.error('1. Kill the process using the port with: lsof -ti:3001 | xargs kill -9');
    console.error('2. Use a different port by setting PORT environment variable');
    process.exit(1);
  } else {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

module.exports = app; 