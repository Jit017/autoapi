# AutoAPI Backend

This is the backend for the AutoAPI tool, which generates Express.js REST APIs from schema definitions.

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run backend:dev
   ```

3. The server will be running at [http://localhost:3001](http://localhost:3001).
   - API documentation is available at [http://localhost:3001/api-docs](http://localhost:3001/api-docs).

## API Endpoints

### Generate API

- `POST /api/generate` - Generate a new API from schema definition
  - Accepts JSON with schema and configuration options
  - Returns details about the generated API including routes

### Projects

- `GET /api/projects` - List all generated projects
- `GET /api/projects/:id` - Get details of a specific project
- `GET /api/projects/:id/download` - Download project files as ZIP
- `DELETE /api/projects/:id` - Delete a project

### Project Documentation

- `GET /projects/:id/docs` - View Swagger UI documentation for a generated project (if enabled)

## Project Structure

```
backend/
├── controllers/      # Request handlers
├── models/           # Data models
├── routes/           # API route definitions
├── services/         # Business logic
├── data/             # Storage for generated projects
│   └── projects/     # Individual project folders
├── middleware/       # Custom middleware
└── server.js         # Main application entry
```

## Storage

Projects are stored in two places:
1. Project metadata is stored in `data/projects.json`
2. Generated files are stored in `data/projects/{project_id}/`

## Configuration Options

When generating an API, you can specify the following configuration options:

| Option | Description | Values |
|--------|-------------|--------|
| dbType | Database type | `json`, `sqlite`, `mongodb` |
| auth | Include authentication | `true`, `false` |
| generateSwagger | Generate Swagger docs | `true`, `false` | 