import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'PM AI Engine',
  description: 'Analiza contratos y genera artefactos de gestión alineados a PMBOK 8'
}

function IconHome () {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
    </svg>
  )
}

function IconFolder () {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  )
}

function IconSettings () {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function IconPlus () {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export default function RootLayout ({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <div className="flex h-screen w-screen overflow-hidden bg-[hsl(243,50%,4%)]">

          {/* Background glows */}
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="absolute -top-48 left-16 h-[520px] w-[520px] rounded-full bg-[hsl(252,90%,65%)] opacity-[0.07] blur-[130px]" />
            <div className="absolute -bottom-48 right-8 h-[420px] w-[420px] rounded-full bg-[hsl(270,75%,58%)] opacity-[0.06] blur-[130px]" />
          </div>

          {/* Sidebar */}
          <aside className="relative z-10 flex w-[68px] shrink-0 flex-col items-center border-r border-white/[0.06] bg-white/[0.025] py-5">

            {/* Logo */}
            <Link
              href="/projects"
              className="mb-8 flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(252,90%,65%,0.15)] hover:bg-[hsl(252,90%,65%,0.25)] transition-colors"
              title="PM AI Engine"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 10 Q5.5 4 8.5 10 Q11.5 16 14.5 10 Q17 5 18 10" stroke="hsl(252,90%,78%)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </Link>

            {/* Nav */}
            <nav className="flex flex-1 flex-col items-center gap-1.5">
              <Link
                href="/projects"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white/30 hover:text-white/80 hover:bg-white/[0.07] transition-all duration-150"
                title="Dashboard"
              >
                <IconHome />
              </Link>
              <Link
                href="/projects"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white/30 hover:text-white/80 hover:bg-white/[0.07] transition-all duration-150"
                title="Proyectos"
              >
                <IconFolder />
              </Link>
            </nav>

            {/* Bottom */}
            <div className="flex flex-col items-center gap-2 mt-auto">
              <Link
                href="/api/env-check"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white/20 hover:text-white/55 hover:bg-white/[0.05] transition-all duration-150"
                title="Ajustes"
              >
                <IconSettings />
              </Link>
              <Link
                href="/projects/new"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(252,90%,65%)] text-white shadow-lg shadow-[hsl(252,80%,40%)/0.4] hover:bg-[hsl(252,90%,70%)] transition-all duration-150"
                title="Nuevo Proyecto"
              >
                <IconPlus />
              </Link>
            </div>
          </aside>

          {/* Main content */}
          <main className="relative z-10 flex-1 overflow-y-auto">
            {children}
          </main>

        </div>
      </body>
    </html>
  )
}
