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
  await authStore.init()

  app.mount('#app')
}

bootstrap()
