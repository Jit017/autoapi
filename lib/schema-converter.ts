import { Schema, SchemaEntity, SchemaField } from './api';

/**
 * Convert from the frontend format to the backend format
 * Frontend format:
 * {
 *   "models": {
 *     "User": {
 *       "id": "uuid primaryKey",
 *       "name": "string",
 *       "email": "string unique",
 *     }
 *   }
 * }
 * 
 * Backend format:
 * {
 *   "entities": [
 *     {
 *       "name": "User",
 *       "fields": [
 *         {
 *           "name": "id",
 *           "type": "uuid",
 *           "required": true
 *         },
 *         {
 *           "name": "name",
 *           "type": "string",
 *           "required": false
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
export function convertToBackendSchema(frontendSchema: string): Schema {
  try {
    // First, check if the schema is empty or just whitespace
    if (!frontendSchema || !frontendSchema.trim()) {
      throw new Error('Schema cannot be empty');
    }

    let parsed;
    try {
      parsed = JSON.parse(frontendSchema);
    } catch (parseError) {
      throw new Error('Invalid JSON format in schema. Please check your syntax.');
    }
    
    // Check if the parsed schema has the expected structure
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Schema must be a valid JSON object');
    }

    const { models } = parsed;
    
    if (!models) {
      throw new Error('Invalid schema: missing "models" object. Schema should have a "models" property containing your data models.');
    }

    if (typeof models !== 'object' || models === null) {
      throw new Error('The "models" property must be an object containing your data models.');
    }

    const modelNames = Object.keys(models);
    if (modelNames.length === 0) {
      throw new Error('No models found in schema. Please define at least one model in the "models" object.');
    }
    
    const entities: SchemaEntity[] = Object.entries(models).map(([name, fields]) => {
      if (!name || typeof name !== 'string') {
        throw new Error(`Invalid model name: ${name}`);
      }

      if (typeof fields !== 'object' || fields === null) {
        throw new Error(`Invalid fields for model "${name}". Fields must be an object.`);
      }
      
      const fieldEntries = Object.entries(fields as Record<string, string>);
      if (fieldEntries.length === 0) {
        throw new Error(`Model "${name}" has no fields. Each model must have at least one field.`);
      }

      const entityFields: SchemaField[] = fieldEntries.map(([fieldName, fieldType]) => {
        if (!fieldName || typeof fieldName !== 'string') {
          throw new Error(`Invalid field name in model "${name}": ${fieldName}`);
        }

        if (!fieldType || typeof fieldType !== 'string') {
          throw new Error(`Invalid field type for "${fieldName}" in model "${name}". Field type must be a string.`);
        }

        // Parse the field type string
        const typeString = fieldType as string;
        const isPrimaryKey = typeString.includes('primaryKey');
        const isRequired = typeString.includes('required') || isPrimaryKey;
        
        // Extract the base type
        let type = typeString.split(' ')[0];
        
        // Validate the base type
        const validTypes = ['string', 'number', 'boolean', 'date', 'datetime', 'uuid', 'text', 'integer', 'float'];
        if (!validTypes.includes(type)) {
          console.warn(`Warning: "${type}" may not be a recognized type for field "${fieldName}" in model "${name}". Supported types: ${validTypes.join(', ')}`);
        }
        
        return {
          name: fieldName,
          type,
          required: isRequired,
          description: `${fieldName} field for ${name}`
        };
      });
      
      return {
        name,
        fields: entityFields
      };
    });
    
    console.log(`Successfully converted schema with ${entities.length} entities:`, entities.map(e => e.name).join(', '));
    return { entities };
  } catch (error) {
    console.error('Schema conversion error:', error);
    if (error instanceof Error) {
      throw error; // Re-throw the specific error message
    }
    throw new Error('Failed to convert schema format. Please check your schema syntax.');
  }
}

/**
 * Generate sample code for a schema
 */
export function generateSampleCode(schema: Schema): string {
  // Generate sample code for the schema
  let code = '';
  
  // Initialize models and routes
  for (const entity of schema.entities) {
    const entityName = entity.name;
    const entityNameLower = entityName.toLowerCase();
    const pluralName = `${entityNameLower}s`;
    
    code += `// ${entityName} Model\n`;
    code += `GET    /api/${pluralName}\n`;
    code += `POST   /api/${pluralName}\n`;
    code += `GET    /api/${pluralName}/:id\n`;
    code += `PUT    /api/${pluralName}/:id\n`;
    code += `DELETE /api/${pluralName}/:id\n\n`;
  }
  
  return code;
} 