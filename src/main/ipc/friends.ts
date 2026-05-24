import { ipcMain } from 'electron'
import { friendsRepo } from '../db/friends'
import { importFriendSnapshot } from '../io/exportImport'

export function registerFriendsIpc(): void {
  ipcMain.handle('friends:list', () => friendsRepo.list())
  ipcMain.handle('friends:listFull', () => friendsRepo.listFull())
  ipcMain.handle('friends:get', (_e, id: number) => friendsRepo.get(id))
  ipcMain.handle('friends:importFromFile', () => importFriendSnapshot())
  ipcMain.handle('friends:remove', (_e, id: number) => friendsRepo.remove(id))
}
