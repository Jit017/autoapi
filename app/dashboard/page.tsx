"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Download, ExternalLink, Loader2, MoreVertical, Plus, Trash } from "lucide-react"
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

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true)
        const fetchedProjects = await apiClient.getProjects()
        setProjects(fetchedProjects || [])
        setError(null)
      } catch (err) {
        console.error('Failed to fetch projects:', err)
        setError('Failed to load projects. Please try again.')
        toast({
          title: 'Error',
          description: 'Failed to load projects',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchProjects()
  }, [toast])

  const handleDeleteProject = async (id: string) => {
    try {
      await apiClient.deleteProject(id)
      setProjects(projects.filter(project => project.id !== id))
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      })
    } catch (err) {
      console.error('Failed to delete project:', err)
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      })
    }
  }

  const handleViewDocs = (id: string) => {
    apiClient.viewProjectDocs(id)
  }

  const handleDownloadCode = (id: string) => {
    apiClient.downloadProject(id)
  }

  if (loading) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your projects...</p>
      </div>
    )
  }

  return (
    <div className="container py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your APIs</h1>
            <p className="text-muted-foreground mt-1">Manage your generated APIs</p>
          </div>
          <Button asChild className="group">
            <Link href="/generate">
              <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" /> New API
            </Link>
          </Button>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 text-destructive p-4 mb-8">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-primary/10 p-8 mb-6">
              <Plus className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">No APIs yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first API to get started with AutoAPI. It only takes a few minutes.
            </p>
            <Button asChild size="lg" className="group">
              <Link href="/generate">
                <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" /> Create API
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`mb-2 ${dbColors[project.config.dbType] || ""}`}>
                        {project.config.dbType}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/${project.id}`}>
                              <span className="flex w-full items-center">
                                <ExternalLink className="mr-2 h-4 w-4" /> View Details
                              </span>
                            </Link>
                          </DropdownMenuItem>
                          {project.hasSwagger && (
                            <DropdownMenuItem onClick={() => handleViewDocs(project.id)}>
                              <ExternalLink className="mr-2 h-4 w-4" /> View Docs
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDownloadCode(project.id)}>
                            <Download className="mr-2 h-4 w-4" /> Download Code
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Link href={`/dashboard/${project.id}`} className="block hover:underline">
                      <CardTitle>{project.name}</CardTitle>
                    </Link>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Created</span>
                          <span className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Endpoints</span>
                          <span className="font-medium">{project.routes?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      asChild
                    >
                      <Link href={`/dashboard/${project.id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" /> View Details
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDownloadCode(project.id)}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
