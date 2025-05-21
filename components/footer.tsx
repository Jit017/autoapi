import Link from "next/link"
import { Terminal } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Terminal className="h-4 w-4" />
              </div>
              <span className="font-mono text-lg font-bold">AutoAPI</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Instant APIs from Your Schema.
              <br />
              Open source and developer-friendly.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/generate" className="text-muted-foreground hover:text-foreground transition-colors">
                  Generate API
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/docs/examples" className="text-muted-foreground hover:text-foreground transition-colors">
                  Examples
                </Link>
              </li>
              <li>
                <Link href="/docs/cli" className="text-muted-foreground hover:text-foreground transition-colors">
                  CLI Usage
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/autoapi/repo"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Community</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="https://twitter.com/autoapi"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Twitter
                </Link>
              </li>
              <li>
                <Link
                  href="https://discord.gg/autoapi"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Discord
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/autoapi/repo/discussions"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Discussions
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AutoAPI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
