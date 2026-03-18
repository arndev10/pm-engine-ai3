import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { artifactToDocxBuffer } from '@/lib/export/build-docx'
import { artifactToPdfBuffer } from '@/lib/export/build-pdf'
import type { Artifact } from '@/types'

const EXPORT_FILENAMES: Record<string, string> = {
  charter: '01_Project-Charter',
  risk_register: '02_Risk-register',
  stakeholder_register: '03_Stakeholders',
  wbs: '04_WBS',
  backlog: '05_Backlog'
}

export async function GET (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const url = new URL(_request.url)
  const format = url.searchParams.get('format')

  if (format !== 'docx' && format !== 'pdf') {
    return NextResponse.json({ error: 'format debe ser docx o pdf' }, { status: 400 })
  }

  const db = getDb()
  const row = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!row) {
    return NextResponse.json({ error: 'Artefacto no encontrado' }, { status: 404 })
  }

  if (typeof row.content_json === 'string') {
    try { row.content_json = JSON.parse(row.content_json as string) } catch {}
  }

  const artifact = row as unknown as Artifact
  const name = EXPORT_FILENAMES[artifact.type] ?? 'artifact'

  try {
    if (format === 'docx') {
      const buffer = await artifactToDocxBuffer(artifact)
      const body = new Uint8Array(buffer)
      return new NextResponse(body, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${name}.docx"`,
          'Content-Length': String(body.length)
        }
      })
    }
    const buffer = await artifactToPdfBuffer(artifact)
    const body = new Uint8Array(buffer)
    return new NextResponse(body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${name}.pdf"`,
        'Content-Length': String(body.length)
      }
    })
  } catch (e) {
    console.error('Export error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error al exportar' },
      { status: 500 }
    )
  }
}
