import { NextResponse } from 'next/server'
import { getDb, newId } from '@/lib/db'
import path from 'path'
import fs from 'fs'

const MAX_FILE_BYTES = 15 * 1024 * 1024
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function POST (request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const name = (formData.get('name') as string)?.trim() || 'Sin nombre'
    const industry = (formData.get('industry') as string)?.trim() || ''
    const duration_estimate = (formData.get('duration_estimate') as string)?.trim() || ''
    const budget_estimate = (formData.get('budget_estimate') as string)?.trim() || ''
    const methodology = (formData.get('methodology') as string) || 'hibrido'

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'Falta el archivo PDF' }, { status: 400 })
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'El archivo supera el límite (15 MB)' }, { status: 400 })
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Solo se permiten archivos PDF' }, { status: 400 })
    }

    const projectId = newId()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const uploadDir = path.join(UPLOADS_DIR, projectId)
    fs.mkdirSync(uploadDir, { recursive: true })

    const arrayBuffer = await file.arrayBuffer()
    fs.writeFileSync(path.join(uploadDir, safeName), Buffer.from(arrayBuffer))

    const fileUrl = `/uploads/${projectId}/${safeName}`

    const db = getDb()
    const docId = newId()
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO projects (id, name, industry, duration_estimate, budget_estimate, methodology, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectId, name, industry, duration_estimate, budget_estimate,
      ['predictivo', 'agil', 'hibrido'].includes(methodology) ? methodology : 'hibrido',
      now
    )

    db.prepare(`
      INSERT INTO documents (id, project_id, file_name, file_url, file_size_bytes, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(docId, projectId, file.name, fileUrl, file.size, now)

    return NextResponse.json({ project_id: projectId, document_id: docId })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error en el servidor'
    console.error('Upload error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
