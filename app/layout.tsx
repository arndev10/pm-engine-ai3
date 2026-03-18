import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PM AI Engine',
  description: 'Analiza contratos y genera artefactos de gestión alineados a PMBOK 8'
}

export default function RootLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased bg-background text-foreground">
        <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center font-bold text-xs text-primary-foreground select-none">
                PM
              </div>
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                PM AI Engine
              </span>
            </a>
            <nav className="flex items-center gap-1">
              <a
                href="/projects/new"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Nuevo proyecto
              </a>
              <a
                href="/projects"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Proyectos
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
