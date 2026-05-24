import { ipcMain } from 'electron'
import { bindersApi } from '../db/binders'
import type {
  CreateBinderInput,
  MoveCardInput,
  PlaceCardInput,
  TradeStatus,
  UpdateBinderInput
} from '../../shared/binders'

/**
 * Wires every BinderApi method onto an `ipcMain.handle` channel.
 * Channel naming convention: `binders:<method>`.
 */
export function registerBinderIpc(): void {
  ipcMain.handle('binders:list', () => bindersApi.list())
  ipcMain.handle('binders:get', (_e, id: number) => bindersApi.get(id))
  ipcMain.handle('binders:create', (_e, input: CreateBinderInput) => bindersApi.create(input))
  ipcMain.handle('binders:update', (_e, input: UpdateBinderInput) => bindersApi.update(input))
  ipcMain.handle('binders:remove', (_e, id: number) => bindersApi.remove(id))
  ipcMain.handle('binders:addPage', (_e, binderId: number) => bindersApi.addPage(binderId))
  ipcMain.handle('binders:removePage', (_e, pageId: number) => bindersApi.removePage(pageId))
  ipcMain.handle('binders:placeCard', (_e, input: PlaceCardInput) => bindersApi.placeCard(input))
  ipcMain.handle('binders:moveCard', (_e, input: MoveCardInput) => bindersApi.moveCard(input))
  ipcMain.handle('binders:removeCard', (_e, pageId: number, slotIndex: number) =>
    bindersApi.removeCard(pageId, slotIndex)
  )
  ipcMain.handle('binders:setTradeStatus', (_e, slotId: number, status: TradeStatus) =>
    bindersApi.setTradeStatus(slotId, status)
  )
}
