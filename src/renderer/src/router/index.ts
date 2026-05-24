import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '@/pages/DashboardPage.vue'
import BindersPage from '@/pages/BindersPage.vue'
import BinderDetailPage from '@/pages/BinderDetailPage.vue'
import BinderEditPage from '@/pages/BinderEditPage.vue'
import PokedexPage from '@/pages/PokedexPage.vue'
import PokemonDetailPage from '@/pages/PokemonDetailPage.vue'
import WishlistPage from '@/pages/WishlistPage.vue'
import FriendsPage from '@/pages/FriendsPage.vue'
import FriendBinderPage from '@/pages/FriendBinderPage.vue'
import TradeMatchPage from '@/pages/TradeMatchPage.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: DashboardPage },
    { path: '/binders', component: BindersPage },
    { path: '/binders/:id(\\d+)', component: BinderDetailPage },
    { path: '/binders/:id(\\d+)/edit', component: BinderEditPage },
    // Legacy redirect — sidebar/links may still point here.
    { path: '/binder', redirect: '/binders' },
    { path: '/pokedex', component: PokedexPage },
    { path: '/pokedex/:id(\\d+)', component: PokemonDetailPage },
    { path: '/wishlist', component: WishlistPage },
    { path: '/friends', component: FriendsPage },
    { path: '/friends/:id(\\d+)', component: FriendBinderPage },
    { path: '/trades', component: TradeMatchPage },
    { path: '/trades/:friendId(\\d+)', component: TradeMatchPage }
  ]
})
