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
    const parsed = JSON.parse(frontendSchema);
    const { models } = parsed;
    
    if (!models) {
      throw new Error('Invalid schema: missing "models" object');
    }
    
    const entities: SchemaEntity[] = Object.entries(models).map(([name, fields]) => {
      if (typeof fields !== 'object') {
        throw new Error(`Invalid fields for model ${name}`);
      }
      
      const entityFields: SchemaField[] = Object.entries(fields as Record<string, string>).map(([fieldName, fieldType]) => {
        // Parse the field type string
        const typeString = fieldType as string;
        const isPrimaryKey = typeString.includes('primaryKey');
        const isRequired = typeString.includes('required') || isPrimaryKey;
        
        // Extract the base type
        let type = typeString.split(' ')[0];
        
        return {
          name: fieldName,
          type,
          required: isRequired
        };
      });
      
      return {
        name,
        fields: entityFields
      };
    });
    
    return { entities };
  } catch (error) {
    console.error('Schema conversion error:', error);
    throw new Error('Failed to convert schema format');
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