import { NextResponse } from 'next/server'
import { getDb, newId } from '@/lib/db'
import { generateArtifact } from '@/lib/openai/generate-artifact'
import type { ArtifactType, StructuredContext, ProjectMetadata } from '@/types'

const VALID_TYPES: ArtifactType[] = ['charter', 'risk_register', 'stakeholder_register', 'wbs', 'backlog']

export async function POST (request: Request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json({ error: 'Falta OPENAI_API_KEY en .env' }, { status: 503 })
  }

  let projectId: string
  let artifactType: ArtifactType
  try {
    const body = await request.json()
    projectId = body?.project_id
    artifactType = body?.artifact_type
    if (!projectId || !artifactType) {
      return NextResponse.json({ error: 'project_id y artifact_type son obligatorios' }, { status: 400 })
    }
    if (!VALID_TYPES.includes(artifactType)) {
      return NextResponse.json({ error: `artifact_type inválido: ${artifactType}` }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const db = getDb()

  const project = db.prepare(
    'SELECT id, name, industry, duration_estimate, budget_estimate, methodology, structured_context_json FROM projects WHERE id = ?'
  ).get(projectId) as {
    id: string; name: string; industry: string; duration_estimate: string
    budget_estimate: string; methodology: string; structured_context_json: string | null
  } | undefined

  if (!project) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
  }

  let context: StructuredContext | null = null
  if (project.structured_context_json) {
    try { context = JSON.parse(project.structured_context_json) } catch {}
  }
  if (!context) {
    return NextResponse.json({ error: 'El proyecto no tiene contexto estructurado. Procesa el documento primero.' }, { status: 400 })
  }

  const meta: ProjectMetadata = {
    name: project.name,
    industry: project.industry,
    duration_estimate: project.duration_estimate,
    budget_estimate: project.budget_estimate,
    methodology: project.methodology as ProjectMetadata['methodology']
  }

  let content
  try {
    content = await generateArtifact(context, meta, artifactType, apiKey)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('generateArtifact error:', e)
    return NextResponse.json({ error: `Error al generar artefacto: ${msg}` }, { status: 500 })
  }

  const now = new Date().toISOString()

  // Upsert: insert or replace existing artifact of same type
  const existing = db.prepare('SELECT id FROM artifacts WHERE project_id = ? AND type = ?').get(projectId, artifactType) as { id: string } | undefined

  let artifactId: string
  if (existing) {
    artifactId = existing.id
    db.prepare('UPDATE artifacts SET content_json = ?, observations = NULL, updated_at = ? WHERE id = ?')
      .run(JSON.stringify(content), now, artifactId)
  } else {
    artifactId = newId()
    db.prepare('INSERT INTO artifacts (id, project_id, type, content_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(artifactId, projectId, artifactType, JSON.stringify(content), now, now)
  }

  const artifact = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(artifactId) as Record<string, unknown>
  if (artifact && typeof artifact.content_json === 'string') {
    try { artifact.content_json = JSON.parse(artifact.content_json as string) } catch {}
  }

  return NextResponse.json({ ok: true, artifact })
}
