import { useAuthStore } from '@/stores/authStore'

export function setupGuards(router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    if (!authStore.authReady) {
      await authStore.init()
    }

    if (to.meta.requiresAdmin) {
      if (!authStore.isAuthenticated) return { name: 'auth.login', query: { redirect: to.fullPath } }
      if (!authStore.isAdmin) return { name: 'home' }
    }

    if (to.meta.requiresAuth) {
      if (!authStore.isAuthenticated) return { name: 'auth.login', query: { redirect: to.fullPath } }
      if (authStore.profile?.is_active === false) return { name: 'home' }
    }

    if (to.meta.guestOnly && authStore.isAuthenticated) {
      return { name: 'home' }
    }
  })
}
