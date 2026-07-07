import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabaseClient'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const authReady = ref(false)
  let initPromise = null

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')
  const isClient = computed(() => profile.value?.role === 'client')

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    profile.value = data
  }

  async function init() {
    if (initPromise) return initPromise

    initPromise = (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          user.value = session.user
          await fetchProfile(session.user.id)
        }

        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'INITIAL_SESSION') return
          user.value = session?.user ?? null
          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            profile.value = null
          }
        })
      } finally {
        authReady.value = true
      }
    })()

    return initPromise
  }

  async function register({ firstName, lastName, email, phone, password }) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, phone }
        }
      })
      if (err) throw err

      // Mettre à jour le profil avec le téléphone
      if (data.user) {
        await supabase.from('profiles').update({ phone }).eq('id', data.user.id)
      }
      if (data.session) {
        user.value = data.user
        await fetchProfile(data.user.id)
      }
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login({ email, password }) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      user.value = data.user
      await fetchProfile(data.user.id)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  async function forgotPassword(email) {
    loading.value = true
    error.value = null
    try {
      const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/reset-password`
      })
      if (err) throw err
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(password) {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) throw err
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(updates) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.value.id)
        .select()
        .single()
      if (err) throw err
      profile.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function canAccess(role) {
    if (!isAuthenticated.value) return false
    if (role === 'admin') return isAdmin.value
    if (role === 'client') return isAuthenticated.value
    return true
  }

  return {
    user, profile, loading, error, authReady,
    isAuthenticated, isAdmin, isClient,
    init, register, login, logout, forgotPassword, resetPassword, updateProfile, canAccess
  }
})
