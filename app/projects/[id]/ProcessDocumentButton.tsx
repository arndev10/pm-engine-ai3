'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProcessDocumentButton ({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleProcess = async () => {
    setError(null)
    setIsProcessing(true)
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al procesar')
        return
      }
      router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleProcess}
        disabled={isProcessing}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {isProcessing ? 'Procesando…' : 'Procesar documento'}
      </button>
      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
