import { NextResponse } from 'next/server'

export async function GET () {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY?.trim())
  const hasModel = Boolean(process.env.OPENAI_MODEL?.trim())
  return NextResponse.json({
    OPENAI_API_KEY: hasOpenAI ? 'ok' : 'missing',
    OPENAI_MODEL: hasModel ? (process.env.OPENAI_MODEL) : 'gpt-4o-mini (default)',
    storage: 'local filesystem',
    database: 'SQLite (local)'
  })
}
