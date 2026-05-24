import { ipcMain } from 'electron'
import { wishlistApi } from '../db/wishlist'
import type { AddWishlistInput } from '../../shared/wishlist'

export function registerWishlistIpc(): void {
  ipcMain.handle('wishlist:list', () => wishlistApi.list())
  ipcMain.handle('wishlist:add', (_e, input: AddWishlistInput) => wishlistApi.add(input))
  ipcMain.handle('wishlist:remove', (_e, id: number) => wishlistApi.remove(id))
  ipcMain.handle('wishlist:updateNote', (_e, id: number, note: string | null) =>
    wishlistApi.updateNote(id, note)
  )
  ipcMain.handle('wishlist:has', (_e, cardId: number) => wishlistApi.has(cardId))
}
