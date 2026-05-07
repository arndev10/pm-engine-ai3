# PM AI Engine

SaaS de gestión de proyectos con IA. Sube un contrato, SoW o RFP en PDF — genera artefactos PMBOK 8 en segundos.

## 🎨 Design

**Dark theme con acento verde eléctrico** (HackerRank inspired)
- Fondo: Negro puro
- Primario: Verde eléctrico (`hsl(145, 100%, 46%)`)
- Top nav horizontal con branding
- Landing page hero con glow radial
- Dashboard card grid + empty state

## Features

- **Carga de documentos**: PDF (contrato, SoW, RFP)
- **Extracción con IA**: contexto estructurado con OpenAI
- **Generación de artefactos**: Charter, Risk Register, Stakeholder Matrix, WBS
- **Edición inline**: ajusta artefactos directamente en el UI
- **Exportación**: Word + PDF
- **Base de datos**: SQLite (local) / `/tmp` en Vercel

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS  
- **Backend**: Next.js API routes (Node.js 18, TypeScript)  
- **Database**: SQLite (`better-sqlite3`)
- **AI & Export**: OpenAI API, `docx`, `pdfkit`  

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# (Opcional) Environment variables
cp .env.example .env
# OPENAI_API_KEY=sk-... (solo si usas OpenAI)

# Run dev server
npm run dev
```

App en **http://localhost:3000**

> La base de datos SQLite se crea automáticamente en `data/pm-ai.db` (local)  
> En Vercel usa `/tmp` (datos efímeros — demo only)

## 📁 Project Structure

```bash
pm-ai-engine/
  app/
    layout.tsx                 # Top nav (green theme)
    page.tsx                   # Landing hero
    globals.css                # Dark + green theme
    api/                       # Next.js API routes
      upload/                  # PDF upload
      process/                 # Extract context
      generate-artifact/       # AI generation
      projects/[id]/           # Project CRUD
      artifacts/[id]/          # Artifact CRUD
    projects/
      page.tsx                 # Dashboard (card grid, empty state)
      new/page.tsx             # New project form
      [id]/page.tsx            # Project detail
      [id]/ArtifactTabs.tsx    # Artifact viewer/editor

  lib/
    db/                        # SQLite setup (Vercel-safe)
    openai/                    # OpenAI integration
    export/                    # DOCX/PDF builders
    supabase/                  # Legacy (Supabase client)

  types/index.ts               # TypeScript types
  public/                      # Static assets
  .env.example                 # Env vars template
  .gitignore                   # Git ignore rules
  package.json
  next.config.js
  tailwind.config.ts
  tsconfig.json
```

