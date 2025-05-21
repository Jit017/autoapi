"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Code, Database, FileJson, Github, Rocket, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedCode } from "@/components/animated-code"
import { FeatureCard } from "@/components/feature-card"
import { motion } from "framer-motion"

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return

      const { clientX, clientY } = e
      const { left, top, width, height } = heroRef.current.getBoundingClientRect()

      const x = (clientX - left) / width - 0.5
      const y = (clientY - top) / height - 0.5

      heroRef.current.style.setProperty("--mouse-x", `${x * 20}px`)
      heroRef.current.style.setProperty("--mouse-y", `${y * 20}px`)
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden gradient-bg grid-pattern"
        style={
          {
            "--mouse-x": "0px",
            "--mouse-y": "0px",
          } as React.CSSProperties
        }
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[50%] h-[70%] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-[30%] -left-[10%] w-[50%] h-[70%] bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container px-4 md:px-6 relative">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-center space-y-4"
            >
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Developer Tool
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Instant APIs from Your Schema
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                AutoAPI generates fully functional APIs from simple configurations. Define your schema, choose your
                database, and get a production-ready API in seconds.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="group">
                  <Link href="/generate">
                    Generate API
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/docs">Read Docs</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="https://github.com/autoapi/repo" target="_blank">
                    <Github className="mr-2 h-4 w-4" /> GitHub
                  </Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
              style={{
                transform:
                  "perspective(1000px) rotateY(calc(var(--mouse-x) * -0.05)) rotateX(calc(var(--mouse-y) * 0.05))",
              }}
            >
              <AnimatedCode />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          >
            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Everything you need</h2>
            <p className="max-w-[800px] text-muted-foreground md:text-xl/relaxed">
              Build and deploy APIs without the hassle. AutoAPI handles the heavy lifting.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-5xl items-center gap-6 py-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="API Generation"
              description="Generate RESTful APIs from your schema in seconds with full CRUD operations"
              icon={Zap}
              delay={0}
            />
            <FeatureCard
              title="Code Export"
              description="Download the generated code and host it anywhere you want"
              icon={Code}
              delay={1}
            />
            <FeatureCard
              title="Docs Generation"
              description="Automatic Swagger documentation for your API endpoints"
              icon={FileJson}
              delay={2}
            />
            <FeatureCard
              title="Open Source"
              description="Free and open source, forever. Contribute and customize."
              icon={Github}
              delay={3}
            />
            <FeatureCard
              title="Multiple Databases"
              description="Support for PostgreSQL, MongoDB, and SQLite databases"
              icon={Database}
              delay={4}
            />
            <FeatureCard
              title="Deploy Anywhere"
              description="Deploy to Vercel, AWS, or your own infrastructure"
              icon={Rocket}
              delay={5}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 md:py-32 bg-muted relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full grid-pattern opacity-50" />
        </div>

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center space-y-4 text-center"
          >
            <div className="space-y-2 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to build your API?</h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Get started in minutes with AutoAPI. No complex setup required.
              </p>
            </div>
            <div className="mt-6">
              <Button asChild size="lg" className="group">
                <Link href="/generate">
                  Generate API
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
