'use client'

import { useState, useEffect } from 'react'
import type {
  Artifact,
  ArtifactContent,
  CharterContent,
  RiskRegisterContent,
  StakeholderRegisterContent,
  WBSContent,
  WBSTask
} from '@/types'

interface Props {
  artifact: Artifact
  onSave: (artifactId: string, contentJson: unknown, observations?: string) => Promise<void>
}

export default function ArtifactViewer ({ artifact, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<ArtifactContent>(artifact.content_json)
  const [observations, setObservations] = useState(artifact.observations ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    setObservations(artifact.observations ?? '')
  }, [artifact.id, artifact.observations])

  const handleStartEdit = () => {
    setEditData(JSON.parse(JSON.stringify(artifact.content_json)))
    setIsEditing(true)
    setSaveError(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      await onSave(artifact.id, editData, observations)
      setIsEditing(false)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSaveError(null)
  }

  const content = isEditing ? editData : artifact.content_json

  const EXPORT_NAMES: Record<string, string> = {
    charter: '01_Project-Charter',
    risk_register: '02_Risk-register',
    stakeholder_register: '03_Stakeholders',
    wbs: '04_WBS',
    backlog: '04_WBS'
  }
  const exportBaseName = EXPORT_NAMES[artifact.type] ?? 'artifact'

  const handleExport = async (format: 'docx' | 'pdf') => {
    const url = `/api/artifacts/${artifact.id}/export?format=${format}`
    const ext = format
    const filename = `${exportBaseName}.${ext}`
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      if (!res.ok) {
        const text = await blob.text()
        try {
          const data = JSON.parse(text)
          alert(data.error ?? 'Error al descargar')
        } catch {
          alert('Error al descargar')
        }
        return
      }
      const u = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = u
      a.download = filename
      a.click()
      URL.revokeObjectURL(u)
    } catch {
      alert('Error de conexión')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {!isEditing ? (
          <button
            type="button"
            onClick={handleStartEdit}
            className="rounded border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            Editar
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded bg-success px-3 py-1 text-xs font-medium text-success-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSaving ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => handleExport('docx')}
          className="rounded border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
        >
          Descargar Word
        </button>
        <button
          type="button"
          onClick={() => handleExport('pdf')}
          className="rounded border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
        >
          Descargar PDF
        </button>
        {saveError && <span className="text-xs text-destructive">{saveError}</span>}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Observaciones</label>
          <textarea
            value={observations}
            onChange={e => setObservations(e.target.value)}
            placeholder="Notas u observaciones sobre este artefacto…"
            className="w-full rounded border border-input bg-input px-3 py-2 text-sm text-foreground min-h-[80px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                setIsSaving(true)
                setSaveError(null)
                try {
                  await onSave(artifact.id, artifact.content_json, observations)
                } catch (e) {
                  setSaveError(e instanceof Error ? e.message : 'Error al guardar')
                } finally {
                  setIsSaving(false)
                }
              }}
              disabled={isSaving}
              className="rounded border border-border px-2 py-1 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
            >
              {isSaving ? 'Guardando…' : 'Guardar observaciones'}
            </button>
          </div>
        </div>
      <div className="rounded-lg border border-border bg-card p-4 overflow-x-auto">
        {artifact.type === 'charter' && (
          <CharterView
            data={content as CharterContent}
            isEditing={isEditing}
            onChange={setEditData as (d: CharterContent) => void}
          />
        )}
        {artifact.type === 'risk_register' && (
          <RiskRegisterView
            data={content as RiskRegisterContent}
            isEditing={isEditing}
            onChange={setEditData as (d: RiskRegisterContent) => void}
          />
        )}
        {artifact.type === 'stakeholder_register' && (
          <StakeholderView
            data={content as StakeholderRegisterContent}
            isEditing={isEditing}
            onChange={setEditData as (d: StakeholderRegisterContent) => void}
          />
        )}
        {(artifact.type === 'wbs' || artifact.type === 'backlog') && (
          <WBSView data={content as WBSContent} />
        )}
      </div>
      </div>
    </div>
  )
}

/* ── Charter ── */

function CharterView ({ data, isEditing, onChange }: {
  data: CharterContent
  isEditing: boolean
  onChange: (d: CharterContent) => void
}) {
  const update = (field: keyof CharterContent, value: unknown) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6 text-sm">
      <div className="rounded-lg border border-primary/25 bg-gradient-to-br from-primary/[0.08] to-transparent p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Acta de constitución del proyecto · PMBOK 8</p>
        <div className="mt-2 text-xl font-bold text-foreground">
          <EditableField value={data.project_name} isEditing={isEditing} onChange={v => update('project_name', v)} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { n: data.objectives.length, l: 'objetivos' },
            { n: data.deliverables.length, l: 'entregables' },
            { n: data.milestones.length, l: 'hitos' },
            { n: data.stakeholders.length, l: 'interesados clave' }
          ].map(k => (
            <div key={k.l} className="rounded-md border border-border bg-background/60 px-3 py-2">
              <p className="text-2xl font-bold tabular-nums text-foreground">{k.n}</p>
              <p className="text-xs text-muted-foreground">{k.l}</p>
            </div>
          ))}
        </div>
      </div>

      <Section title="Alcance">
        <EditableTextarea value={data.scope_summary} isEditing={isEditing} onChange={v => update('scope_summary', v)} />
      </Section>

      <Section title="Objetivos">
        <EditableList items={data.objectives} isEditing={isEditing} onChange={v => update('objectives', v)} />
      </Section>

      <Section title="Entregables">
        <table className="w-full text-left">
          <thead><tr className="border-b border-border">
            <th className="py-1 pr-4 font-medium text-muted-foreground">Nombre</th>
            <th className="py-1 font-medium text-muted-foreground">Descripción</th>
          </tr></thead>
          <tbody>
            {data.deliverables.map((d, i) => (
              <tr key={i} className="border-b border-border">
                <td className="py-1.5 pr-4 font-medium">{d.name}</td>
                <td className="py-1.5 text-muted-foreground">{d.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Hitos">
        <ol className="relative mt-2 space-y-3 border-l border-primary/30 pl-5">
          {data.milestones.map((m, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
              <p className="font-medium text-foreground">{m.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{m.date_estimate ?? 'por definir'}</p>
            </li>
          ))}
        </ol>
      </Section>

      <div className="grid grid-cols-2 gap-4">
        <Section title="Restricciones">
          <EditableList items={data.constraints} isEditing={isEditing} onChange={v => update('constraints', v)} />
        </Section>
        <Section title="Supuestos">
          <EditableList items={data.assumptions} isEditing={isEditing} onChange={v => update('assumptions', v)} />
        </Section>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Section title="Presupuesto">
          <EditableField value={data.budget_summary} isEditing={isEditing} onChange={v => update('budget_summary', v)} />
        </Section>
        <Section title="Duración">
          <EditableField value={data.duration_summary} isEditing={isEditing} onChange={v => update('duration_summary', v)} />
        </Section>
      </div>

      <Section title="Interesados clave">
        <table className="w-full text-left">
          <thead><tr className="border-b border-border">
            <th className="py-1 pr-4 font-medium text-muted-foreground">Rol</th>
            <th className="py-1 font-medium text-muted-foreground">Responsabilidad</th>
          </tr></thead>
          <tbody>
            {data.stakeholders.map((s, i) => (
              <tr key={i} className="border-b border-border">
                <td className="py-1.5 pr-4 font-medium">{s.role}</td>
                <td className="py-1.5 text-muted-foreground">{s.responsibility}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Criterios de aprobación">
        <EditableList items={data.approval_criteria} isEditing={isEditing} onChange={v => update('approval_criteria', v)} />
      </Section>
    </div>
  )
}

/* ── Risk Register ── */

const SEVERITY_COLORS: Record<string, string> = {
  critico: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
  alto: 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30',
  medio: 'bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/30',
  bajo: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
}

function RiskRegisterView ({ data, isEditing, onChange }: {
  data: RiskRegisterContent
  isEditing: boolean
  onChange: (d: RiskRegisterContent) => void
}) {
  const updateRow = (idx: number, field: string, value: string) => {
    const updated = data.risks.map((r, i) => i === idx ? { ...r, [field]: value } : r)
    onChange({ risks: updated })
  }

  return (
    <div className="space-y-6">
    {!isEditing && <RiskMatrix risks={data.risks} />}
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className="py-2 pr-2 font-medium text-muted-foreground">#</th>
          <th className="py-2 pr-2 font-medium text-muted-foreground">Descripción</th>
          <th className="py-2 pr-2 font-medium text-muted-foreground">Prob.</th>
          <th className="py-2 pr-2 font-medium text-muted-foreground">Impacto</th>
          <th className="py-2 pr-2 font-medium text-muted-foreground">Severidad</th>
          <th className="py-2 pr-2 font-medium text-muted-foreground">Mitigación</th>
          <th className="py-2 pr-2 font-medium text-muted-foreground">Owner</th>
          <th className="py-2 font-medium text-muted-foreground">Estado</th>
        </tr>
      </thead>
      <tbody>
        {data.risks.map((r, i) => (
          <tr key={r.id} className="border-b border-border">
            <td className="py-2 pr-2 text-muted-foreground">{r.id}</td>
            <td className="py-2 pr-2 max-w-xs">
              {isEditing
                ? <input className="w-full rounded border border-input bg-input px-1 py-0.5 text-sm" value={r.description} onChange={e => updateRow(i, 'description', e.target.value)} />
                : r.description}
            </td>
            <td className="py-2 pr-2 capitalize">{r.probability}</td>
            <td className="py-2 pr-2 capitalize">{r.impact}</td>
            <td className="py-2 pr-2">
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${SEVERITY_COLORS[r.severity] ?? ''}`}>
                {r.severity}
              </span>
            </td>
            <td className="py-2 pr-2 max-w-xs">
              {isEditing
                ? <input className="w-full rounded border border-input bg-input px-1 py-0.5 text-sm" value={r.mitigation} onChange={e => updateRow(i, 'mitigation', e.target.value)} />
                : r.mitigation}
            </td>
            <td className="py-2 pr-2">{r.owner}</td>
            <td className="py-2 capitalize">{r.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  )
}

const NIVELES = ['alta', 'media', 'baja'] as const
const IMPACTOS = ['bajo', 'medio', 'alto'] as const
const CELDA: Record<string, string> = {
  'alta-alto': 'bg-red-500/25 ring-red-500/40', 'alta-medio': 'bg-orange-500/20 ring-orange-500/35', 'alta-bajo': 'bg-yellow-500/15 ring-yellow-500/30',
  'media-alto': 'bg-orange-500/20 ring-orange-500/35', 'media-medio': 'bg-yellow-500/15 ring-yellow-500/30', 'media-bajo': 'bg-emerald-500/10 ring-emerald-500/25',
  'baja-alto': 'bg-yellow-500/15 ring-yellow-500/30', 'baja-medio': 'bg-emerald-500/10 ring-emerald-500/25', 'baja-bajo': 'bg-emerald-500/10 ring-emerald-500/25'
}

function RiskMatrix ({ risks }: { risks: RiskRegisterContent['risks'] }) {
  const criticos = risks.filter(r => r.severity === 'critico' || (r.probability === 'alta' && r.impact === 'alto')).length
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_220px]">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Matriz de probabilidad e impacto</p>
        <div className="grid grid-cols-[28px_repeat(3,1fr)] gap-1.5">
          {NIVELES.map(p => (
            <div key={p} className="contents">
              <div className="flex items-center justify-center text-[10px] uppercase tracking-wider text-muted-foreground [writing-mode:vertical-rl] rotate-180">{p}</div>
              {IMPACTOS.map(im => {
                const aqui = risks.filter(r => r.probability === p && r.impact === im)
                return (
                  <div key={im} className={`min-h-[78px] rounded-md p-2 ring-1 ${CELDA[`${p}-${im}`]}`}>
                    <div className="flex flex-wrap gap-1.5">
                      {aqui.map(r => (
                        <span key={r.id} title={r.description} className="flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-xs font-bold text-foreground ring-1 ring-white/20">
                          {r.id}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
          <div />
          {IMPACTOS.map(im => (
            <div key={im} className="pt-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">impacto {im}</div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-background/60 p-4">
          <p className="text-3xl font-bold tabular-nums text-foreground">{risks.length}</p>
          <p className="text-xs text-muted-foreground">riesgos identificados en el contrato</p>
        </div>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-3xl font-bold tabular-nums text-red-400">{criticos}</p>
          <p className="text-xs text-muted-foreground">críticos: requieren respuesta antes del inicio</p>
        </div>
      </div>
    </div>
  )
}

/* ── Stakeholder Register ── */

const INFLUENCE_COLORS: Record<string, string> = {
  alta: 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30',
  media: 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30',
  baja: 'bg-white/5 text-white/50 ring-1 ring-white/10'
}

function StakeholderView ({ data, isEditing, onChange }: {
  data: StakeholderRegisterContent
  isEditing: boolean
  onChange: (d: StakeholderRegisterContent) => void
}) {
  const updateRow = (idx: number, field: string, value: string) => {
    const updated = data.stakeholders.map((s, i) => i === idx ? { ...s, [field]: value } : s)
    onChange({ stakeholders: updated })
  }

  return (
    <div className="space-y-6">
    {!isEditing && <PowerInterestGrid stakeholders={data.stakeholders} />}
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className="py-2 pr-2 font-medium text-muted-foreground">#</th>
          <th className="py-2 pr-2 font-medium text-muted-foreground">Rol / Nombre</th>
          <th className="py-2 pr-2 font-medium text-muted-foreground">Interés</th>
          <th className="py-2 pr-2 font-medium text-muted-foreground">Influencia</th>
          <th className="py-2 font-medium text-muted-foreground">Estrategia</th>
        </tr>
      </thead>
      <tbody>
        {data.stakeholders.map((s, i) => (
          <tr key={s.id} className="border-b border-border">
            <td className="py-2 pr-2 text-muted-foreground">{s.id}</td>
            <td className="py-2 pr-2 font-medium">
              {isEditing
                ? <input className="w-full rounded border border-input bg-input px-1 py-0.5 text-sm" value={s.name_role} onChange={e => updateRow(i, 'name_role', e.target.value)} />
                : s.name_role}
            </td>
            <td className="py-2 pr-2">
              {isEditing
                ? <input className="w-full rounded border border-input bg-input px-1 py-0.5 text-sm" value={s.interest} onChange={e => updateRow(i, 'interest', e.target.value)} />
                : s.interest}
            </td>
            <td className="py-2 pr-2">
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${INFLUENCE_COLORS[s.influence] ?? ''}`}>
                {s.influence}
              </span>
            </td>
            <td className="py-2">
              {isEditing
                ? <input className="w-full rounded border border-input bg-input px-1 py-0.5 text-sm" value={s.engagement_strategy} onChange={e => updateRow(i, 'engagement_strategy', e.target.value)} />
                : s.engagement_strategy}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  )
}

const CUADRANTES = [
  { poder: true, interes: false, titulo: 'Mantener satisfecho', tono: 'border-sky-500/30 bg-sky-500/[0.07]' },
  { poder: true, interes: true, titulo: 'Gestionar de cerca', tono: 'border-primary/40 bg-primary/[0.08]' },
  { poder: false, interes: false, titulo: 'Monitorear', tono: 'border-white/10 bg-white/[0.02]' },
  { poder: false, interes: true, titulo: 'Mantener informado', tono: 'border-violet-500/30 bg-violet-500/[0.07]' }
]

function PowerInterestGrid ({ stakeholders }: { stakeholders: StakeholderRegisterContent['stakeholders'] }) {
  const alto = (v?: string) => v === 'alta'
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Matriz de poder e interés</p>
      <div className="grid grid-cols-[22px_1fr]">
        <div className="flex items-center justify-center text-[10px] uppercase tracking-wider text-muted-foreground [writing-mode:vertical-rl] rotate-180">poder →</div>
        <div className="grid grid-cols-2 gap-1.5">
          {CUADRANTES.map(c => {
            const aqui = stakeholders.filter(s => alto(s.influence) === c.poder && alto(s.interest_level ?? 'media') === c.interes)
            return (
              <div key={c.titulo} className={`min-h-[120px] rounded-md border p-3 ${c.tono}`}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">{c.titulo}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {aqui.map(s => (
                    <span key={s.id} className="rounded-full bg-background/80 px-2.5 py-1 text-xs text-foreground ring-1 ring-white/15">{s.name_role}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <p className="mt-1 pl-6 text-center text-[10px] uppercase tracking-wider text-muted-foreground">interés →</p>
    </div>
  )
}

/* ── WBS Tree ── */

function WBSView ({ data }: { data: WBSContent }) {
  const paquetes = data.phases.reduce((n, f) => n + (f.children?.reduce((m, d) => m + (d.children?.length ?? 1), 0) ?? 0), 0)
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="rounded-lg border border-primary/40 bg-primary/[0.08] px-6 py-3 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Estructura de desglose del trabajo</p>
          <p className="mt-1 text-sm text-muted-foreground">{data.phases.length} fases · {paquetes} paquetes de trabajo</p>
        </div>
      </div>
      <div className="mx-auto h-4 w-px bg-primary/40" />
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${data.phases.length <= 4 ? Math.max(1, data.phases.length) : 3}, minmax(0, 1fr))` }}>
        {data.phases.map(phase => (
          <div key={phase.id} className="rounded-lg border border-border bg-background/60 p-3">
            <p className="font-mono text-[11px] text-primary">{phase.id}</p>
            <p className="font-semibold leading-snug text-foreground">{phase.name}</p>
            <div className="mt-3 space-y-2">
              {phase.children?.map(d => (
                <div key={d.id} className="rounded-md border border-border bg-card p-2">
                  <p className="text-xs font-medium text-foreground"><span className="mr-1 font-mono text-muted-foreground">{d.id}</span>{d.name}</p>
                  {d.children && d.children.length > 0 && (
                    <ul className="mt-1.5 space-y-1 border-l border-border pl-2">
                      {d.children.map(tk => (
                        <li key={tk.id} className="text-[11px] text-muted-foreground"><span className="mr-1 font-mono">{tk.id}</span>{tk.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WBSNode ({ node, depth }: { node: WBSTask; depth: number }) {
  const isPhase = depth === 0
  const isDeliverable = depth === 1
  return (
    <div style={{ marginLeft: depth * 20 }}>
      <div className={`flex items-center gap-2 py-1 ${isPhase ? 'font-semibold text-foreground' : isDeliverable ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
        <span className="text-xs text-muted-foreground font-mono w-10 shrink-0">{node.id}</span>
        <span>{node.name}</span>
      </div>
      {node.children?.map(child => (
        <WBSNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}

/* ── Shared editable primitives ── */

function Section ({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </div>
  )
}

function EditableField ({ value, isEditing, onChange }: { value: string; isEditing: boolean; onChange: (v: string) => void }) {
  if (isEditing) {
    return <input className="w-full rounded border border-input bg-input px-2 py-1 text-sm" value={value} onChange={e => onChange(e.target.value)} />
  }
  return <p className="text-foreground">{value}</p>
}

function EditableTextarea ({ value, isEditing, onChange }: { value: string; isEditing: boolean; onChange: (v: string) => void }) {
  if (isEditing) {
    return <textarea className="w-full rounded border border-input bg-input px-2 py-1 text-sm min-h-[80px]" value={value} onChange={e => onChange(e.target.value)} />
  }
  return <p className="text-foreground whitespace-pre-wrap">{value}</p>
}

function EditableList ({ items, isEditing, onChange }: { items: string[]; isEditing: boolean; onChange: (v: string[]) => void }) {
  if (isEditing) {
    return (
      <div className="space-y-1">
        {items.map((item, i) => (
          <input
            key={i}
            className="w-full rounded border border-input bg-input px-2 py-1 text-sm"
            value={item}
            onChange={e => {
              const updated = [...items]
              updated[i] = e.target.value
              onChange(updated)
            }}
          />
        ))}
      </div>
    )
  }
  return (
    <ul className="list-disc list-inside space-y-0.5 text-foreground">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  )
}
