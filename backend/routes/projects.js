const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     description: Retrieve a list of all generated API projects
 *     responses:
 *       200:
 *         description: List of projects
 *       500:
 *         description: Server error
 */
router.get('/', projectController.getAllProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     description: Retrieve a project by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.get('/:id', projectController.getProjectById);

/**
 * @swagger
 * /api/projects/{id}/download:
 *   get:
 *     summary: Download project
 *     description: Download project files as a ZIP archive
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ZIP file
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.get('/:id/download', projectController.downloadProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete project
 *     description: Delete a project by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', projectController.deleteProject);

module.exports = router; 