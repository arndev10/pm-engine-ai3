import Link from 'next/link'
import { getDb } from '@/lib/db'
import ProjectRowActions from './ProjectRowActions'

export const dynamic = 'force-dynamic'

interface ProjectRow {
  id: string
  name: string | null
  industry: string | null
  duration_estimate: string | null
  budget_estimate: string | null
  methodology: string | null
  created_at: string
  is_processed: number
}

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function fmtDate (s: string) {
  const d = new Date(s)
  return {
    day: d.getDate(),
    month: MONTHS[d.getMonth()],
    time: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }
}

export default function ProjectsPage () {
  const db = getDb()
  const projects = db.prepare(`
    SELECT id, name, industry, duration_estimate, budget_estimate, methodology, created_at,
           CASE WHEN structured_context_json IS NOT NULL THEN 1 ELSE 0 END as is_processed
    FROM projects ORDER BY created_at DESC
  `).all() as ProjectRow[]

  const processed = projects.filter(p => p.is_processed).length

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">

      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Tus proyectos
          </h1>
          <p className="mt-1 text-sm text-white/35">
            {projects.length} proyecto{projects.length !== 1 ? 's' : ''} · {processed} procesado{processed !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(145,100%,46%)] px-4 py-2 text-sm font-bold text-[hsl(0,0%,4%)] hover:bg-[hsl(145,100%,52%)] transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Nuevo Proyecto
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="mb-7 flex items-center gap-1 border-b border-white/[0.07] pb-0">
        {[
          { label: 'Todos', count: projects.length, active: true },
          { label: 'Procesados', count: processed, active: false },
          { label: 'Sin procesar', count: projects.length - processed, active: false },
        ].map(tab => (
          <button
            key={tab.label}
            className={[
              'relative -mb-px px-4 py-2.5 text-sm transition-colors',
              tab.active
                ? 'font-semibold text-white after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-[hsl(145,100%,46%)]'
                : 'font-medium text-white/35 hover:text-white/60'
            ].join(' ')}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs ${tab.active ? 'text-[hsl(145,100%,50%)]' : 'text-white/25'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 py-28">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" className="text-white/20">
              <path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/40">Sin proyectos aún</p>
            <p className="mt-1 text-xs text-white/20">Sube un contrato o SoW para comenzar</p>
          </div>
          <Link
            href="/projects/new"
            className="rounded-full bg-[hsl(145,100%,46%)] px-5 py-2 text-sm font-bold text-[hsl(0,0%,4%)] hover:bg-[hsl(145,100%,52%)] transition-colors"
          >
            Crear primer proyecto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {projects.map((p, i) => {
            const { day, month, time } = fmtDate(p.created_at)
            const active = i === 0

            return (
              <div
                key={p.id}
                className={[
                  'group relative flex min-h-[190px] flex-col gap-3 rounded-xl p-4 transition-all duration-200',
                  active
                    ? 'border border-[hsl(145,100%,46%)/0.35] bg-[hsl(145,60%,8%)] shadow-lg shadow-[hsl(145,100%,20%)/0.2]'
                    : 'border border-white/[0.08] bg-white/[0.035] hover:border-white/[0.15] hover:bg-white/[0.055]'
                ].join(' ')}
              >
                {/* Actions */}
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ProjectRowActions
                    projectId={p.id}
                    projectName={p.name || 'Sin nombre'}
                    durationEstimate={p.duration_estimate}
                    budgetEstimate={p.budget_estimate}
                  />
                </div>

                {/* Date */}
                <div>
                  <div className={`text-[2.25rem] font-bold leading-none tabular-nums ${active ? 'text-[hsl(145,100%,60%)]' : 'text-white'}`}>
                    {day}
                  </div>
                  <div className={`mt-1 text-xs ${active ? 'text-[hsl(145,80%,45%)]' : 'text-white/30'}`}>
                    {month} · {time}
                  </div>
                </div>

                {/* Processed dot */}
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    p.is_processed
                      ? 'bg-[hsl(145,100%,46%)]'
                      : 'bg-white/15'
                  }`}
                  title={p.is_processed ? 'Procesado' : 'Sin procesar'}
                />

                {/* Name */}
                <Link href={`/projects/${p.id}`} className="mt-auto">
                  <p className="text-sm font-semibold leading-snug line-clamp-2 text-white/90 hover:text-white transition-colors">
                    {p.name || 'Sin nombre'}
                  </p>
                  {p.industry && (
                    <p className="mt-1 text-[11px] text-white/30">{p.industry}</p>
                  )}
                </Link>

                {/* Methodology */}
                {p.methodology && (
                  <span className={`self-start rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                    active
                      ? 'bg-[hsl(145,100%,46%)/0.15] text-[hsl(145,100%,55%)]'
                      : 'bg-white/[0.07] text-white/40'
                  }`}>
                    {p.methodology}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
