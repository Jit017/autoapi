"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CodeBlock } from "@/components/code-block"
import { ArrowDown, Download, ExternalLink, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import apiClient, { Project } from "@/lib/api"
import { convertToBackendSchema } from "@/lib/schema-converter"
import { useToast } from "@/components/ui/use-toast"

const defaultSchema = `{
  "models": {
    "User": {
      "id": "uuid primaryKey",
      "name": "string required",
      "email": "string required",
      "createdAt": "datetime"
    },
    "Post": {
      "id": "uuid primaryKey",
      "title": "string required",
      "content": "text",
      "published": "boolean",
      "authorId": "uuid",
      "createdAt": "datetime"
    }
  }
}`

export default function GeneratePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [databaseType, setDatabaseType] = useState("json")
  const [schema, setSchema] = useState(defaultSchema)
  const [includeAuth, setIncludeAuth] = useState(false)
  const [generateSwagger, setGenerateSwagger] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedProject, setGeneratedProject] = useState<Project | null>(null)
  const [schemaParseError, setSchemaParseError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSchemaParseError(null)

    if (!projectName.trim()) {
      alert('Please enter a project name')
      return
    }

    if (!schema.trim()) {
      alert('Please provide a schema definition')
      return
    }

    setIsGenerating(true)

    try {
      // Convert frontend schema to backend format and validate
      const backendSchema = convertToBackendSchema(schema)
      
      // Check if the converted schema has entities
      if (!backendSchema.entities || backendSchema.entities.length === 0) {
        throw new Error('Schema must contain at least one model/entity')
      }
      
      // Create the project data
      const projectData = {
        name: projectName,
        description: description || `API for ${projectName}`,
        schema: backendSchema,
        config: {
          dbType: databaseType as 'json' | 'sqlite' | 'mongodb',
          auth: includeAuth,
          generateSwagger
        }
      }
      
      // Send to backend
      const project = await apiClient.generateApi(projectData)
      
      // Store the generated project
      setGeneratedProject(project)
      
      toast({
        title: "Success",
        description: "Your API has been generated successfully!",
      })
    } catch (error) {
      console.error("Error generating API:", error)
      
      if ((error as Error).message.includes('schema') || (error as Error).message.includes('model')) {
        setSchemaParseError((error as Error).message)
      } else {
        toast({
          title: "Error",
          description: (error as Error).message || "Failed to generate API. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedProject) {
      apiClient.downloadProject(generatedProject.id)
    }
  }

  const handleViewDocs = () => {
    if (generatedProject) {
      apiClient.viewProjectDocs(generatedProject.id)
    }
  }

  return (
    <div className="container py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl"
      >
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3">Generate Your API</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Define your schema, choose your database, and get a production-ready API in seconds.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="my-awesome-api"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="database-type">Database Type</Label>
                <Select value={databaseType} onValueChange={setDatabaseType}>
                  <SelectTrigger
                    id="database-type"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  >
                    <SelectValue placeholder="Select database" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON File</SelectItem>
                    <SelectItem value="mongodb">MongoDB</SelectItem>
                    <SelectItem value="sqlite">SQLite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Describe your API"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schema">Schema Definition</Label>
              <div className="relative">
                <Textarea
                  id="schema"
                  className={`font-mono h-64 resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                    schemaParseError ? 'border-destructive' : ''
                  }`}
                  placeholder="Paste your schema here..."
                  value={schema}
                  onChange={(e) => {
                    setSchema(e.target.value)
                    setSchemaParseError(null)
                  }}
                  required
                />
                <div className="absolute top-2 right-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  JSON
                </div>
              </div>
              {schemaParseError ? (
                <p className="text-xs text-destructive">{schemaParseError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Define your data models and their relationships in JSON format.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-auth"
                  checked={includeAuth}
                  onCheckedChange={(checked) => setIncludeAuth(checked as boolean)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <Label htmlFor="include-auth" className="cursor-pointer">
                  Include Authentication
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generate-swagger"
                  checked={generateSwagger}
                  onCheckedChange={(checked) => setGenerateSwagger(checked as boolean)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <Label htmlFor="generate-swagger" className="cursor-pointer">
                  Generate Swagger Docs
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full transition-all duration-300 hover:shadow-md"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                "Generate API"
              )}
            </Button>
          </form>
        </div>

        {generatedProject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-16 space-y-8"
          >
            <div className="flex items-center justify-center">
              <ArrowDown className="h-8 w-8 text-primary animate-bounce" />
            </div>

            <div className="rounded-xl border bg-card p-8 shadow-md">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <h2 className="text-2xl font-bold">Your API is Ready!</h2>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3">API Endpoint Preview</h3>
                  <CodeBlock
                    code={generatedProject.routes.map(route => `${route.method}    ${route.path}    // ${route.description}`).join('\n')}
                    language="http"
                    className="shadow-md"
                  />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button 
                    className="flex-1 transition-all duration-300 hover:shadow-md"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download Code
                  </Button>

                  {generatedProject.hasSwagger && (
                    <Button 
                      variant="outline" 
                      className="flex-1 transition-all duration-300 hover:shadow-md"
                      onClick={handleViewDocs}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" /> View Swagger Docs
                    </Button>
                  )}
                </div>

                <div className="rounded-lg bg-muted p-6">
                  <h3 className="text-sm font-semibold mb-3">Next Steps</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">1.</span> Download and extract the generated code
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">2.</span> Configure your database connection
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">3.</span> Run{" "}
                      <code className="code-highlight">npm install</code> to install dependencies
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">4.</span> Start your API with{" "}
                      <code className="code-highlight">npm start</code>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
