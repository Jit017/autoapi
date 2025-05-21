# AutoAPI

AutoAPI is a tool that automatically generates REST APIs from schema definitions. It provides a user-friendly web interface to create, manage, and download generated APIs with different database options and features.

## Features

- Generate Express.js REST APIs from schema definitions
- Support for different database types (JSON, MongoDB, SQLite)
- Optional authentication support
- Automatic Swagger documentation generation
- Project management for saving and retrieving APIs
- Download generated APIs as ZIP files
- Preview API endpoints

## Tech Stack

### Frontend
- Next.js 14
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components

### Backend
- Node.js
- Express.js
- fs-extra for file operations
- Swagger for API documentation
- Archiver for ZIP generation

## Setup

### Environment Variables

Create a `.env.local` file in the project root with:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Start the backend server:
   ```
   npm run backend:dev
   ```

3. Start the frontend server:
   ```
   npm run dev
   ```

4. Open the application in your browser:
   ```
   http://localhost:3000
   ```

## Project Structure

- `/app` - Next.js application routes
- `/components` - React components
- `/lib` - Utility functions and API clients
- `/backend` - Express.js backend code
  - `/controllers` - Request handlers
  - `/models` - Data models
  - `/routes` - API routes
  - `/services` - Business logic services for generating APIs
  - `/data` - Data storage for generated projects

## Usage

1. Visit the Generation page at `/generate`
2. Define your schema, choose database type and other options
3. Click "Generate API" to create your API
4. Download the generated code or view the Swagger documentation
5. Manage your APIs in the Dashboard at `/dashboard`

## API Schema Format

The API accepts schemas in the following format:

```json
{
  "models": {
    "User": {
      "id": "uuid primaryKey",
      "name": "string",
      "email": "string unique"
    },
    "Post": {
      "id": "uuid primaryKey",
      "title": "string",
      "content": "text"
    }
  }
}
```

This is converted internally to the backend format for processing. 