/**
 * Profile = owner identity + export entry point.
 *
 * The owner name is the only piece of "identity" the app stores. It's used
 * as the default for export filenames and shown to friends when they import.
 * Stored in the `settings` k/v table.
 */
import { ipcMain } from 'electron'
import {
  buildOwnerPayload,
  exportProfile,
  getOwnerName,
  setOwnerName
} from '../io/exportImport'
import { getSetting, LOCALE_KEY, setSetting } from '../db/settings'

export function registerProfileIpc(): void {
  ipcMain.handle('profile:getOwnerName', () => getOwnerName())
  ipcMain.handle('profile:setOwnerName', (_e, name: string) => setOwnerName(name))
  ipcMain.handle('profile:export', (_e, ownerName: string) => exportProfile(ownerName))
  ipcMain.handle('profile:getProfile', () => buildOwnerPayload(getOwnerName()))

  // Locale: stored as a plain string in the settings table; renderer is the
  // source of truth for which codes are valid (see src/renderer/src/i18n).
  ipcMain.handle('profile:getLocale', () => getSetting(LOCALE_KEY))
  ipcMain.handle('profile:setLocale', (_e, locale: string) =>
    setSetting(LOCALE_KEY, locale)
  )
}
