"use client"

import { useState, useEffect } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
  animate?: boolean
}

export function CodeBlock({ code, language = "json", className, animate = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [displayCode, setDisplayCode] = useState(animate ? "" : code)

  useEffect(() => {
    if (!animate) return

    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex <= code.length) {
        setDisplayCode(code.substring(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [code, animate])

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        "relative rounded-lg border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md",
        className,
      )}
    >
      <div className="terminal-header">
        <span className="text-xs text-muted-foreground">{language}</span>
      </div>
      <div className="relative">
        <pre className="overflow-x-auto p-4 text-sm bg-[hsl(var(--code-bg))] font-mono">
          <code className={animate ? "typing-animation" : ""}>{displayCode}</code>
        </pre>
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
