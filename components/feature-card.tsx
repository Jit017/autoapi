"use client"

import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  delay?: number
}

export function FeatureCard({ title, description, icon: Icon, delay = 0 }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      viewport={{ once: true }}
      className={cn(
        "flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm transition-all duration-300",
        isHovered ? "shadow-lg transform -translate-y-1" : "",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-all duration-300">
        <Icon className={cn("h-6 w-6 text-primary transition-all duration-300", isHovered ? "scale-110" : "")} />
      </div>
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  )
}
