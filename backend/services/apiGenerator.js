const fs = require('fs-extra');
const path = require('path');

/**
 * Generate Express API code based on schema
 * @param {Object} project - Project object with schema
 * @param {String} outputDir - Directory to output files
 * @returns {Array} - List of generated routes
 */
exports.generateExpressAPI = async (project, outputDir) => {
  const routes = [];
  try {
    const { schema, config } = project;
    
    console.log(`Generating API in directory: ${outputDir}`);

    // Ensure output directory exists
    await fs.ensureDir(outputDir);

    try {
      // Generate main app.js file
      await generateAppFile(outputDir, schema, config);
      console.log('✓ Generated app.js');
    } catch (error) {
      console.error('Error generating app.js:', error);
    }
    
    try {
      // Generate package.json
      await generatePackageJson(outputDir, project.name);
      console.log('✓ Generated package.json');
    } catch (error) {
      console.error('Error generating package.json:', error);
    }
    
    // Create directories
    const directories = ['routes', 'controllers', 'models', 'middleware', 'config', 'data'];
    for (const dir of directories) {
      try {
        await fs.ensureDir(path.join(outputDir, dir));
      } catch (error) {
        console.error(`Error creating directory ${dir}:`, error);
      }
    }
    
    try {
      // Generate README
      await generateReadme(outputDir, project);
      console.log('✓ Generated README.md');
    } catch (error) {
      console.error('Error generating README:', error);
    }
    
    // Generate entities (models, routes, controllers)
    for (const entity of schema.entities) {
      try {
        const entityRoutes = await generateEntityFiles(entity, outputDir, config);
        routes.push(...entityRoutes);
        console.log(`✓ Generated files for entity: ${entity.name}`);
      } catch (error) {
        console.error(`Error generating files for entity ${entity.name}:`, error);
      }
    }
    
    try {
      // Generate database config based on selected type
      await generateDatabaseConfig(outputDir, config);
      console.log('✓ Generated database configuration');
    } catch (error) {
      console.error('Error generating database configuration:', error);
    }
    
    try {
      // Generate middleware
      await generateMiddleware(outputDir, config);
      console.log('✓ Generated middleware');
    } catch (error) {
      console.error('Error generating middleware:', error);
    }
    
    return routes;
  } catch (error) {
    console.error('Error generating Express API:', error);
    throw error;
  }
};

/**
 * Main function to create API project
 */
exports.createApiProject = async (project, outputDir) => {
  try {
    console.log('Creating API project:', project.name);
    
    const routes = await this.generateExpressAPI(project, outputDir);
    
    return {
      success: true,
      project: project,
      routes: routes,
      outputDir: outputDir
    };
  } catch (error) {
    console.error('Error creating API project:', error);
    throw error;
  }
};

/**
 * Generate main app.js file
 */
async function generateAppFile(outputDir, schema, config) {
  const entities = schema.entities.map(e => e.name.toLowerCase());
  const useAuth = config?.auth || false;
  const useSwagger = config?.generateSwagger || false;
  
  let appContent = `const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
${useSwagger ? "const swaggerUi = require('swagger-ui-express');\nconst swaggerDocument = require('./swagger.json');" : ''}
${useAuth ? "const { authenticateToken } = require('./middleware/auth');" : ''}

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
${entities.map(entity => `app.use('/api/${entity}s', require('./routes/${entity}Route'));`).join('\n')}

${useSwagger ? "// Swagger documentation\napp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));" : ''}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
  ${useSwagger ? "console.log(`API Documentation available at http://localhost:\${PORT}/api-docs`);" : ''}
});

module.exports = app;`;

  await fs.writeFile(path.join(outputDir, 'app.js'), appContent);
}

/**
 * Generate package.json file
 */
async function generatePackageJson(outputDir, projectName) {
  const packageJson = {
    name: projectName.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    description: 'Generated API using AutoAPI',
    main: 'app.js',
    scripts: {
      start: 'node app.js',
      dev: 'nodemon app.js',
      test: 'echo "Error: no test specified" && exit 1'
    },
    dependencies: {
      express: '^4.18.2',
      cors: '^2.8.5',
      morgan: '^1.10.0',
      'express-validator': '^7.0.1'
    },
    devDependencies: {
      nodemon: '^3.0.1'
    },
    keywords: ['api', 'express', 'autogenerated'],
    author: 'AutoAPI Generator',
    license: 'MIT'
  };
  
  await fs.writeJson(path.join(outputDir, 'package.json'), packageJson, { spaces: 2 });
}

/**
 * Generate README.md file
 */
async function generateReadme(outputDir, project) {
  const entities = project.schema.entities.map(e => e.name);
  const { config } = project;
  
  const readmeContent = `# ${project.name}

${project.description || 'Generated API using AutoAPI'}

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. The server will be running at [http://localhost:3000](http://localhost:3000).

## API Endpoints

### Available Entities

${entities.map(entity => `- **${entity}** - \`/api/${entity.toLowerCase()}s\``).join('\n')}

### Standard Operations

Each entity supports the following operations:

- \`GET /api/{entity}s\` - List all items
- \`GET /api/{entity}s/:id\` - Get item by ID
- \`POST /api/{entity}s\` - Create new item
- \`PUT /api/{entity}s/:id\` - Update item
- \`DELETE /api/{entity}s/:id\` - Delete item

## Configuration

- **Database**: ${config?.dbType || 'JSON'}
- **Authentication**: ${config?.auth ? 'Enabled' : 'Disabled'}
- **Swagger Documentation**: ${config?.generateSwagger ? 'Enabled' : 'Disabled'}

${config?.generateSwagger ? '## API Documentation\n\nSwagger documentation is available at [http://localhost:3000/api-docs](http://localhost:3000/api-docs)' : ''}

## Generated by AutoAPI

This API was generated using the AutoAPI tool. Visit [AutoAPI](http://localhost:3000) to generate your own APIs.
`;

  await fs.writeFile(path.join(outputDir, 'README.md'), readmeContent);
}

/**
 * Generate entity files (model, route, controller)
 */
async function generateEntityFiles(entity, outputDir, config) {
  const entityName = entity.name;
  const entityNameLower = entityName.toLowerCase();
  const entityNamePlural = `${entityNameLower}s`;
  
  const routes = [];
  
  try {
    // Generate model
    await generateModel(entity, outputDir, config);
    
    // Generate controller
    await generateController(entity, outputDir, config);
    
    // Generate route
    const entityRoutes = await generateRoute(entity, outputDir, config);
    routes.push(...entityRoutes);
    
    return routes;
  } catch (error) {
    console.error(`Error generating entity files for ${entityName}:`, error);
    throw error;
  }
}

/**
 * Generate model file
 */
async function generateModel(entity, outputDir, config) {
  const entityName = entity.name;
  const entityNameLower = entityName.toLowerCase();
  const dbType = config?.dbType || 'json';
  
  let modelContent = '';
  
  if (dbType === 'mongodb') {
    // MongoDB model with Mongoose
    const fields = entity.fields.map(field => {
      const mongooseType = getMongooseType(field.type);
      const required = field.required ? ', required: true' : '';
      return `  ${field.name}: { type: ${mongooseType}${required} }`;
    }).join(',\n');
    
    modelContent = `const mongoose = require('mongoose');

const ${entityName}Schema = new mongoose.Schema({
${fields}
}, {
  timestamps: true
});

module.exports = mongoose.model('${entityName}', ${entityName}Schema);`;
  } else if (dbType === 'sqlite') {
    // SQLite model (basic implementation)
    modelContent = `const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, '../data/${entityNameLower}s.db');
const db = new Database(dbPath);

// Create table if it doesn't exist
const createTableQuery = \`
  CREATE TABLE IF NOT EXISTS ${entityNameLower}s (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
${entity.fields.map(field => `    ${field.name} ${getSQLiteType(field.type)}`).join(',\n')},
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
\`;

db.exec(createTableQuery);

module.exports = {
  db,
  tableName: '${entityNameLower}s'
};`;
  } else {
    // JSON file model
    modelContent = `const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ${entityName}Model {
  constructor() {
    this.dataFile = path.join(__dirname, '../data/${entityNameLower}s.json');
    this.ensureDataFile();
  }

  async ensureDataFile() {
    try {
      await fs.ensureFile(this.dataFile);
      const exists = await fs.pathExists(this.dataFile);
      if (exists) {
        const content = await fs.readFile(this.dataFile, 'utf8');
        if (!content.trim()) {
          await fs.writeJson(this.dataFile, []);
        }
      } else {
        await fs.writeJson(this.dataFile, []);
      }
    } catch (error) {
      console.error('Error ensuring data file:', error);
      await fs.writeJson(this.dataFile, []);
    }
  }

  async getAll() {
    try {
      await this.ensureDataFile();
      return await fs.readJson(this.dataFile);
    } catch (error) {
      console.error('Error reading data file:', error);
      return [];
    }
  }

  async findById(id) {
    const items = await this.getAll();
    return items.find(item => item.id === id);
  }

  async create(data) {
    const items = await this.getAll();
    const newItem = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    await fs.writeJson(this.dataFile, items, { spaces: 2 });
    return newItem;
  }

  async update(id, data) {
    const items = await this.getAll();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    items[index] = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    await fs.writeJson(this.dataFile, items, { spaces: 2 });
    return items[index];
  }

  async delete(id) {
    const items = await this.getAll();
    const filteredItems = items.filter(item => item.id !== id);
    if (filteredItems.length === items.length) return false;
    
    await fs.writeJson(this.dataFile, filteredItems, { spaces: 2 });
    return true;
  }
}

module.exports = new ${entityName}Model();`;
  }
  
  await fs.writeFile(path.join(outputDir, 'models', `${entityNameLower}Model.js`), modelContent);
}

/**
 * Generate controller file
 */
async function generateController(entity, outputDir, config) {
  const entityName = entity.name;
  const entityNameLower = entityName.toLowerCase();
  const dbType = config?.dbType || 'json';
  
  let controllerContent = '';
  
  if (dbType === 'mongodb') {
    controllerContent = `const ${entityName} = require('../models/${entityNameLower}Model');
const { validationResult } = require('express-validator');

// Get all ${entityNameLower}s
exports.getAll${entityName}s = async (req, res) => {
  try {
    const items = await ${entityName}.find();
    res.json(items);
  } catch (error) {
    console.error('Error fetching ${entityNameLower}s:', error);
    res.status(500).json({ error: 'Failed to fetch ${entityNameLower}s' });
  }
};

// Get ${entityNameLower} by ID
exports.get${entityName}ById = async (req, res) => {
  try {
    const item = await ${entityName}.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: '${entityName} not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching ${entityNameLower}:', error);
    res.status(500).json({ error: 'Failed to fetch ${entityNameLower}' });
  }
};

// Create new ${entityNameLower}
exports.create${entityName} = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = new ${entityName}(req.body);
    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error creating ${entityNameLower}:', error);
    res.status(500).json({ error: 'Failed to create ${entityNameLower}' });
  }
};

// Update ${entityNameLower}
exports.update${entityName} = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = await ${entityName}.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({ error: '${entityName} not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error updating ${entityNameLower}:', error);
    res.status(500).json({ error: 'Failed to update ${entityNameLower}' });
  }
};

// Delete ${entityNameLower}
exports.delete${entityName} = async (req, res) => {
  try {
    const item = await ${entityName}.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: '${entityName} not found' });
    }
    res.json({ message: '${entityName} deleted successfully' });
  } catch (error) {
    console.error('Error deleting ${entityNameLower}:', error);
    res.status(500).json({ error: 'Failed to delete ${entityNameLower}' });
  }
};`;
  } else {
    // JSON or SQLite controller (using model methods)
    controllerContent = `const ${entityNameLower}Model = require('../models/${entityNameLower}Model');
const { validationResult } = require('express-validator');

// Get all ${entityNameLower}s
exports.getAll${entityName}s = async (req, res) => {
  try {
    const items = await ${entityNameLower}Model.getAll();
    res.json(items);
  } catch (error) {
    console.error('Error fetching ${entityNameLower}s:', error);
    res.status(500).json({ error: 'Failed to fetch ${entityNameLower}s' });
  }
};

// Get ${entityNameLower} by ID
exports.get${entityName}ById = async (req, res) => {
  try {
    const item = await ${entityNameLower}Model.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: '${entityName} not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching ${entityNameLower}:', error);
    res.status(500).json({ error: 'Failed to fetch ${entityNameLower}' });
  }
};

// Create new ${entityNameLower}
exports.create${entityName} = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = await ${entityNameLower}Model.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating ${entityNameLower}:', error);
    res.status(500).json({ error: 'Failed to create ${entityNameLower}' });
  }
};

// Update ${entityNameLower}
exports.update${entityName} = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = await ${entityNameLower}Model.update(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ error: '${entityName} not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error updating ${entityNameLower}:', error);
    res.status(500).json({ error: 'Failed to update ${entityNameLower}' });
  }
};

// Delete ${entityNameLower}
exports.delete${entityName} = async (req, res) => {
  try {
    const deleted = await ${entityNameLower}Model.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: '${entityName} not found' });
    }
    res.json({ message: '${entityName} deleted successfully' });
  } catch (error) {
    console.error('Error deleting ${entityNameLower}:', error);
    res.status(500).json({ error: 'Failed to delete ${entityNameLower}' });
  }
};`;
  }
  
  await fs.writeFile(path.join(outputDir, 'controllers', `${entityNameLower}Controller.js`), controllerContent);
}

/**
 * Generate route file
 */
async function generateRoute(entity, outputDir, config) {
  const entityName = entity.name;
  const entityNameLower = entityName.toLowerCase();
  const entityNamePlural = `${entityNameLower}s`;
  
  // Generate validation rules
  const validationRules = entity.fields.map(field => {
    const rules = [];
    if (field.required) {
      rules.push(`notEmpty().withMessage('${field.name} is required')`);
    }
    if (field.type === 'email') {
      rules.push(`isEmail().withMessage('${field.name} must be a valid email')`);
    }
    if (field.type === 'number') {
      rules.push(`isNumeric().withMessage('${field.name} must be a number')`);
    }
    return rules.length > 0 ? `body('${field.name}').${rules.join('.')}` : null;
  }).filter(Boolean);
  
  const routeContent = `const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ${entityNameLower}Controller = require('../controllers/${entityNameLower}Controller');

// Validation middleware
const validate${entityName} = [
${validationRules.map(rule => `  ${rule}`).join(',\n')}
];

// Routes
router.get('/', ${entityNameLower}Controller.getAll${entityName}s);
router.get('/:id', ${entityNameLower}Controller.get${entityName}ById);
router.post('/', validate${entityName}, ${entityNameLower}Controller.create${entityName});
router.put('/:id', validate${entityName}, ${entityNameLower}Controller.update${entityName});
router.delete('/:id', ${entityNameLower}Controller.delete${entityName});

module.exports = router;`;
  
  await fs.writeFile(path.join(outputDir, 'routes', `${entityNameLower}Route.js`), routeContent);
  
  // Return route information
  const routes = [
    { method: 'GET', path: `/api/${entityNamePlural}`, description: `Get all ${entityNamePlural}` },
    { method: 'GET', path: `/api/${entityNamePlural}/:id`, description: `Get ${entityNameLower} by ID` },
    { method: 'POST', path: `/api/${entityNamePlural}`, description: `Create new ${entityNameLower}` },
    { method: 'PUT', path: `/api/${entityNamePlural}/:id`, description: `Update ${entityNameLower}` },
    { method: 'DELETE', path: `/api/${entityNamePlural}/:id`, description: `Delete ${entityNameLower}` }
  ];
  
  return routes;
}

/**
 * Generate database configuration
 */
async function generateDatabaseConfig(outputDir, config) {
  try {
    const dbType = config?.dbType || 'json';
    
    // Create necessary directories
    await fs.ensureDir(path.join(outputDir, 'data'));
    await fs.ensureDir(path.join(outputDir, 'config'));
    
    // Add DB-specific packages to package.json
    const packageJsonPath = path.join(outputDir, 'package.json');
    let packageJson;
    
    try {
      packageJson = await fs.readJson(packageJsonPath);
    } catch (error) {
      console.error('Error reading package.json:', error);
      packageJson = {
        name: 'generated-api',
        version: '1.0.0',
        description: 'Generated API',
        main: 'app.js',
        scripts: {
          start: 'node app.js',
          dev: 'nodemon app.js'
        },
        dependencies: {},
        devDependencies: {
          nodemon: '^3.0.1'
        }
      };
    }
    
    // Ensure dependencies object exists
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    
    if (dbType === 'sqlite') {
      packageJson.dependencies['better-sqlite3'] = '^8.7.0';
    } else if (dbType === 'mongodb') {
      packageJson.dependencies['mongoose'] = '^7.5.0';
      
      // Create db.js config file
      const dbConfigContent = `const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/api_db');
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`Error connecting to MongoDB: \${error.message}\`);
    process.exit(1);
  }
};

module.exports = connectDB;`;
      
      try {
        await fs.writeFile(path.join(outputDir, 'config', 'db.js'), dbConfigContent);
        
        // Update app.js to include DB connection
        const appJsPath = path.join(outputDir, 'app.js');
        
        if (await fs.pathExists(appJsPath)) {
          let appJsContent = await fs.readFile(appJsPath, 'utf8');
          
          appJsContent = appJsContent.replace(
            '// Initialize app',
            `// DB Connection\nconst connectDB = require('./config/db');\n\n// Initialize app`
          );
          
          appJsContent = appJsContent.replace(
            '// Start server',
            `// Connect to database and start server\nconnectDB().then(() => {`
          );
          
          appJsContent = appJsContent.replace(
            'module.exports = app;',
            '});\n\nmodule.exports = app;'
          );
          
          await fs.writeFile(appJsPath, appJsContent);
        }
      } catch (error) {
        console.error('Error setting up MongoDB configuration:', error);
      }
    } else {
      // For JSON, use uuid
      packageJson.dependencies['uuid'] = '^9.0.0';
    }
    
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  } catch (error) {
    console.error('Error generating database configuration:', error);
    throw error;
  }
}

/**
 * Generate middleware
 */
async function generateMiddleware(outputDir, config) {
  try {
    // Ensure middleware directory exists
    await fs.ensureDir(path.join(outputDir, 'middleware'));
    
    // Create validation middleware
    const validationMiddleware = `const { validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};`;
    
    await fs.writeFile(path.join(outputDir, 'middleware', 'validation.js'), validationMiddleware);
    
    // Create auth middleware if enabled
    if (config?.auth) {
      const authMiddleware = `const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};

exports.generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '24h' });
};`;
      
      await fs.writeFile(path.join(outputDir, 'middleware', 'auth.js'), authMiddleware);
      
      // Add JWT to package.json
      try {
        const packageJsonPath = path.join(outputDir, 'package.json');
        if (await fs.pathExists(packageJsonPath)) {
          const packageJson = await fs.readJson(packageJsonPath);
          
          if (!packageJson.dependencies) {
            packageJson.dependencies = {};
          }
          
          packageJson.dependencies['jsonwebtoken'] = '^9.0.1';
          packageJson.dependencies['bcryptjs'] = '^2.4.3';
          await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        }
      } catch (error) {
        console.error('Error updating package.json with JWT dependency:', error);
      }
    }
  } catch (error) {
    console.error('Error generating middleware:', error);
    throw error;
  }
}

// Helper functions
function getMongooseType(type) {
  switch (type.toLowerCase()) {
    case 'string':
    case 'text':
    case 'email':
      return 'String';
    case 'number':
    case 'integer':
      return 'Number';
    case 'boolean':
      return 'Boolean';
    case 'date':
    case 'datetime':
      return 'Date';
    default:
      return 'String';
  }
}

function getSQLiteType(type) {
  switch (type.toLowerCase()) {
    case 'string':
    case 'text':
    case 'email':
      return 'TEXT';
    case 'number':
    case 'integer':
      return 'INTEGER';
    case 'boolean':
      return 'BOOLEAN';
    case 'date':
    case 'datetime':
      return 'DATETIME';
    default:
      return 'TEXT';
  }
} 