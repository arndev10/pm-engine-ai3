'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const INDUSTRIES = ['IT', 'Telecom', 'Construcción', 'Energía', 'Salud', 'Manufactura', 'Otro']
const METHODOLOGIES = [
  { value: 'predictivo', label: 'Predictivo' },
  { value: 'agil', label: 'Ágil' },
  { value: 'hibrido', label: 'Híbrido' }
] as const

const inputClass = 'mt-1 block w-full rounded-md border border-input bg-card px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring'

export default function NewProjectPage () {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    industry: '',
    duration_estimate: '',
    budget_estimate: '',
    methodology: 'hibrido'
  })
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | null) => {
    if (!file) {
      setFileName(null)
      return
    }
    if (file.type !== 'application/pdf') return
    setFileName(file.name)
    const input = fileInputRef.current
    if (input) {
      const dt = new DataTransfer()
      dt.items.add(file)
      input.files = dt.files
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file?.type === 'application/pdf') handleFile(file)
  }
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setError('Selecciona un archivo PDF')
      return
    }

    setIsSubmitting(true)
    const fd = new FormData()
    fd.set('file', file)
    fd.set('name', form.name || 'Sin nombre')
    fd.set('industry', form.industry)
    fd.set('duration_estimate', form.duration_estimate)
    fd.set('budget_estimate', form.budget_estimate)
    fd.set('methodology', form.methodology)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      let data: { error?: string; project_id?: string }
      try {
        data = await res.json()
      } catch {
        setError(res.ok ? 'Error de conexión' : `Error ${res.status}. Comprueba que el servidor esté en marcha.`)
        return
      }
      if (!res.ok) {
        setError(data.error ?? 'Error al subir')
        return
      }
      router.push(`/projects/${data.project_id}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error de conexión'
      setError(`No se pudo conectar con el servidor. ¿Estás en la misma URL donde corre npm run dev? (ej. http://localhost:3003). ${msg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Inicio
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          Nuevo proyecto
        </h1>
        <p className="mt-1 text-muted-foreground">
          Sube un contrato, SoW o RFP y completa los metadatos. Luego podrás procesar el documento y generar los artefactos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-foreground">
            Documento PDF *
          </label>
          <input
            ref={fileInputRef}
            name="file"
            type="file"
            accept="application/pdf"
            required
            className="hidden"
            onChange={e => handleFile(e.target.files?.[0] ?? null)}
          />
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`mt-1 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-input bg-muted/50 hover:border-primary/50 hover:bg-muted'
            }`}
          >
            <span className="text-sm font-medium text-foreground">
              {fileName ?? 'Arrastre el PDF aquí o haga clic para seleccionar'}
            </span>
            <p className="mt-1 text-xs text-muted-foreground">
              Máx. 15 MB. Contrato, SoW, RFP o anexo.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Nombre del proyecto
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ej. Implementación ERP 2025"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-foreground">
            Industria
          </label>
          <select
            id="industry"
            name="industry"
            value={form.industry}
            onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
            className={inputClass}
          >
            <option value="">Selecciona</option>
            {INDUSTRIES.map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="duration_estimate" className="block text-sm font-medium text-foreground">
              Duración estimada
            </label>
            <input
              id="duration_estimate"
              name="duration_estimate"
              type="text"
              value={form.duration_estimate}
              onChange={e => setForm(f => ({ ...f, duration_estimate: e.target.value }))}
              placeholder="Ej. 6 meses"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="budget_estimate" className="block text-sm font-medium text-foreground">
              Presupuesto estimado
            </label>
            <input
              id="budget_estimate"
              name="budget_estimate"
              type="text"
              value={form.budget_estimate}
              onChange={e => setForm(f => ({ ...f, budget_estimate: e.target.value }))}
              placeholder="Ej. 100k USD"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            Enfoque
          </label>
          <div className="mt-2 flex flex-wrap gap-4">
            {METHODOLOGIES.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="methodology"
                  value={value}
                  checked={form.methodology === value}
                  onChange={() => setForm(f => ({ ...f, methodology: value }))}
                  className="h-4 w-4 border-input text-primary focus:ring-ring"
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isSubmitting ? 'Subiendo…' : 'Crear proyecto y subir'}
          </button>
          <Link
            href="/"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
