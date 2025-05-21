"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Download, ExternalLink, ArrowLeft, Loader2, Trash } from "lucide-react"
import { motion } from "framer-motion"
import apiClient, { Project } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

// Database color mapping
const dbColors: Record<string, string> = {
  json: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  postgresql: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  mongodb: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  sqlite: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true)
        const fetchedProject = await apiClient.getProject(params.id)
        setProject(fetchedProject)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch project:', err)
        setError('Failed to load project. It might have been deleted or there was a server error.')
        toast({
          title: 'Error',
          description: 'Failed to load project',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchProject()
  }, [params.id, toast])

  const handleDelete = async () => {
    try {
      await apiClient.deleteProject(params.id)
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      })
      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to delete project:', err)
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      })
    }
  }

  const handleDownload = () => {
    apiClient.downloadProject(params.id)
  }

  const handleViewDocs = () => {
    apiClient.viewProjectDocs(params.id)
  }

  if (loading) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading project details...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          <div className="rounded-xl border bg-destructive/10 text-destructive p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Project Not Found</h2>
            <p className="mb-6">{error || "This project could not be loaded."}</p>
            <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card className="shadow-md">
              <CardHeader className="border-b bg-muted/40">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={`${dbColors[project.config.dbType] || ""}`}>
                        {project.config.dbType}
                      </Badge>
                      {project.hasSwagger && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Swagger
                        </Badge>
                      )}
                      {project.config.auth && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          Auth
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl">{project.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={handleDelete}>
                      <Trash className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{project.description || "No description provided."}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">API Endpoints</h3>
                    <CodeBlock
                      code={project.routes.map(route => `${route.method}    ${route.path}    // ${route.description}`).join('\n')}
                      language="http"
                      className="shadow-md"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" /> Download Code
                </Button>
                
                {project.hasSwagger && (
                  <Button variant="outline" className="w-full justify-start" onClick={handleViewDocs}>
                    <ExternalLink className="mr-2 h-4 w-4" /> View Swagger Docs
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="font-medium">{new Date(project.createdAt).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Last Updated</dt>
                    <dd className="font-medium">{new Date(project.updatedAt).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Total Endpoints</dt>
                    <dd className="font-medium">{project.routes.length}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Total Entities</dt>
                    <dd className="font-medium">{project.schema.entities.length}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Schema</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 max-h-96 overflow-y-auto">
                  {project.schema.entities.map((entity, index) => (
                    <div key={index} className={`mb-6 ${index > 0 ? 'pt-6 border-t' : ''}`}>
                      <h4 className="text-md font-semibold mb-2">{entity.name}</h4>
                      <ul className="space-y-2 pl-4">
                        {entity.fields.map((field, fieldIndex) => (
                          <li key={fieldIndex} className="flex items-center text-sm">
                            <span className="font-mono mr-2">{field.name}:</span>
                            <span className="text-muted-foreground mr-2">{field.type}</span>
                            {field.required && (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300">
                                required
                              </Badge>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 