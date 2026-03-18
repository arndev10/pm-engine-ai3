'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  projectId: string
  initialName: string
  initialDuration: string
  initialBudget: string
  onClose: () => void
  onSuccess?: () => void
}

const inputClass = 'mt-1 block w-full rounded-md border border-input bg-card px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring'

export default function EditProjectModal ({
  projectId,
  initialName,
  initialDuration,
  initialBudget,
  onClose,
  onSuccess
}: Props) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [duration, setDuration] = useState(initialDuration)
  const [budget, setBudget] = useState(initialBudget)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(initialName)
    setDuration(initialDuration)
    setBudget(initialBudget)
  }, [initialName, initialDuration, initialBudget])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSaving(true)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Sin nombre',
          duration_estimate: duration.trim(),
          budget_estimate: budget.trim()
        })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Error al guardar')
        return
      }
      onSuccess?.()
      router.refresh()
      onClose()
    } catch {
      setError('Error de conexión')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-foreground">Editar proyecto</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-foreground">Título</label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="edit-duration" className="block text-sm font-medium text-foreground">Duración</label>
            <input
              id="edit-duration"
              type="text"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="Ej. 18 meses"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="edit-budget" className="block text-sm font-medium text-foreground">Presupuesto</label>
            <input
              id="edit-budget"
              type="text"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              placeholder="Ej. 300K USD"
              className={inputClass}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSaving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
