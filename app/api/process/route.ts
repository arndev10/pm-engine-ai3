import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { structureWithOpenAI } from '@/lib/openai/structure-document'
import path from 'path'
import fs from 'fs'
import type { StructuredContext } from '@/types'

const MAX_PDF_PAGES = Number(process.env.NEXT_PUBLIC_MAX_PDF_PAGES) || 150

function stubContext (projectName: string): StructuredContext {
  return {
    project_name: projectName || 'Sin nombre',
    document_type: 'contract',
    language: 'es',
    scope_summary: 'Contexto extraído del PDF. Configura OPENAI_API_KEY para análisis con IA.',
    deliverables: [],
    obligations: [],
    sla: [],
    penalties: [],
    milestones: [],
    payment_terms: [],
    constraints: [],
    assumptions: [],
    risks_raw: [],
    stakeholders_raw: []
  }
}

async function extractTextFromPdf (buffer: Buffer): Promise<{ text: string; numpages: number }> {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const data = new Uint8Array(buffer)
  const doc = await pdfjsLib.getDocument({ data }).promise
  const pages: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const strings = content.items
      .filter((item: Record<string, unknown>) => 'str' in item)
      .map((item: Record<string, unknown>) => item.str as string)
    pages.push(strings.join(' '))
  }
  await doc.destroy()
  return { text: pages.join('\n'), numpages: doc.numPages }
}

export async function POST (request: Request) {
  let projectId: string
  try {
    const body = await request.json()
    projectId = body?.project_id
    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json({ error: 'project_id es obligatorio' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const db = getDb()

  const project = db.prepare('SELECT id, name FROM projects WHERE id = ?').get(projectId) as { id: string; name: string } | undefined
  if (!project) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
  }

  const doc = db.prepare(
    'SELECT id, file_url FROM documents WHERE project_id = ? ORDER BY created_at DESC LIMIT 1'
  ).get(projectId) as { id: string; file_url: string } | undefined

  if (!doc) {
    return NextResponse.json({ error: 'No hay documento asociado al proyecto' }, { status: 404 })
  }

  const localPath = path.join(process.cwd(), 'public', doc.file_url)
  if (!fs.existsSync(localPath)) {
    return NextResponse.json({ error: 'Archivo no encontrado en el servidor' }, { status: 404 })
  }

  let buffer: Buffer
  try {
    buffer = fs.readFileSync(localPath)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'No se pudo leer el archivo'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  let text: string
  let numpages: number
  try {
    const result = await extractTextFromPdf(buffer)
    text = result.text
    numpages = result.numpages
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('PDF extract error:', e)
    return NextResponse.json(
      { error: `No se pudo extraer texto del PDF: ${message}` },
      { status: 500 }
    )
  }

  if (numpages > MAX_PDF_PAGES) {
    return NextResponse.json(
      { error: `El PDF supera el límite de ${MAX_PDF_PAGES} páginas` },
      { status: 400 }
    )
  }

  db.prepare('UPDATE documents SET parsed_text = ?, page_count = ? WHERE id = ?')
    .run(text.slice(0, 500000), numpages, doc.id)

  const apiKey = process.env.OPENAI_API_KEY
  let structuredContext: StructuredContext
  if (apiKey?.trim()) {
    try {
      structuredContext = await structureWithOpenAI(text, project.name || 'Sin nombre', apiKey.trim())
    } catch (e) {
      console.error('OpenAI structure error:', e)
      return NextResponse.json(
        { error: `Error al estructurar con OpenAI: ${e instanceof Error ? e.message : String(e)}` },
        { status: 500 }
      )
    }
  } else {
    structuredContext = stubContext(project.name || 'Sin nombre')
  }

  db.prepare('UPDATE projects SET structured_context_json = ?, updated_at = ? WHERE id = ?')
    .run(JSON.stringify(structuredContext), new Date().toISOString(), projectId)

  return NextResponse.json({ ok: true, page_count: numpages, text_length: text.length })
}
