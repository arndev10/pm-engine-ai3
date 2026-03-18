import Link from 'next/link'
import { getDb } from '@/lib/db'
import ProjectRowActions from './ProjectRowActions'

export const dynamic = 'force-dynamic'

interface ProjectRow {
  id: string
  name: string | null
  industry: string | null
  duration_estimate: string | null
  budget_estimate: string | null
  methodology: string | null
  created_at: string
}

export default function ProjectsListPage () {
  const db = getDb()
  const projects = db.prepare(
    'SELECT id, name, industry, duration_estimate, budget_estimate, methodology, created_at FROM projects ORDER BY created_at DESC'
  ).all() as ProjectRow[]

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Inicio
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          Proyectos
        </h1>
        <p className="mt-1 text-muted-foreground">
          Listado de proyectos guardados localmente.
        </p>
      </div>

      {projects.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/50 p-8 text-center text-muted-foreground">
          <p>No hay proyectos aún.</p>
          <Link href="/projects/new" className="mt-4 inline-block font-medium text-primary hover:underline">
            Crear nuevo proyecto
          </Link>
        </div>
      )}

      {projects.length > 0 && (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
            </p>
            <Link
              href="/projects/new"
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Nuevo proyecto
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {projects.map(project => (
              <li key={project.id} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                <Link
                  href={`/projects/${project.id}`}
                  className="min-w-0 flex-1"
                >
                  <span className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                    {project.name || 'Sin nombre'}
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {[project.industry, project.duration_estimate, project.budget_estimate]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </Link>
                <span className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                  {project.methodology || 'híbrido'}
                </span>
                <ProjectRowActions
                  projectId={project.id}
                  projectName={project.name || 'Sin nombre'}
                  durationEstimate={project.duration_estimate}
                  budgetEstimate={project.budget_estimate}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
