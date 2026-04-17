import Link from 'next/link'
import { notFound } from 'next/navigation'
import { unstable_noStore } from 'next/cache'
import { getDb, jsonParse } from '@/lib/db'
import ProcessDocumentButton from './ProcessDocumentButton'
import ArtifactTabs from './ArtifactTabs'
import ProjectHeader from './ProjectHeader'
import ProjectRefreshOnEnter from './ProjectRefreshOnEnter'
import type { Artifact } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage ({ params }: { params: Promise<{ id: string }> }) {
  unstable_noStore()
  const { id } = await params
  let project: {
    id: string; name: string; industry: string; duration_estimate: string
    budget_estimate: string; methodology: string; structured_context_json: string | null; created_at: string
  } | undefined

  try {
    const db = getDb()
    project = db.prepare(
      'SELECT id, name, industry, duration_estimate, budget_estimate, methodology, structured_context_json, created_at FROM projects WHERE id = ?'
    ).get(id) as typeof project
  } catch { project = undefined }

  if (!project) notFound()

  const hasContext = project.structured_context_json != null

  let artifacts: Artifact[] = []
  if (hasContext) {
    try {
      const db = getDb()
      const rows = db.prepare(
        'SELECT * FROM artifacts WHERE project_id = ? ORDER BY created_at'
      ).all(id) as Record<string, unknown>[]
      artifacts = rows.map(row => {
        if (typeof row.content_json === 'string') {
          row.content_json = jsonParse(row.content_json as string)
        }
        return row as unknown as Artifact
      })
    } catch { artifacts = [] }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">
      <ProjectHeader
        projectId={project.id}
        name={project.name || 'Sin nombre'}
        industry={project.industry}
        durationEstimate={project.duration_estimate}
        budgetEstimate={project.budget_estimate}
      />

      {!hasContext && (
        <div className="rounded-lg border border-warning/40 bg-warning/10 p-4">
          <p className="font-medium text-foreground">Documento subido</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Procesa el documento para extraer el texto del PDF y preparar el contexto. Luego podrás generar los artefactos (Charter, Risk Register, etc.).
          </p>
          <div className="mt-4">
            <ProcessDocumentButton projectId={id} />
          </div>
        </div>
      )}

      {hasContext && (
        <>
          <ProjectRefreshOnEnter />
          <ArtifactTabs projectId={id} initialArtifacts={artifacts} />
        </>
      )}
    </div>
  )
}
