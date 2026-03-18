# PM AI Engine — Contexto del proyecto

## Descripción
SaaS de gestión de proyectos con IA. El usuario sube un contrato/SoW/RFP en PDF, la IA extrae contexto estructurado y genera artefactos de PM alineados a PMBOK 8.

## Stack
- **Framework**: Next.js 14.2.18 (App Router, TypeScript)
- **Estilos**: Tailwind CSS 3.4.14 — tema oscuro navy (vars CSS en `app/globals.css`)
- **Base de datos**: Supabase (PostgreSQL) — `lib/supabase/`
- **IA**: OpenAI API con modelo `gpt-5-nano` — `lib/openai/`
- **Exportación**: DOCX (`lib/export/build-docx.ts`) y PDF (`lib/export/build-pdf.ts`)
- **Dev server**: `npm run dev` → http://localhost:3001 (3000 ocupado)

## Estructura de carpetas

```
app/
  api/
    upload/             POST — sube PDF a Supabase Storage, crea proyecto
    process/            POST — extrae texto del PDF y llama a structureWithOpenAI
    generate-artifact/  POST — genera artefacto con generateArtifact()
    projects/[id]/      GET/PATCH proyecto, GET artifacts
    artifacts/[id]/     PATCH artifact (content_json + observations)
    artifacts/[id]/export/  GET — exporta Word o PDF
    env-check/          GET — valida variables de entorno
  projects/
    page.tsx            Lista de proyectos (server component)
    new/page.tsx        Formulario nuevo proyecto (client component)
    [id]/page.tsx       Detalle del proyecto (server component)
    [id]/ProjectHeader.tsx
    [id]/ArtifactTabs.tsx
    [id]/ArtifactViewer.tsx
    [id]/GenerateArtifactButton.tsx
    [id]/ProcessDocumentButton.tsx
  layout.tsx            Header con nav, max-w-6xl
  page.tsx              Home page con hero + 3 feature cards
  globals.css           Variables CSS del tema oscuro navy

lib/
  openai/
    generate-artifact.ts   generateArtifact() — usa gpt-5-nano, devuelve ArtifactContent
    structure-document.ts  structureWithOpenAI() — usa gpt-5-nano, devuelve StructuredContext
  supabase/
    client.ts   createBrowserClient()
    server.ts   getSupabaseAdmin()
  export/
    build-docx.ts   buildDocx(artifact) → Buffer
    build-pdf.ts    buildPdf(artifact) → Buffer
  load-env.ts

types/index.ts   — todos los tipos TypeScript del proyecto

supabase/migrations/
  001_initial.sql               — tablas: projects, documents, artifacts
  002_artifacts_observations.sql — columna observations en artifacts
```

## Esquema de base de datos (Supabase)

```sql
projects (id, name, industry, duration_estimate, budget_estimate, methodology, structured_context_json jsonb, created_at, updated_at)
documents (id, project_id, file_name, file_url, file_size_bytes, parsed_text, page_count, created_at)
artifacts (id, project_id, type, content_json jsonb, observations text, created_at, updated_at)
-- Storage bucket: "documents" (público)
```

## Tipos de artefactos
`charter` | `risk_register` | `stakeholder_register` | `wbs` | `backlog`

## Variables de entorno requeridas (`.env`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

## Flujo principal
1. Usuario sube PDF → `POST /api/upload` → crea `project` + `document` en Supabase, sube PDF a Storage
2. Usuario procesa → `POST /api/process` → extrae texto del PDF (pdfjs-dist), llama `structureWithOpenAI()`, guarda `structured_context_json` en project
3. Usuario genera artefacto → `POST /api/generate-artifact` → llama `generateArtifact()`, guarda en tabla `artifacts`
4. Usuario exporta → `GET /api/artifacts/[id]/export?format=docx|pdf`

## Tema visual (dark navy)
Colores definidos como variables CSS en `app/globals.css`:
- Background: `hsl(222 47% 7%)` — azul marino muy oscuro
- Card: `hsl(222 44% 11%)`
- Primary (accent): `hsl(213 94% 58%)` — azul brillante
- Border: `hsl(222 28% 18%)`
- Texto: `hsl(210 40% 93%)`

## Errores TypeScript conocidos (pre-existentes)
- `lib/export/build-docx.ts` tiene ~20 errores TS por acceso a propiedades de `ArtifactContent` sin discriminar el tipo union. No bloquean el build de Next.js pero están pendientes de fix.

## Comandos útiles
```bash
npm run dev      # inicia en http://localhost:3001
npm run build    # build de producción
npm run lint     # eslint
npx tsc --noEmit # chequeo de tipos
```
