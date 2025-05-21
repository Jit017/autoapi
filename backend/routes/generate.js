const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const generateController = require('../controllers/generateController');

/**
 * @swagger
 * /api/generate:
 *   post:
 *     summary: Generate API from schema
 *     description: Generate Express API code based on provided schema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - schema
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the API project
 *               description:
 *                 type: string
 *                 description: Description of the API project
 *               schema:
 *                 type: object
 *                 description: Schema definition for API entities
 *                 required:
 *                   - entities
 *                 properties:
 *                   entities:
 *                     type: array
 *                     items:
 *                       type: object
 *                       required:
 *                         - name
 *                         - fields
 *                       properties:
 *                         name:
 *                           type: string
 *                           description: Entity name (e.g., User, Product)
 *                         fields:
 *                           type: array
 *                           items:
 *                             type: object
 *                             required:
 *                               - name
 *                               - type
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 description: Field name
 *                               type:
 *                                 type: string
 *                                 description: Field type (string, number, boolean, etc.)
 *                               required:
 *                                 type: boolean
 *                                 description: Whether field is required
 *               config:
 *                 type: object
 *                 description: Configuration options for API generation
 *                 properties:
 *                   dbType:
 *                     type: string
 *                     enum: [json, sqlite, mongodb]
 *                     description: Database type for the generated API
 *                   auth:
 *                     type: boolean
 *                     description: Whether to include authentication
 *                   generateSwagger:
 *                     type: boolean
 *                     description: Whether to generate Swagger documentation
 *     responses:
 *       201:
 *         description: API generated successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Project name is required'),
    body('schema').notEmpty().withMessage('Schema is required'),
    body('schema.entities').isArray().withMessage('Schema must include entities array')
  ],
  generateController.generateAPI
);

module.exports = router; 