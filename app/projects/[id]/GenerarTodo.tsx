'use client'

/**
 * Un solo clic: lee el contrato y genera los 4 artefactos seguidos, con una
 * lista que se va marcando en pantalla. Es la toma "wow" del video 30.
 * Si la URL trae ?auto=1 (viene de "Nuevo proyecto"), arranca sola.
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ArtifactType } from '@/types'

type Estado = 'pendiente' | 'corriendo' | 'listo' | 'error'

const PASOS: Array<{ clave: 'process' | ArtifactType; label: string; detalle: string }> = [
  { clave: 'process', label: 'Leyendo el contrato', detalle: 'alcance, entregables, hitos, obligaciones y penalidades' },
  { clave: 'charter', label: 'Acta de constitución', detalle: 'objetivos, entregables, hitos y criterios de aprobación' },
  { clave: 'risk_register', label: 'Registro de riesgos', detalle: 'probabilidad × impacto y plan de respuesta' },
  { clave: 'stakeholder_register', label: 'Registro de interesados', detalle: 'poder, interés y estrategia de involucramiento' },
  { clave: 'wbs', label: 'EDT', detalle: 'fases, entregables y paquetes de trabajo' }
]

export default function GenerarTodo ({ projectId, yaProcesado }: { projectId: string; yaProcesado: boolean }) {
  const router = useRouter()
  const params = useSearchParams()
  const [estados, setEstados] = useState<Estado[]>(PASOS.map((p, i) => (i === 0 && yaProcesado ? 'listo' : 'pendiente')))
  const [corriendo, setCorriendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inicio, setInicio] = useState<number | null>(null)
  const [segundos, setSegundos] = useState(0)
  const arrancado = useRef(false)

  useEffect(() => {
    if (!corriendo || inicio == null) return
    const t = setInterval(() => setSegundos(Math.floor((Date.now() - inicio) / 1000)), 250)
    return () => clearInterval(t)
  }, [corriendo, inicio])

  const marcar = (i: number, e: Estado) => setEstados(prev => prev.map((x, j) => (j === i ? e : x)))

  const correr = async () => {
    if (corriendo) return
    setCorriendo(true)
    setError(null)
    setInicio(Date.now())
    try {
      for (let i = 0; i < PASOS.length; i++) {
        const paso = PASOS[i]
        if (i === 0 && yaProcesado) continue
        marcar(i, 'corriendo')
        const res = await fetch(paso.clave === 'process' ? '/api/process' : '/api/generate-artifact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paso.clave === 'process'
            ? { project_id: projectId }
            : { project_id: projectId, artifact_type: paso.clave })
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          marcar(i, 'error')
          throw new Error(data.error ?? `Falló: ${paso.label}`)
        }
        marcar(i, 'listo')
      }
      router.replace(`/projects/${projectId}`)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexión')
    } finally {
      setCorriendo(false)
    }
  }

  useEffect(() => {
    if (params.get('auto') === '1' && !arrancado.current) {
      arrancado.current = true
      correr()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hechos = estados.filter(e => e === 'listo').length
  const pct = Math.round((hechos / PASOS.length) * 100)

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Del contrato a los artefactos</p>
          <h2 className="mt-1 text-lg font-bold text-foreground">
            {corriendo ? 'Generando el expediente del proyecto…' : hechos === PASOS.length ? 'Expediente listo' : 'Genera el expediente completo con un clic'}
          </h2>
        </div>
        {!corriendo && hechos < PASOS.length && (
          <button
            type="button"
            onClick={correr}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Generar todo
          </button>
        )}
        {(corriendo || inicio != null) && (
          <span className="font-mono text-sm tabular-nums text-muted-foreground">{segundos} s</span>
        )}
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <ol className="space-y-2.5">
        {PASOS.map((paso, i) => {
          const e = estados[i]
          return (
            <li key={paso.clave} className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${e === 'corriendo' ? 'bg-primary/[0.07]' : ''}`}>
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                {e === 'listo' && (
                  <svg viewBox="0 0 20 20" className="h-5 w-5 text-primary" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.86-9.78a.75.75 0 0 0-1.22-.88l-3.24 4.5-1.6-1.6a.75.75 0 1 0-1.06 1.06l2.22 2.22a.75.75 0 0 0 1.14-.09l3.76-5.21Z" clipRule="evenodd" />
                  </svg>
                )}
                {e === 'corriendo' && <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                {e === 'pendiente' && <span className="h-3 w-3 rounded-full border border-muted-foreground/50" />}
                {e === 'error' && <span className="text-destructive font-bold">!</span>}
              </span>
              <div>
                <p className={`text-sm font-medium ${e === 'pendiente' ? 'text-muted-foreground' : 'text-foreground'}`}>{paso.label}</p>
                <p className="text-xs text-muted-foreground">{paso.detalle}</p>
              </div>
            </li>
          )
        })}
      </ol>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
