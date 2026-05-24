import { ElectronAPI } from '@electron-toolkit/preload'
import type { BinderApi } from '../shared/binders'
import type { WishlistApi } from '../shared/wishlist'
import type { FriendsApi } from '../shared/friends'
import type { ProfileApi } from '../shared/profile'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      binders: BinderApi
      wishlist: WishlistApi
      friends: FriendsApi
      profile: ProfileApi
    }
  }
}
