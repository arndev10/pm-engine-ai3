import Link from 'next/link'

export default function HomePage () {
  return (
    <div className="relative flex min-h-[calc(100vh-57px)] flex-col items-center overflow-hidden">

      {/* Green radial glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[65vh]"
        style={{
          background: 'radial-gradient(ellipse 90% 70% at 50% -10%, hsl(145,70%,18%) 0%, transparent 65%)'
        }}
      />

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center px-6 pt-28 pb-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(145,100%,46%,0.3)] bg-[hsl(145,100%,46%,0.08)] px-3.5 py-1 text-xs font-medium text-[hsl(145,100%,60%)]">
          Powered by GPT-5 Nano · Alineado a PMBOK 8
        </div>

        <h1 className="max-w-3xl text-[3.5rem] font-bold leading-[1.05] tracking-tight sm:text-[4.5rem]">
          <span className="text-white/35">El futuro de la</span>
          <br />
          <span className="text-white/35">gestión de proyectos</span>
          <br />
          <span className="text-white">es humano</span>
          {' '}
          <span className="text-white/25">+</span>
          {' '}
          <span className="text-[hsl(145,100%,55%)]">IA</span>
        </h1>

        <p className="mt-6 max-w-md text-base text-white/45 leading-relaxed">
          Sube un contrato, SoW o RFP y obtén en segundos artefactos PMBOK 8 listos para usar.
        </p>

        <div className="mt-10 flex items-center gap-3">
          <Link
            href="/projects/new"
            className="rounded-full border border-white/20 bg-white/[0.06] px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.1] hover:border-white/30 transition-all duration-150"
          >
            Comenzar ahora
          </Link>
          <Link
            href="/projects"
            className="rounded-full px-6 py-2.5 text-sm font-medium text-white/45 hover:text-white/70 transition-colors"
          >
            Ver proyectos →
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-20">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              ),
              title: 'Sube el documento',
              desc: 'Contrato, SoW o RFP en PDF. Extracción automática de contexto estructurado.'
            },
            {
              icon: (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              ),
              title: 'Genera artefactos',
              desc: 'Charter, Risk Register, Stakeholder Register y WBS en segundos con IA.'
            },
            {
              icon: (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              ),
              title: 'Exporta listo',
              desc: 'Descarga en Word o PDF para presentar a clientes o al equipo.'
            }
          ].map(f => (
            <div
              key={f.title}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 hover:border-[hsl(145,100%,46%,0.25)] hover:bg-white/[0.05] transition-all duration-200"
            >
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(145,100%,46%,0.12)] text-[hsl(145,100%,55%)]">
                {f.icon}
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-white">{f.title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
