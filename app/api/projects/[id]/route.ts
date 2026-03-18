import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import path from 'path'
import fs from 'fs'

export async function PATCH (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params
  if (!projectId) {
    return NextResponse.json({ error: 'id es obligatorio' }, { status: 400 })
  }

  let body: { name?: string; duration_estimate?: string; budget_estimate?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const sets: string[] = []
  const values: unknown[] = []

  if (body.name !== undefined) { sets.push('name = ?'); values.push(String(body.name).trim() || 'Sin nombre') }
  if (body.duration_estimate !== undefined) { sets.push('duration_estimate = ?'); values.push(String(body.duration_estimate).trim()) }
  if (body.budget_estimate !== undefined) { sets.push('budget_estimate = ?'); values.push(String(body.budget_estimate).trim()) }

  if (sets.length === 0) {
    return NextResponse.json({ error: 'Incluye al menos name, duration_estimate o budget_estimate' }, { status: 400 })
  }

  sets.push('updated_at = ?')
  values.push(new Date().toISOString())
  values.push(projectId)

  const db = getDb()
  try {
    db.prepare(`UPDATE projects SET ${sets.join(', ')} WHERE id = ?`).run(...values)
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId)
    return NextResponse.json({ ok: true, project })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error al actualizar' }, { status: 500 })
  }
}

export async function DELETE (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params
  if (!projectId) {
    return NextResponse.json({ error: 'id es obligatorio' }, { status: 400 })
  }

  const db = getDb()
  const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId)
  if (!project) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
  }

  // Delete local uploaded files
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', projectId)
  if (fs.existsSync(uploadDir)) {
    fs.rmSync(uploadDir, { recursive: true, force: true })
  }

  db.prepare('DELETE FROM projects WHERE id = ?').run(projectId)

  return NextResponse.json({ ok: true })
}
