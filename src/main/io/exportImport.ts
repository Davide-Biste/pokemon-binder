/**
 * Reads / writes `.pkbinder.json` profile files via Electron's file dialogs.
 *
 * Export flow:  collect binders + wishlist → build payload → save dialog → write JSON.
 * Import flow:  open dialog → read file → validate format → insert into friend_snapshots.
 *
 * Validation here is intentionally minimal: we check the `format` tag and the
 * presence of the top-level keys. Deeper sanity is the renderer's problem
 * (it'll just render whatever it gets, and missing fields show as empty).
 */
import { BrowserWindow, dialog } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import { basename } from 'path'
import { bindersApi } from '../db/binders'
import { wishlistApi } from '../db/wishlist'
import { friendsRepo } from '../db/friends'
import { getSetting, OWNER_NAME_KEY, setSetting } from '../db/settings'
import { EXPORT_FORMAT } from '../../shared/export'
import type { ExportPayload, ExportResult } from '../../shared/export'
import type { FriendSnapshot } from '../../shared/friends'
import type { Binder } from '../../shared/binders'

const FILE_EXTENSION = 'pkbinder.json'

/** Slugify the owner name for a safe default filename. */
function defaultFilename(ownerName: string): string {
  const slug = ownerName
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')  // strip combining diacritical marks
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const date = new Date().toISOString().slice(0, 10)
  return `${slug || 'profile'}-${date}.${FILE_EXTENSION}`
}

async function loadFullBinders(): Promise<Binder[]> {
  // `list()` returns summaries; we need the full nested structure for each.
  const summaries = await bindersApi.list()
  const binders: Binder[] = []
  for (const s of summaries) {
    const full = await bindersApi.get(s.id)
    if (full) binders.push(full)
  }
  return binders
}

/**
 * Build the owner's profile payload in memory (no file I/O).
 *
 * Shared by the export flow and the in-app Trade Matcher: the matcher feeds
 * "me" and "them" through the same code path because they're the same shape.
 */
export async function buildOwnerPayload(ownerName: string): Promise<ExportPayload> {
  const [binders, wishlist] = await Promise.all([loadFullBinders(), wishlistApi.list()])
  return {
    format: EXPORT_FORMAT,
    exportedAt: Date.now(),
    owner: { name: ownerName },
    binders,
    wishlist
  }
}

export async function exportProfile(
  ownerName: string,
  parent?: BrowserWindow
): Promise<ExportResult | null> {
  // Persist the owner name so subsequent exports default to it.
  setSetting(OWNER_NAME_KEY, ownerName)

  const payload = await buildOwnerPayload(ownerName)
  const json = JSON.stringify(payload, null, 2)

  const result = await dialog.showSaveDialog(parent ?? BrowserWindow.getFocusedWindow()!, {
    title: 'Esporta profilo PokeBinder',
    defaultPath: defaultFilename(ownerName),
    filters: [{ name: 'PokeBinder profile', extensions: [FILE_EXTENSION] }]
  })
  if (result.canceled || !result.filePath) return null

  await writeFile(result.filePath, json, 'utf8')
  return { path: result.filePath, byteSize: Buffer.byteLength(json, 'utf8') }
}

function validatePayload(raw: unknown): ExportPayload {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Il file non contiene un oggetto JSON valido.')
  }
  const obj = raw as Record<string, unknown>
  if (obj.format !== EXPORT_FORMAT) {
    throw new Error(
      `Formato non supportato: atteso "${EXPORT_FORMAT}", trovato "${String(obj.format)}".`
    )
  }
  if (!obj.owner || typeof (obj.owner as { name?: unknown }).name !== 'string') {
    throw new Error('Il file non contiene un proprietario valido.')
  }
  if (!Array.isArray(obj.binders) || !Array.isArray(obj.wishlist)) {
    throw new Error('Il file non contiene le sezioni binders/wishlist.')
  }
  return raw as ExportPayload
}

export async function importFriendSnapshot(
  parent?: BrowserWindow
): Promise<FriendSnapshot | null> {
  const result = await dialog.showOpenDialog(parent ?? BrowserWindow.getFocusedWindow()!, {
    title: 'Importa profilo amico',
    properties: ['openFile'],
    filters: [
      { name: 'PokeBinder profile', extensions: [FILE_EXTENSION, 'json'] },
      { name: 'Tutti i file', extensions: ['*'] }
    ]
  })
  if (result.canceled || result.filePaths.length === 0) return null

  const path = result.filePaths[0]
  const text = await readFile(path, 'utf8')

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error(`File non leggibile come JSON: ${basename(path)}`)
  }

  const payload = validatePayload(parsed)
  return friendsRepo.insert(payload, path)
}

export function getOwnerName(): string {
  return getSetting(OWNER_NAME_KEY) ?? ''
}

export function setOwnerName(name: string): void {
  setSetting(OWNER_NAME_KEY, name)
}
