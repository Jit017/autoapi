"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/code-block"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState("getting-started")

  return (
    <div className="container py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl"
      >
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3">Documentation</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to know about AutoAPI</p>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                {[
                  { id: "getting-started", label: "Getting Started" },
                  { id: "api-reference", label: "API Reference" },
                  { id: "cli-usage", label: "CLI Usage" },
                  { id: "examples", label: "Examples" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="relative rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="getting-started" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Getting Started with AutoAPI</h2>
                  <p className="text-muted-foreground">
                    AutoAPI makes it easy to generate fully functional APIs from simple configurations. Follow these
                    steps to create your first API.
                  </p>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="installation" className="border rounded-lg px-4 mb-3">
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <div className="flex items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-2">
                            1
                          </div>
                          <span className="font-semibold">Installation</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4">
                        <div className="space-y-4 pl-10">
                          <p>Install AutoAPI globally using npm:</p>
                          <CodeBlock code="npm install -g autoapi-cli" language="bash" />
                          <p>Or use it directly with npx:</p>
                          <CodeBlock code="npx autoapi-cli generate" language="bash" />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="create-schema" className="border rounded-lg px-4 mb-3">
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <div className="flex items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-2">
                            2
                          </div>
                          <span className="font-semibold">Creating a Schema</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4">
                        <div className="space-y-4 pl-10">
                          <p>Create a schema.json file with your data models:</p>
                          <CodeBlock
                            code={`{
  "models": {
    "User": {
      "id": "uuid primaryKey",
      "name": "string",
      "email": "string unique",
      "createdAt": "datetime"
    },
    "Post": {
      "id": "uuid primaryKey",
      "title": "string",
      "content": "text",
      "published": "boolean default:false",
      "authorId": "uuid references:User.id",
      "createdAt": "datetime"
    }
  }
}`}
                            language="json"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="generate-api" className="border rounded-lg px-4 mb-3">
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <div className="flex items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-2">
                            3
                          </div>
                          <span className="font-semibold">Generating an API</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4">
                        <div className="space-y-4 pl-10">
                          <p>Generate your API using the CLI:</p>
                          <CodeBlock code="autoapi generate --schema schema.json --db postgresql" language="bash" />
                          <p>Or use our web interface:</p>
                          <Button asChild className="mt-2">
                            <a href="/generate">Go to API Generator</a>
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="running-api" className="border rounded-lg px-4">
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <div className="flex items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-2">
                            4
                          </div>
                          <span className="font-semibold">Running Your API</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4">
                        <div className="space-y-4 pl-10">
                          <p>Navigate to your generated API directory:</p>
                          <CodeBlock code="cd my-awesome-api" language="bash" />
                          <p>Install dependencies:</p>
                          <CodeBlock code="npm install" language="bash" />
                          <p>Start the server:</p>
                          <CodeBlock code="npm start" language="bash" />
                          <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <p className="font-medium text-green-700 dark:text-green-300">
                              Your API will be running at http://localhost:3000
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </TabsContent>

              <TabsContent value="api-reference" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">API Reference</h2>
                  <p className="text-muted-foreground">
                    Comprehensive documentation for the AutoAPI endpoints and configuration options.
                  </p>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="schema-format" className="border rounded-lg px-4 mb-3">
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <span className="font-semibold">Schema Format</span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4">
                        <div className="space-y-4">
                          <p>The schema format defines your data models and their relationships:</p>
                          <CodeBlock
                            code={`{
  "models": {
    "ModelName": {
      "fieldName": "fieldType [constraints]",
      // More fields...
    },
    // More models...
  }
}`}
                            language="json"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="space-y-2">
                              <h4 className="font-semibold">Available field types:</h4>
                              <ul className="space-y-1 pl-5 list-disc text-muted-foreground">
                                <li>
                                  <span className="font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                                    string
                                  </span>{" "}
                                  - Text data
                                </li>
                                <li>
                                  <span className="font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                                    integer
                                  </span>{" "}
                                  - Whole numbers
                                </li>
                                <li>
                                  <span className="font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                                    float
                                  </span>{" "}
                                  - Decimal numbers
                                </li>
                                <li>
                                  <span className="font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                                    boolean
                                  </span>{" "}
                                  - True/false values
                                </li>
                                <li>
                                  <span className="font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                                    datetime
                                  </span>{" "}
                                  - Date and time
                                </li>
                                <li>
                                  <span className="font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                                    uuid
                                  </span>{" "}
                                  - Unique identifier
                                </li>
                                <li>
                                  <span className="font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                                    text
                                  </span>{" "}
                                  - Long-form text
                                </li>
                                <li>
                                  <span className="font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                                    json
                                  </span>{" "}
                                  - JSON data
                                </li>
                              </ul>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-semibold">Available constraints:</h4>
                              <ul className="space-y-1 pl-5 list-disc text-muted-foreground">
                                <li>
                                  <span className="font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                                    primaryKey
                                  </span>{" "}
                                  - Primary key
                                </li>
                                <li>
                                  <span className="font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                                    unique
                                  </span>{" "}
                                  - Ensures values are unique
                                </li>
                                <li>
                                  <span className="font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                                    required
                                  </span>{" "}
                                  - Field cannot be null
                                </li>
                                <li>
                                  <span className="font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                                    default:value
                                  </span>{" "}
                                  - Sets default value
                                </li>
                                <li>
                                  <span className="font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                                    references:Model.field
                                  </span>{" "}
                                  - Foreign key
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="rest-endpoints" className="border rounded-lg px-4 mb-3">
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <span className="font-semibold">REST Endpoints</span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4">
                        <div className="space-y-4">
                          <p>For each model, AutoAPI generates the following RESTful endpoints:</p>
                          <CodeBlock
                            code={`// For a model named "User"
GET    /api/users       # List all users
POST   /api/users       # Create a new user
GET    /api/users/:id   # Get a specific user
PUT    /api/users/:id   # Update a specific user
DELETE /api/users/:id   # Delete a specific user

// Query parameters for GET /api/users
?limit=10              # Limit results
?offset=0              # Pagination offset
?sort=name             # Sort by field
?order=asc             # Sort order (asc or desc)
?filter[field]=value   # Filter by field value`}
                            language="http"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="authentication" className="border rounded-lg px-4">
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <span className="font-semibold">Authentication</span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4">
                        <div className="space-y-4">
                          <p>When authentication is enabled, the following endpoints are generated:</p>
                          <CodeBlock
                            code={`POST   /api/auth/register   # Register a new user
POST   /api/auth/login      # Login and get JWT token
POST   /api/auth/logout     # Logout (invalidate token)
GET    /api/auth/me         # Get current user info
PUT    /api/auth/me         # Update current user
POST   /api/auth/refresh    # Refresh JWT token`}
                            language="http"
                          />
                          <p>Authentication uses JWT tokens by default. Include the token in your requests:</p>
                          <CodeBlock
                            code={`// In request headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
                            language="http"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </TabsContent>

              <TabsContent value="cli-usage" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">CLI Usage</h2>
                  <p className="text-muted-foreground">
                    Learn how to use the AutoAPI command-line interface for advanced usage scenarios.
                  </p>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="cli-commands" className="border rounded-lg px-4 mb-3">
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <span className="font-semibold">CLI Commands</span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4">
                        <div className="space-y-4">
                          <p>The AutoAPI CLI provides several commands:</p>
                          <CodeBlock
                            code={`# Generate an API
autoapi generate --schema schema.json --db postgresql

# Validate a schema
autoapi validate --schema schema.json

# Add a model to existing schema
autoapi model:add --schema schema.json --name Comment

# Generate migrations
autoapi migrations:generate

# Run migrations
autoapi migrations:run

# Generate documentation
autoapi docs:generate`}
                            language="bash"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="cli-options" className="border rounded-lg px-4 mb-3">
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <span className="font-semibold">CLI Options</span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4">
                        <div className="space-y-4">
                          <p>Common options for the generate command:</p>
                          <div className="overflow-hidden rounded-lg border">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-muted">
                                  <th className="px-4 py-2 text-left font-medium">Option</th>
                                  <th className="px-4 py-2 text-left font-medium">Description</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                <tr>
                                  <td className="px-4 py-2 font-mono text-xs">--schema, -s</td>
                                  <td className="px-4 py-2">Path to schema file</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-2 font-mono text-xs">--db, -d</td>
                                  <td className="px-4 py-2">Database type (postgresql, mongodb, sqlite)</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-2 font-mono text-xs">--output, -o</td>
                                  <td className="px-4 py-2">Output directory</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-2 font-mono text-xs">--name, -n</td>
                                  <td className="px-4 py-2">Project name</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-2 font-mono text-xs">--auth</td>
                                  <td className="px-4 py-2">Include authentication</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-2 font-mono text-xs">--swagger</td>
                                  <td className="px-4 py-2">Generate Swagger documentation</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-2 font-mono text-xs">--typescript</td>
                                  <td className="px-4 py-2">Use TypeScript</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-2 font-mono text-xs">--force</td>
                                  <td className="px-4 py-2">Overwrite existing files</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="config-file" className="border rounded-lg px-4">
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <span className="font-semibold">Configuration File</span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4">
                        <div className="space-y-4">
                          <p>You can create an autoapi.config.json file in your project:</p>
                          <CodeBlock
                            code={`{
  "schema": "./schema.json",
  "database": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "username": "postgres",
    "password": "password",
    "database": "my_api"
  },
  "options": {
    "auth": true,
    "swagger": true,
    "typescript": true,
    "cors": true
  }
}`}
                            language="json"
                          />
                          <p>Then run the CLI without arguments:</p>
                          <CodeBlock code="autoapi generate" language="bash" />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </TabsContent>

              <TabsContent value="examples" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Examples</h2>
                  <p className="text-muted-foreground">Explore example projects and use cases for AutoAPI.</p>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg border p-6 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold mb-3">Blog API</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        A simple blog API with users, posts, and comments
                      </p>
                      <CodeBlock
                        code={`{
  "models": {
    "User": {
      "id": "uuid primaryKey",
      "name": "string",
      "email": "string unique"
    },
    "Post": {
      "id": "uuid primaryKey",
      "title": "string",
      "content": "text",
      "authorId": "uuid references:User.id"
    },
    "Comment": {
      "id": "uuid primaryKey",
      "content": "text",
      "authorId": "uuid references:User.id",
      "postId": "uuid references:Post.id"
    }
  }
}`}
                        language="json"
                      />
                      <Button asChild className="mt-4 w-full">
                        <a href="/generate">Try this example</a>
                      </Button>
                    </div>

                    <div className="rounded-lg border p-6 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold mb-3">E-commerce API</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        An e-commerce API with products, categories, and orders
                      </p>
                      <CodeBlock
                        code={`{
  "models": {
    "Product": {
      "id": "uuid primaryKey",
      "name": "string",
      "description": "text",
      "price": "float",
      "stock": "integer default:0",
      "categoryId": "uuid references:Category.id"
    },
    "Category": {
      "id": "uuid primaryKey",
      "name": "string",
      "description": "text"
    },
    "Order": {
      "id": "uuid primaryKey",
      "userId": "uuid references:User.id",
      "status": "string default:pending",
      "total": "float"
    },
    "OrderItem": {
      "id": "uuid primaryKey",
      "orderId": "uuid references:Order.id",
      "productId": "uuid references:Product.id",
      "quantity": "integer",
      "price": "float"
    }
  }
}`}
                        language="json"
                      />
                      <Button asChild className="mt-4 w-full">
                        <a href="/generate">Try this example</a>
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border p-6 hover:shadow-md transition-shadow mt-6">
                    <h3 className="text-lg font-semibold mb-3">Task Management API</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      A task management API with projects, tasks, and users
                    </p>
                    <CodeBlock
                      code={`{
  "models": {
    "User": {
      "id": "uuid primaryKey",
      "name": "string",
      "email": "string unique",
      "password": "string"
    },
    "Project": {
      "id": "uuid primaryKey",
      "name": "string",
      "description": "text",
      "ownerId": "uuid references:User.id"
    },
    "Task": {
      "id": "uuid primaryKey",
      "title": "string",
      "description": "text",
      "status": "string default:todo",
      "priority": "string default:medium",
      "projectId": "uuid references:Project.id",
      "assigneeId": "uuid references:User.id",
      "dueDate": "datetime"
    }
  }
}`}
                      language="json"
                    />
                    <Button asChild className="mt-4">
                      <a href="/generate">Try this example</a>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </motion.div>
    </div>
  )
}
