import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function PATCH (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: { content_json?: unknown; observations?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const hasContent = body?.content_json != null && typeof body.content_json === 'object'
  if (!hasContent && body?.observations === undefined) {
    return NextResponse.json({ error: 'Incluye content_json u observations' }, { status: 400 })
  }

  const db = getDb()
  const existing = db.prepare('SELECT id FROM artifacts WHERE id = ?').get(id)
  if (!existing) {
    return NextResponse.json({ error: 'Artefacto no encontrado' }, { status: 404 })
  }

  const sets: string[] = ['updated_at = ?']
  const values: unknown[] = [new Date().toISOString()]

  if (hasContent) { sets.push('content_json = ?'); values.push(JSON.stringify(body.content_json)) }
  if (body?.observations !== undefined) { sets.push('observations = ?'); values.push(String(body.observations).trim()) }

  values.push(id)
  db.prepare(`UPDATE artifacts SET ${sets.join(', ')} WHERE id = ?`).run(...values)

  const artifact = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(id) as Record<string, unknown>
  if (typeof artifact.content_json === 'string') {
    try { artifact.content_json = JSON.parse(artifact.content_json as string) } catch {}
  }

  return NextResponse.json({ ok: true, artifact })
}
