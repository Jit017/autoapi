# AutoAPI - Express.js API Generator

AutoAPI is a powerful tool that generates complete Express.js REST APIs from JSON schema definitions. It provides a modern web interface to design your API schema and automatically generates production-ready backend code with support for multiple databases, authentication, and Swagger documentation.

## 🚀 Features

- **Visual API Designer**: Intuitive web interface to design your API schema
- **Multiple Database Support**: JSON files, SQLite, and MongoDB
- **Authentication**: Optional JWT-based authentication
- **Swagger Documentation**: Auto-generated API documentation
- **ZIP Downloads**: Download complete API projects as ZIP files
- **Live Preview**: Preview API routes and responses
- **Validation**: Built-in request validation using express-validator
- **Modern UI**: Beautiful interface built with Next.js and Tailwind CSS

## 📋 Prerequisites

- Node.js 16 or higher
- npm or yarn
- (Optional) MongoDB for MongoDB projects
- (Optional) SQLite for SQLite projects

## 🛠 Installation

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd autoapi
   ```

2. **Install all dependencies**
   ```bash
   npm run setup
   ```

3. **Start both frontend and backend**
   ```bash
   npm run dev:full
   ```

### Manual Setup

1. **Install frontend dependencies**
   ```bash
   npm install
   ```

2. **Install backend dependencies**
   ```bash
   npm run backend:install
   ```

3. **Start the backend server**
   ```bash
   npm run backend:dev
   ```

4. **Start the frontend (in a new terminal)**
   ```bash
   npm run dev
   ```

## 🎯 Usage

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health

### Creating Your First API

1. **Visit the AutoAPI Interface**
   - Open http://localhost:3000 in your browser

2. **Design Your Schema**
   - Click "Generate API" to start designing
   - Add entities (e.g., User, Product, Order)
   - Define fields for each entity with types and validation
   - Configure database type and options

3. **Generate API**
   - Click "Generate API" when your schema is complete
   - The system will create a complete Express.js API

4. **Download Your API**
   - Visit the dashboard to see your generated APIs
   - Download as ZIP file
   - Extract and run with `npm install && npm start`

### Example Schema

```json
{
  "entities": [
    {
      "name": "User",
      "fields": [
        {"name": "name", "type": "string", "required": true},
        {"name": "email", "type": "email", "required": true},
        {"name": "age", "type": "number", "required": false}
      ]
    },
    {
      "name": "Post",
      "fields": [
        {"name": "title", "type": "string", "required": true},
        {"name": "content", "type": "text", "required": true},
        {"name": "published", "type": "boolean", "required": false},
        {"name": "authorId", "type": "string", "required": true}
      ]
    }
  ]
}
```

## 🏗 Generated API Structure

Each generated API includes:

```
generated-api/
├── app.js              # Main application file
├── package.json        # Dependencies and scripts
├── README.md          # API-specific documentation
├── controllers/       # Request handlers
├── models/           # Data models
├── routes/           # API route definitions
├── middleware/       # Custom middleware
├── config/           # Database configuration
├── data/             # Data storage (JSON/SQLite)
└── swagger.json      # API documentation
```

## 🔌 API Endpoints

### AutoAPI Backend

- `POST /api/generate` - Generate a new API from schema
- `GET /api/projects` - List all generated projects
- `GET /api/projects/:id` - Get project details
- `GET /api/projects/:id/download` - Download project as ZIP
- `DELETE /api/projects/:id` - Delete a project

### Generated APIs

Each generated API provides standard CRUD operations:

- `GET /api/{entity}s` - List all items
- `GET /api/{entity}s/:id` - Get item by ID
- `POST /api/{entity}s` - Create new item
- `PUT /api/{entity}s/:id` - Update item
- `DELETE /api/{entity}s/:id` - Delete item

## ⚙ Configuration Options

### Database Types

- **JSON**: File-based storage (default)
- **SQLite**: Lightweight SQL database
- **MongoDB**: NoSQL document database

### Authentication

- **Disabled**: Open API (default)
- **JWT**: Token-based authentication

### Documentation

- **Swagger**: Auto-generated API documentation
- **OpenAPI 3.0**: Modern API specification

## 🛡 Field Types

Supported field types:

- `string` - Text data
- `number` - Numeric data
- `boolean` - True/false values
- `email` - Email addresses (with validation)
- `text` - Long text content
- `date` - Date values
- `datetime` - Date and time values
- `uuid` - Unique identifiers

## 🚀 Running Generated APIs

1. **Extract the downloaded ZIP file**
2. **Install dependencies**
   ```bash
   cd your-api-name
   npm install
   ```
3. **Start the API**
   ```bash
   npm start
   ```
4. **Access your API**
   - API: http://localhost:3000
   - Documentation: http://localhost:3000/api-docs (if enabled)

## 🔧 Development Scripts

### Frontend + Backend
- `npm run dev:full` - Start both frontend and backend
- `npm run setup` - Install all dependencies

### Frontend Only
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Backend Only
- `npm run backend:dev` - Start backend with nodemon
- `npm run backend` - Start backend
- `npm run backend:install` - Install backend dependencies

## 🐛 Troubleshooting

### Port Already in Use

If you see "EADDRINUSE" error:

```bash
# Kill process using port 3001
lsof -ti:3001 | xargs kill -9

# Or use a different port
PORT=3002 npm run backend:dev
```

### Common Issues

1. **Backend not starting**: Check if all dependencies are installed
2. **Frontend can't connect**: Ensure backend is running on port 3001
3. **Downloads not working**: Verify backend has write permissions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation at http://localhost:3001/api-docs
- Create an issue in the repository

---

**Happy API Building! 🎉** 