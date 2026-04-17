import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'

const DB_PATH = process.env.VERCEL
  ? '/tmp/pm-ai.db'
  : path.join(process.cwd(), 'data', 'pm-ai.db')

let _db: Database.Database | null = null

export function getDb (): Database.Database {
  if (_db) return _db
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  _db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT,
      industry TEXT,
      duration_estimate TEXT,
      budget_estimate TEXT,
      methodology TEXT,
      structured_context_json TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
      file_name TEXT,
      file_url TEXT,
      file_size_bytes INTEGER,
      parsed_text TEXT,
      page_count INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS artifacts (
      id TEXT PRIMARY KEY,
      project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
      type TEXT,
      content_json TEXT,
      observations TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      UNIQUE(project_id, type)
    );
  `)
  return _db
}

export function newId (): string {
  return randomUUID()
}

export function jsonParse<T> (val: string | null | undefined): T | null {
  if (!val) return null
  try { return JSON.parse(val) as T } catch { return null }
}
