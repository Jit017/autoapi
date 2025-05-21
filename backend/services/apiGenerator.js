const fs = require('fs-extra');
const path = require('path');

/**
 * Generate Express API code based on schema
 * @param {Object} project - Project object with schema
 * @param {String} outputDir - Directory to output files
 * @returns {Array} - List of generated routes
 */
exports.generateExpressAPI = async (project, outputDir) => {
  try {
    const { schema, config } = project;
    const routes = [];

    // Ensure output directory exists
    await fs.ensureDir(outputDir);

    // Generate main app.js file
    await generateAppFile(outputDir, schema, config);
    
    // Generate package.json
    await generatePackageJson(outputDir, project.name);
    
    // Create directories
    await fs.ensureDir(path.join(outputDir, 'routes'));
    await fs.ensureDir(path.join(outputDir, 'controllers'));
    await fs.ensureDir(path.join(outputDir, 'models'));
    await fs.ensureDir(path.join(outputDir, 'middleware'));
    
    // Generate README
    await generateReadme(outputDir, project);
    
    // Generate entities (models, routes, controllers)
    for (const entity of schema.entities) {
      const entityRoutes = await generateEntityFiles(entity, outputDir, config);
      routes.push(...entityRoutes);
    }
    
    // Generate database config based on selected type
    await generateDatabaseConfig(outputDir, config);
    
    // Generate middleware
    await generateMiddleware(outputDir, config);
    
    return routes;
  } catch (error) {
    console.error('Error generating Express API:', error);
    throw new Error(`API generation failed: ${error.message}`);
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
      dev: 'nodemon app.js'
    },
    dependencies: {
      express: '^4.18.2',
      cors: '^2.8.5',
      morgan: '^1.10.0',
      'express-validator': '^7.0.1'
    },
    devDependencies: {
      nodemon: '^3.0.1'
    }
  };
  
  await fs.writeJson(path.join(outputDir, 'package.json'), packageJson, { spaces: 2 });
}

/**
 * Generate README file
 */
async function generateReadme(outputDir, project) {
  const { name, description, schema, config } = project;
  const useSwagger = config?.generateSwagger || false;
  
  let readmeContent = `# ${name} API

${description || 'API generated using AutoAPI'}

## Getting Started

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Start the server:
   \`\`\`
   npm start
   \`\`\`
   
   Or for development with auto-reload:
   \`\`\`
   npm run dev
   \`\`\`

${useSwagger ? '3. View API documentation at: `http://localhost:3000/api-docs`\n' : ''}

## Available Endpoints

${schema.entities.map(entity => {
  const entityName = entity.name.toLowerCase();
  return `### ${entity.name}
- GET /api/${entityName}s - List all ${entityName}s
- GET /api/${entityName}s/:id - Get a single ${entityName}
- POST /api/${entityName}s - Create a new ${entityName}
- PUT /api/${entityName}s/:id - Update a ${entityName}
- DELETE /api/${entityName}s/:id - Delete a ${entityName}
`;
}).join('\n')}

## Schema

${schema.entities.map(entity => {
  return `### ${entity.name}
${entity.fields.map(field => `- ${field.name}: ${field.type}${field.required ? ' (required)' : ''}`).join('\n')}
`;
}).join('\n')}
`;

  await fs.writeFile(path.join(outputDir, 'README.md'), readmeContent);
}

/**
 * Generate entity files (model, controller, routes)
 * @param {Object} entity - Entity schema definition
 * @param {String} outputDir - Output directory
 * @param {Object} config - Configuration options
 * @returns {Array} - Routes for this entity
 */
async function generateEntityFiles(entity, outputDir, config) {
  const entityName = entity.name;
  const entityNameLower = entityName.toLowerCase();
  const entityNamePlural = `${entityNameLower}s`;
  
  // Generate model
  await generateModelFile(entity, outputDir, config);
  
  // Generate controller
  await generateControllerFile(entity, outputDir, config);
  
  // Generate routes
  await generateRouteFile(entity, outputDir, config);
  
  // Return routes for this entity
  return [
    { method: 'GET', path: `/api/${entityNamePlural}`, description: `Get all ${entityNamePlural}` },
    { method: 'GET', path: `/api/${entityNamePlural}/:id`, description: `Get ${entityNameLower} by ID` },
    { method: 'POST', path: `/api/${entityNamePlural}`, description: `Create a new ${entityNameLower}` },
    { method: 'PUT', path: `/api/${entityNamePlural}/:id`, description: `Update a ${entityNameLower}` },
    { method: 'DELETE', path: `/api/${entityNamePlural}/:id`, description: `Delete a ${entityNameLower}` }
  ];
}

/**
 * Generate model file
 */
async function generateModelFile(entity, outputDir, config) {
  const entityName = entity.name;
  const dbType = config?.dbType || 'json';
  
  let modelContent = '';
  
  if (dbType === 'json') {
    modelContent = generateJsonModel(entity);
  } else if (dbType === 'sqlite') {
    modelContent = generateSqliteModel(entity);
  } else if (dbType === 'mongodb') {
    modelContent = generateMongoModel(entity);
  }
  
  await fs.writeFile(
    path.join(outputDir, 'models', `${entityName.toLowerCase()}Model.js`),
    modelContent
  );
}

/**
 * Generate JSON-based model
 */
function generateJsonModel(entity) {
  const entityName = entity.name;
  const entityNameLower = entityName.toLowerCase();
  
  return `const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Path to ${entityNameLower}s.json file
const ${entityNameLower}sFile = path.join(dataDir, '${entityNameLower}s.json');

// Initialize ${entityNameLower}s file if it doesn't exist
if (!fs.existsSync(${entityNameLower}sFile)) {
  fs.writeFileSync(${entityNameLower}sFile, JSON.stringify({ ${entityNameLower}s: [] }, null, 2));
}

class ${entityName}Model {
  static getAll() {
    const data = JSON.parse(fs.readFileSync(${entityNameLower}sFile));
    return data.${entityNameLower}s;
  }

  static getById(id) {
    const data = JSON.parse(fs.readFileSync(${entityNameLower}sFile));
    return data.${entityNameLower}s.find(${entityNameLower} => ${entityNameLower}.id === id);
  }

  static create(${entityNameLower}Data) {
    const data = JSON.parse(fs.readFileSync(${entityNameLower}sFile));
    
    const new${entityName} = {
      id: uuidv4(),
      ...${entityNameLower}Data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.${entityNameLower}s.push(new${entityName});
    fs.writeFileSync(${entityNameLower}sFile, JSON.stringify(data, null, 2));
    
    return new${entityName};
  }

  static update(id, updates) {
    const data = JSON.parse(fs.readFileSync(${entityNameLower}sFile));
    const index = data.${entityNameLower}s.findIndex(${entityNameLower} => ${entityNameLower}.id === id);
    
    if (index === -1) return null;
    
    data.${entityNameLower}s[index] = {
      ...data.${entityNameLower}s[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(${entityNameLower}sFile, JSON.stringify(data, null, 2));
    return data.${entityNameLower}s[index];
  }

  static delete(id) {
    const data = JSON.parse(fs.readFileSync(${entityNameLower}sFile));
    const filtered${entityName}s = data.${entityNameLower}s.filter(${entityNameLower} => ${entityNameLower}.id !== id);
    
    if (filtered${entityName}s.length === data.${entityNameLower}s.length) {
      return false;
    }
    
    data.${entityNameLower}s = filtered${entityName}s;
    fs.writeFileSync(${entityNameLower}sFile, JSON.stringify(data, null, 2));
    
    return true;
  }
}

module.exports = ${entityName}Model;`;
}

/**
 * Generate sqlite model (basic implementation)
 */
function generateSqliteModel(entity) {
  const entityName = entity.name;
  const entityNameLower = entityName.toLowerCase();
  
  const fields = entity.fields.map(field => {
    let type = '';
    switch (field.type.toLowerCase()) {
      case 'string':
        type = 'TEXT';
        break;
      case 'number':
      case 'integer':
        type = 'INTEGER';
        break;
      case 'boolean':
        type = 'INTEGER'; // SQLite doesn't have boolean
        break;
      case 'date':
        type = 'TEXT'; // Store as ISO string
        break;
      default:
        type = 'TEXT';
    }
    return `${field.name} ${type}${field.required ? ' NOT NULL' : ''}`;
  }).join(',\n    ');
  
  return `const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize database
const dbPath = path.join(__dirname, '..', 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create ${entityNameLower}s table if it doesn't exist
db.serialize(() => {
  db.run(\`CREATE TABLE IF NOT EXISTS ${entityNameLower}s (
    id TEXT PRIMARY KEY,
    ${fields},
    createdAt TEXT,
    updatedAt TEXT
  )\`);
});

class ${entityName}Model {
  static getAll() {
    return new Promise((resolve, reject) => {
      db.all(\`SELECT * FROM ${entityNameLower}s\`, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  static getById(id) {
    return new Promise((resolve, reject) => {
      db.get(\`SELECT * FROM ${entityNameLower}s WHERE id = ?\`, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  static create(${entityNameLower}Data) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const fields = Object.keys(${entityNameLower}Data).join(', ');
      const placeholders = Object.keys(${entityNameLower}Data).map(() => '?').join(', ');
      const values = Object.values(${entityNameLower}Data);
      
      db.run(
        \`INSERT INTO ${entityNameLower}s (id, \${fields}, createdAt, updatedAt) VALUES (?, \${placeholders}, ?, ?)\`,
        [id, ...values, now, now],
        function(err) {
          if (err) return reject(err);
          
          db.get(\`SELECT * FROM ${entityNameLower}s WHERE id = ?\`, [id], (err, row) => {
            if (err) return reject(err);
            resolve(row);
          });
        }
      );
    });
  }

  static update(id, updates) {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      
      const setClause = Object.keys(updates).map(key => \`\${key} = ?\`).join(', ');
      const values = Object.values(updates);
      
      db.run(
        \`UPDATE ${entityNameLower}s SET \${setClause}, updatedAt = ? WHERE id = ?\`,
        [...values, now, id],
        function(err) {
          if (err) return reject(err);
          
          if (this.changes === 0) return resolve(null);
          
          db.get(\`SELECT * FROM ${entityNameLower}s WHERE id = ?\`, [id], (err, row) => {
            if (err) return reject(err);
            resolve(row);
          });
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run(\`DELETE FROM ${entityNameLower}s WHERE id = ?\`, [id], function(err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }
}

module.exports = ${entityName}Model;`;
}

/**
 * Generate MongoDB model 
 */
function generateMongoModel(entity) {
  const entityName = entity.name;
  const entityNameLower = entityName.toLowerCase();
  
  const schemaFields = entity.fields.map(field => {
    let type = '';
    switch (field.type.toLowerCase()) {
      case 'string':
        type = 'String';
        break;
      case 'number':
        type = 'Number';
        break;
      case 'boolean':
        type = 'Boolean';
        break;
      case 'date':
        type = 'Date';
        break;
      default:
        type = 'String';
    }
    return `  ${field.name}: {
    type: ${type},
    required: ${field.required ? 'true' : 'false'}
  }`;
  }).join(',\n');
  
  return `const mongoose = require('mongoose');

const ${entityName}Schema = new mongoose.Schema({
${schemaFields},
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
${entityName}Schema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model('${entityName}', ${entityName}Schema);`;
}

/**
 * Generate controller file
 */
async function generateControllerFile(entity, outputDir, config) {
  const entityName = entity.name;
  const entityNameLower = entityName.toLowerCase();
  
  const controllerContent = `const { validationResult } = require('express-validator');
const ${entityName}Model = require('../models/${entityNameLower}Model');

// Get all ${entityNameLower}s
exports.getAll${entityName}s = async (req, res) => {
  try {
    const ${entityNameLower}s = await ${entityName}Model.getAll();
    res.json({ ${entityNameLower}s });
  } catch (err) {
    console.error('Error fetching ${entityNameLower}s:', err);
    res.status(500).json({ error: 'Failed to fetch ${entityNameLower}s' });
  }
};

// Get ${entityNameLower} by ID
exports.get${entityName}ById = async (req, res) => {
  try {
    const ${entityNameLower} = await ${entityName}Model.getById(req.params.id);
    
    if (!${entityNameLower}) {
      return res.status(404).json({ error: '${entityName} not found' });
    }
    
    res.json({ ${entityNameLower} });
  } catch (err) {
    console.error('Error fetching ${entityNameLower}:', err);
    res.status(500).json({ error: 'Failed to fetch ${entityNameLower}' });
  }
};

// Create new ${entityNameLower}
exports.create${entityName} = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const new${entityName} = await ${entityName}Model.create(req.body);
    res.status(201).json({ message: '${entityName} created successfully', ${entityNameLower}: new${entityName} });
  } catch (err) {
    console.error('Error creating ${entityNameLower}:', err);
    res.status(500).json({ error: 'Failed to create ${entityNameLower}' });
  }
};

// Update ${entityNameLower}
exports.update${entityName} = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const updated${entityName} = await ${entityName}Model.update(req.params.id, req.body);
    
    if (!updated${entityName}) {
      return res.status(404).json({ error: '${entityName} not found' });
    }
    
    res.json({ message: '${entityName} updated successfully', ${entityNameLower}: updated${entityName} });
  } catch (err) {
    console.error('Error updating ${entityNameLower}:', err);
    res.status(500).json({ error: 'Failed to update ${entityNameLower}' });
  }
};

// Delete ${entityNameLower}
exports.delete${entityName} = async (req, res) => {
  try {
    const success = await ${entityName}Model.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: '${entityName} not found' });
    }
    
    res.json({ message: '${entityName} deleted successfully' });
  } catch (err) {
    console.error('Error deleting ${entityNameLower}:', err);
    res.status(500).json({ error: 'Failed to delete ${entityNameLower}' });
  }
};`;
  
  await fs.writeFile(
    path.join(outputDir, 'controllers', `${entityNameLower}Controller.js`),
    controllerContent
  );
}

/**
 * Generate route file
 */
async function generateRouteFile(entity, outputDir, config) {
  const entityName = entity.name;
  const entityNameLower = entityName.toLowerCase();
  const entityNamePlural = `${entityNameLower}s`;
  const useAuth = config?.auth || false;
  
  // Generate validators for creation/update
  const validationRules = generateValidationRules(entity);
  
  const routeContent = `const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ${entityNameLower}Controller = require('../controllers/${entityNameLower}Controller');
${useAuth ? "const { authenticateToken } = require('../middleware/auth');" : ''}

/**
 * @swagger
 * /api/${entityNamePlural}:
 *   get:
 *     summary: Get all ${entityNamePlural}
 *     description: Retrieve a list of all ${entityNamePlural}
 *     responses:
 *       200:
 *         description: List of ${entityNamePlural}
 *       500:
 *         description: Server error
 */
router.get('/', ${useAuth ? 'authenticateToken, ' : ''}${entityNameLower}Controller.getAll${entityName}s);

/**
 * @swagger
 * /api/${entityNamePlural}/{id}:
 *   get:
 *     summary: Get ${entityNameLower} by ID
 *     description: Retrieve a single ${entityNameLower} by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the ${entityNameLower}
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ${entityName} object
 *       404:
 *         description: ${entityName} not found
 *       500:
 *         description: Server error
 */
router.get('/:id', ${useAuth ? 'authenticateToken, ' : ''}${entityNameLower}Controller.get${entityName}ById);

/**
 * @swagger
 * /api/${entityNamePlural}:
 *   post:
 *     summary: Create a new ${entityNameLower}
 *     description: Create a new ${entityNameLower} with the provided data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               ${entity.fields.filter(f => f.required).map(f => `- ${f.name}`).join('\n *               ')}
 *             properties:
 *               ${entity.fields.map(f => `${f.name}:\n *                 type: ${f.type.toLowerCase()}`).join('\n *               ')}
 *     responses:
 *       201:
 *         description: ${entityName} created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  ${useAuth ? 'authenticateToken, ' : ''}
  [
    ${validationRules}
  ],
  ${entityNameLower}Controller.create${entityName}
);

/**
 * @swagger
 * /api/${entityNamePlural}/{id}:
 *   put:
 *     summary: Update a ${entityNameLower}
 *     description: Update a ${entityNameLower} with the provided data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the ${entityNameLower}
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ${entity.fields.map(f => `${f.name}:\n *                 type: ${f.type.toLowerCase()}`).join('\n *               ')}
 *     responses:
 *       200:
 *         description: ${entityName} updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: ${entityName} not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:id',
  ${useAuth ? 'authenticateToken, ' : ''}
  [
    ${validationRules}
  ],
  ${entityNameLower}Controller.update${entityName}
);

/**
 * @swagger
 * /api/${entityNamePlural}/{id}:
 *   delete:
 *     summary: Delete a ${entityNameLower}
 *     description: Delete a ${entityNameLower} by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the ${entityNameLower}
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ${entityName} deleted successfully
 *       404:
 *         description: ${entityName} not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', ${useAuth ? 'authenticateToken, ' : ''}${entityNameLower}Controller.delete${entityName});

module.exports = router;`;
  
  await fs.writeFile(
    path.join(outputDir, 'routes', `${entityNameLower}Route.js`),
    routeContent
  );
}

/**
 * Generate validation rules for entity
 */
function generateValidationRules(entity) {
  return entity.fields
    .filter(field => field.required)
    .map(field => {
      let validationRule = '';
      
      switch (field.type.toLowerCase()) {
        case 'string':
          validationRule = `body('${field.name}').notEmpty().withMessage('${field.name} is required')`;
          break;
        case 'number':
        case 'integer':
          validationRule = `body('${field.name}').isNumeric().withMessage('${field.name} must be a number')`;
          break;
        case 'boolean':
          validationRule = `body('${field.name}').isBoolean().withMessage('${field.name} must be a boolean')`;
          break;
        case 'date':
          validationRule = `body('${field.name}').isISO8601().withMessage('${field.name} must be a valid date')`;
          break;
        default:
          validationRule = `body('${field.name}').notEmpty().withMessage('${field.name} is required')`;
      }
      
      return validationRule;
    })
    .join(',\n    ');
}

/**
 * Generate database configuration
 */
async function generateDatabaseConfig(outputDir, config) {
  const dbType = config?.dbType || 'json';
  
  // Create data directory
  await fs.ensureDir(path.join(outputDir, 'data'));
  
  // Add DB-specific packages to package.json
  const packageJsonPath = path.join(outputDir, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  
  if (dbType === 'sqlite') {
    packageJson.dependencies['sqlite3'] = '^5.1.6';
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
    
    await fs.writeFile(path.join(outputDir, 'config', 'db.js'), dbConfigContent);
    
    // Update app.js to include DB connection
    const appJsPath = path.join(outputDir, 'app.js');
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
  } else {
    // For JSON, use uuid
    packageJson.dependencies['uuid'] = '^9.0.0';
  }
  
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

/**
 * Generate middleware
 */
async function generateMiddleware(outputDir, config) {
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
};`;
    
    await fs.writeFile(path.join(outputDir, 'middleware', 'auth.js'), authMiddleware);
    
    // Add JWT to package.json
    const packageJsonPath = path.join(outputDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.dependencies['jsonwebtoken'] = '^9.0.1';
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }
} 