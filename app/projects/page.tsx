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
    <div className="flex h-full flex-col px-8 py-7">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[1.75rem] font-bold leading-none tracking-tight text-white">
          Hola,{' '}
          <span className="font-normal text-white/40">aquí están tus proyectos.</span>
        </h1>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[hsl(252,90%,65%)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[hsl(252,80%,40%)/0.35] hover:bg-[hsl(252,90%,70%)] transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Nuevo Proyecto
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="mb-7 flex items-center gap-1">
        <span className="rounded-lg bg-white/[0.09] px-3.5 py-1.5 text-sm font-medium text-white">
          Todos <span className="ml-1 text-white/45">({projects.length})</span>
        </span>
        <span className="rounded-lg px-3.5 py-1.5 text-sm text-white/35">
          Procesados <span className="ml-1">({processed})</span>
        </span>
        <span className="rounded-lg px-3.5 py-1.5 text-sm text-white/35">
          Sin procesar <span className="ml-1">({projects.length - processed})</span>
        </span>
      </div>

      {/* Cards */}
      {projects.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.04]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" className="text-white/25">
              <path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/50">Aún no tienes proyectos</p>
            <p className="mt-1 text-xs text-white/25">Sube un contrato o SoW para comenzar</p>
          </div>
          <Link
            href="/projects/new"
            className="rounded-xl bg-[hsl(252,90%,65%)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[hsl(252,80%,40%)/0.3] hover:opacity-90 transition-opacity"
          >
            Crear primer proyecto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {projects.map((p, i) => {
            const { day, month, time } = fmtDate(p.created_at)
            const active = i === 0

            return (
              <div
                key={p.id}
                className={[
                  'group relative flex min-h-[188px] flex-col gap-3 rounded-2xl p-4 transition-all duration-200',
                  active
                    ? 'bg-gradient-to-br from-[hsl(252,78%,54%)] to-[hsl(275,68%,48%)] shadow-2xl shadow-[hsl(252,80%,40%)/0.45]'
                    : 'border border-white/[0.07] bg-[hsl(243,45%,8%)] hover:border-white/[0.14] hover:bg-[hsl(243,45%,10%)]'
                ].join(' ')}
              >
                {/* Actions */}
                <div className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ProjectRowActions
                    projectId={p.id}
                    projectName={p.name || 'Sin nombre'}
                    durationEstimate={p.duration_estimate}
                    budgetEstimate={p.budget_estimate}
                  />
                </div>

                {/* Date */}
                <div>
                  <div className="text-[2.25rem] font-bold leading-none tabular-nums text-white">{day}</div>
                  <div className={`mt-1 text-xs ${active ? 'text-white/60' : 'text-white/35'}`}>
                    {month} · {time}
                  </div>
                </div>

                {/* Processed dot */}
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    p.is_processed
                      ? active ? 'bg-white/65' : 'bg-emerald-400'
                      : active ? 'bg-white/25' : 'bg-white/15'
                  }`}
                  title={p.is_processed ? 'Procesado' : 'Sin procesar'}
                />

                {/* Name + industry */}
                <Link href={`/projects/${p.id}`} className="mt-auto">
                  <p className={`text-sm font-semibold leading-snug line-clamp-2 ${active ? 'text-white' : 'text-white/88'}`}>
                    {p.name || 'Sin nombre'}
                  </p>
                  {p.industry && (
                    <p className={`mt-1 text-[11px] ${active ? 'text-white/55' : 'text-white/35'}`}>
                      {p.industry}
                    </p>
                  )}
                </Link>

                {/* Methodology badge */}
                {p.methodology && (
                  <span className={`self-start rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                    active ? 'bg-white/20 text-white/85' : 'bg-white/[0.08] text-white/45'
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
