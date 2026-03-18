import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = getDb()

  const rows = db.prepare(
    'SELECT * FROM artifacts WHERE project_id = ? ORDER BY created_at'
  ).all(id) as Record<string, unknown>[]

  const artifacts = rows.map(a => {
    if (typeof a.content_json === 'string') {
      try { a.content_json = JSON.parse(a.content_json as string) } catch {}
    }
    return a
  })

  return NextResponse.json({ artifacts }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' }
  })
}
