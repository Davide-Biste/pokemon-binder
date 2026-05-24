import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type {
  BinderApi,
  CreateBinderInput,
  MoveCardInput,
  PlaceCardInput,
  TradeStatus,
  UpdateBinderInput
} from '../shared/binders'
import type { AddWishlistInput, WishlistApi } from '../shared/wishlist'
import type { FriendsApi } from '../shared/friends'
import type { ProfileApi } from '../shared/profile'

const binders: BinderApi = {
  list: () => ipcRenderer.invoke('binders:list'),
  get: (id: number) => ipcRenderer.invoke('binders:get', id),
  create: (input: CreateBinderInput) => ipcRenderer.invoke('binders:create', input),
  update: (input: UpdateBinderInput) => ipcRenderer.invoke('binders:update', input),
  remove: (id: number) => ipcRenderer.invoke('binders:remove', id),
  addPage: (binderId: number) => ipcRenderer.invoke('binders:addPage', binderId),
  removePage: (pageId: number) => ipcRenderer.invoke('binders:removePage', pageId),
  placeCard: (input: PlaceCardInput) => ipcRenderer.invoke('binders:placeCard', input),
  moveCard: (input: MoveCardInput) => ipcRenderer.invoke('binders:moveCard', input),
  removeCard: (pageId: number, slotIndex: number) =>
    ipcRenderer.invoke('binders:removeCard', pageId, slotIndex),
  setTradeStatus: (slotId: number, status: TradeStatus) =>
    ipcRenderer.invoke('binders:setTradeStatus', slotId, status)
}

const wishlist: WishlistApi = {
  list: () => ipcRenderer.invoke('wishlist:list'),
  add: (input: AddWishlistInput) => ipcRenderer.invoke('wishlist:add', input),
  remove: (id: number) => ipcRenderer.invoke('wishlist:remove', id),
  updateNote: (id: number, note: string | null) =>
    ipcRenderer.invoke('wishlist:updateNote', id, note),
  has: (cardId: number) => ipcRenderer.invoke('wishlist:has', cardId)
}

const friends: FriendsApi = {
  list: () => ipcRenderer.invoke('friends:list'),
  listFull: () => ipcRenderer.invoke('friends:listFull'),
  get: (id: number) => ipcRenderer.invoke('friends:get', id),
  importFromFile: () => ipcRenderer.invoke('friends:importFromFile'),
  remove: (id: number) => ipcRenderer.invoke('friends:remove', id)
}

const profile: ProfileApi = {
  getOwnerName: () => ipcRenderer.invoke('profile:getOwnerName'),
  setOwnerName: (name: string) => ipcRenderer.invoke('profile:setOwnerName', name),
  export: (ownerName: string) => ipcRenderer.invoke('profile:export', ownerName),
  getProfile: () => ipcRenderer.invoke('profile:getProfile'),
  getLocale: () => ipcRenderer.invoke('profile:getLocale'),
  setLocale: (locale: string) => ipcRenderer.invoke('profile:setLocale', locale)
}

// Custom APIs for renderer
const api = {
  binders,
  wishlist,
  friends,
  profile
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
