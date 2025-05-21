const fs = require('fs-extra');
const path = require('path');

/**
 * Generate Swagger documentation based on schema
 * @param {Object} project - Project object with schema
 * @param {String} outputDir - Directory to output files
 */
exports.generateSwaggerDocs = async (project, outputDir) => {
  try {
    const { schema, name, description } = project;
    
    // Create swagger definition
    const swaggerDef = {
      openapi: '3.0.0',
      info: {
        title: `${name} API`,
        version: '1.0.0',
        description: description || `API generated for ${name}`
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server'
        }
      ],
      tags: [],
      paths: {},
      components: {
        schemas: {}
      }
    };
    
    // Process each entity in the schema
    for (const entity of schema.entities) {
      await processEntityForSwagger(entity, swaggerDef);
    }
    
    // Write swagger.json file
    await fs.writeJson(path.join(outputDir, 'swagger.json'), swaggerDef, { spaces: 2 });
    
    // Add swagger-ui-express to package.json
    const packageJsonPath = path.join(outputDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.dependencies['swagger-ui-express'] = '^4.6.3';
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    
    return true;
  } catch (error) {
    console.error('Error generating Swagger docs:', error);
    throw new Error(`Swagger generation failed: ${error.message}`);
  }
};

/**
 * Process an entity for Swagger documentation
 * @param {Object} entity - Entity schema
 * @param {Object} swaggerDef - Swagger definition object
 */
async function processEntityForSwagger(entity, swaggerDef) {
  const entityName = entity.name;
  const entityNameLower = entityName.toLowerCase();
  const entityNamePlural = `${entityNameLower}s`;
  const basePath = `/api/${entityNamePlural}`;
  
  // Add tag for entity
  swaggerDef.tags.push({
    name: entityName,
    description: `Operations related to ${entityName}`
  });
  
  // Add schema component
  swaggerDef.components.schemas[entityName] = createSchemaComponent(entity);
  
  // Add paths
  
  // GET all
  swaggerDef.paths[basePath] = {
    get: {
      tags: [entityName],
      summary: `Get all ${entityNamePlural}`,
      description: `Returns a list of all ${entityNamePlural}`,
      responses: {
        200: {
          description: 'Successful operation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  [entityNamePlural]: {
                    type: 'array',
                    items: {
                      $ref: `#/components/schemas/${entityName}`
                    }
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Server error'
        }
      }
    }
  };
  
  // POST - Create new
  swaggerDef.paths[basePath].post = {
    tags: [entityName],
    summary: `Create a new ${entityNameLower}`,
    description: `Creates a new ${entityNameLower} with the provided data`,
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            $ref: `#/components/schemas/${entityName}Input`
          }
        }
      }
    },
    responses: {
      201: {
        description: 'Created successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: `${entityName} created successfully`
                },
                [entityNameLower]: {
                  $ref: `#/components/schemas/${entityName}`
                }
              }
            }
          }
        }
      },
      400: {
        description: 'Invalid input'
      },
      500: {
        description: 'Server error'
      }
    }
  };
  
  // Add input schema for creation
  swaggerDef.components.schemas[`${entityName}Input`] = createInputSchemaComponent(entity);
  
  // GET by ID
  const idPath = `${basePath}/{id}`;
  swaggerDef.paths[idPath] = {
    get: {
      tags: [entityName],
      summary: `Get ${entityNameLower} by ID`,
      description: `Returns a single ${entityNameLower}`,
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: `ID of the ${entityNameLower}`,
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Successful operation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  [entityNameLower]: {
                    $ref: `#/components/schemas/${entityName}`
                  }
                }
              }
            }
          }
        },
        404: {
          description: 'Not found'
        },
        500: {
          description: 'Server error'
        }
      }
    }
  };
  
  // PUT - Update
  swaggerDef.paths[idPath].put = {
    tags: [entityName],
    summary: `Update ${entityNameLower}`,
    description: `Updates an existing ${entityNameLower}`,
    parameters: [
      {
        name: 'id',
        in: 'path',
        description: `ID of the ${entityNameLower}`,
        required: true,
        schema: {
          type: 'string'
        }
      }
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            $ref: `#/components/schemas/${entityName}Input`
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Updated successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: `${entityName} updated successfully`
                },
                [entityNameLower]: {
                  $ref: `#/components/schemas/${entityName}`
                }
              }
            }
          }
        }
      },
      400: {
        description: 'Invalid input'
      },
      404: {
        description: 'Not found'
      },
      500: {
        description: 'Server error'
      }
    }
  };
  
  // DELETE
  swaggerDef.paths[idPath].delete = {
    tags: [entityName],
    summary: `Delete ${entityNameLower}`,
    description: `Deletes an existing ${entityNameLower}`,
    parameters: [
      {
        name: 'id',
        in: 'path',
        description: `ID of the ${entityNameLower}`,
        required: true,
        schema: {
          type: 'string'
        }
      }
    ],
    responses: {
      200: {
        description: 'Deleted successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: `${entityName} deleted successfully`
                }
              }
            }
          }
        }
      },
      404: {
        description: 'Not found'
      },
      500: {
        description: 'Server error'
      }
    }
  };
}

/**
 * Create a schema component for Swagger
 * @param {Object} entity - Entity schema
 * @returns {Object} - Swagger schema component
 */
function createSchemaComponent(entity) {
  const properties = {};
  const required = [];
  
  // Add ID field
  properties.id = {
    type: 'string',
    description: 'Unique identifier'
  };
  
  // Add entity fields
  for (const field of entity.fields) {
    properties[field.name] = {
      type: mapTypeToSwagger(field.type),
      description: field.description || `${field.name} field`
    };
    
    if (field.required) {
      required.push(field.name);
    }
  }
  
  // Add timestamps
  properties.createdAt = {
    type: 'string',
    format: 'date-time',
    description: 'Creation timestamp'
  };
  
  properties.updatedAt = {
    type: 'string',
    format: 'date-time',
    description: 'Last update timestamp'
  };
  
  return {
    type: 'object',
    required: ['id', ...required],
    properties
  };
}

/**
 * Create an input schema component for Swagger
 * @param {Object} entity - Entity schema
 * @returns {Object} - Swagger input schema component
 */
function createInputSchemaComponent(entity) {
  const properties = {};
  const required = [];
  
  // Add entity fields
  for (const field of entity.fields) {
    properties[field.name] = {
      type: mapTypeToSwagger(field.type),
      description: field.description || `${field.name} field`
    };
    
    if (field.required) {
      required.push(field.name);
    }
  }
  
  return {
    type: 'object',
    required,
    properties
  };
}

/**
 * Map a schema type to Swagger type
 * @param {String} type - Schema type
 * @returns {String} - Swagger type
 */
function mapTypeToSwagger(type) {
  switch (type.toLowerCase()) {
    case 'string':
      return 'string';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'date':
      return 'string';
    default:
      return 'string';
  }
} 