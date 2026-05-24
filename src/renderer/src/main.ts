import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './assets/main.css'
import './assets/pokebinder.css'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { i18n, hydrateLocaleFromSettings } from './i18n'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minuto: dati considerati "fresh"
      gcTime: 1000 * 60 * 10, // 10 minuti: tempo in cache se non usati
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      retry: 1
    }
  }
})

const app = createApp(App)

app.use(VueQueryPlugin, { queryClient })
app.use(i18n)
app.use(router)
app.mount('#app')

// Resolve the persisted locale asynchronously — the app is already mounted
// with the default `en`; swapping happens reactively when this resolves.
hydrateLocaleFromSettings()
