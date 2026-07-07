import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'
import { useAuthStore } from './stores/authStore'

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  // Initialiser la session auth avant de monter l'app
  const authStore = useAuthStore()
  try {
    await authStore.init()
  } catch (err) {
    console.warn('Auth init failed (Supabase may not be configured):', err.message)
  }

  app.mount('#app')
}

bootstrap()
