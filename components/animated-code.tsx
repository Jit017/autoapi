"use client"

import { useEffect, useState } from "react"
import { CodeBlock } from "@/components/code-block"

const sampleSchema = `{
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
}`

const sampleEndpoints = `{
  "endpoints": [
    {
      "path": "/api/users",
      "method": "GET",
      "description": "List all users"
    },
    {
      "path": "/api/users/:id",
      "method": "GET",
      "description": "Get user by ID"
    },
    {
      "path": "/api/users",
      "method": "POST",
      "description": "Create a new user"
    },
    {
      "path": "/api/posts",
      "method": "GET",
      "description": "List all posts"
    },
    {
      "path": "/api/posts/:id",
      "method": "GET",
      "description": "Get post by ID"
    }
  ]
}`

export function AnimatedCode() {
  const [currentCode, setCurrentCode] = useState(sampleSchema)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentCode((prev) => (prev === sampleSchema ? sampleEndpoints : sampleSchema))
        setIsTransitioning(false)
      }, 500)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={`w-full max-w-2xl transition-all duration-500 ease-in-out ${isTransitioning ? "opacity-0 transform -translate-y-4" : "opacity-100"} animate-float`}
    >
      <CodeBlock code={currentCode} className="glow" />
    </div>
  )
}
