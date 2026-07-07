import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const user = computed(() => authStore.user)
  const profile = computed(() => authStore.profile)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isAdmin = computed(() => authStore.isAdmin)
  const loading = computed(() => authStore.loading)
  const error = computed(() => authStore.error)

  async function login(credentials) {
    const data = await authStore.login(credentials)
    const redirect = router.currentRoute.value.query.redirect
    router.push(redirect || (authStore.isAdmin ? '/admin' : '/'))
    return data
  }

  async function register(userData) {
    const data = await authStore.register(userData)
    router.push('/login')
    return data
  }

  async function logout() {
    await authStore.logout()
    router.push('/')
  }

  function requireAuth() {
    if (!isAuthenticated.value) {
      router.push({ name: 'auth.login', query: { redirect: router.currentRoute.value.fullPath } })
      return false
    }
    return true
  }

  return {
    user, profile, isAuthenticated, isAdmin, loading, error,
    login, register, logout, requireAuth
  }
}
