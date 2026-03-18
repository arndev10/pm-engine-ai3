import Link from 'next/link'

const FEATURES = [
  {
    icon: '📄',
    title: 'Sube un documento',
    desc: 'Contrato, SoW o RFP en PDF. La IA extrae el contexto estructurado del proyecto automáticamente.'
  },
  {
    icon: '⚡',
    title: 'Genera artefactos con IA',
    desc: 'Project Charter, Risk Register, Stakeholder Register y WBS alineados a PMBOK 8 en segundos.'
  },
  {
    icon: '⬇️',
    title: 'Exporta en Word o PDF',
    desc: 'Descarga los artefactos listos para presentar a clientes o al equipo de proyecto.'
  }
]

export default function HomePage () {
  return (
    <div className="space-y-16">
      <section className="pt-8 space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Powered by GPT-5 Nano · Alineado a PMBOK 8
        </div>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl leading-tight">
          Artefactos de{' '}
          <span className="text-primary">gestión de proyectos</span>{' '}
          generados con IA
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
          Sube un contrato, SoW o RFP y obtén en segundos un Charter, Risk Register, Stakeholder Register y WBS listos para usar.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          >
            <span>+</span>
            Nuevo proyecto
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          >
            Ver proyectos
            <span className="text-muted-foreground">→</span>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-card p-5 space-y-3 hover:border-primary/30 transition-colors">
            <div className="text-2xl">{f.icon}</div>
            <h3 className="font-semibold text-foreground">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
