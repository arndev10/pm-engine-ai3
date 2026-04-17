import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'PM AI Engine',
  description: 'Analiza contratos y genera artefactos de gestión alineados a PMBOK 8'
}

export default function RootLayout ({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen bg-[hsl(0,0%,4%)] text-white">

        <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[hsl(0,0%,4%)] backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(145,100%,46%)]">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M3 10 Q5.5 4 8.5 10 Q11.5 16 14.5 10 Q17 5 18 10" stroke="hsl(0,0%,4%)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm font-bold tracking-tight text-white group-hover:text-white/80 transition-colors">
                PM AI Engine
              </span>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <Link href="/projects" className="text-sm text-white/50 hover:text-white transition-colors">
                Proyectos
              </Link>
              <Link href="/projects/new" className="text-sm text-white/50 hover:text-white transition-colors">
                Nuevo
              </Link>
              <Link href="/api/env-check" className="text-sm text-white/50 hover:text-white transition-colors">
                Estado
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/projects"
                className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-white/80 hover:border-white/30 hover:text-white transition-all duration-150"
              >
                Mis Proyectos
              </Link>
              <Link
                href="/projects/new"
                className="rounded-full bg-[hsl(145,100%,46%)] px-4 py-1.5 text-sm font-bold text-[hsl(0,0%,4%)] hover:bg-[hsl(145,100%,52%)] transition-colors"
              >
                Nuevo Proyecto
              </Link>
            </div>

          </div>
        </header>

        <main>
          {children}
        </main>

      </body>
    </html>
  )
}
