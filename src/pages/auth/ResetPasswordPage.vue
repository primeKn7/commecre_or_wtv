<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/services/supabaseClient'

const authStore = useAuthStore()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const error = ref(null)
const success = ref(false)
const sessionReady = ref(false)

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    sessionReady.value = true
    return
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' || session) {
      sessionReady.value = true
    }
  })

  setTimeout(() => subscription.unsubscribe(), 10000)
})

async function submit() {
  error.value = null
  if (password.value.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  try {
    await authStore.resetPassword(password.value)
    success.value = true
    setTimeout(() => router.push('/login'), 2000)
  } catch (err) {
    error.value = err.message || 'Impossible de réinitialiser le mot de passe'
  }
}
</script>

<template>
  <AuthLayout>
    <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Nouveau mot de passe</h2>

    <div v-if="success" class="text-center py-4">
      <div class="text-5xl mb-3">✅</div>
      <h3 class="font-bold text-gray-900 mb-2">Mot de passe mis à jour !</h3>
      <p class="text-gray-500 text-sm">Redirection vers la connexion...</p>
    </div>

    <div v-else-if="!sessionReady" class="text-center py-4">
      <p class="text-gray-500 text-sm mb-4">Lien invalide ou expiré.</p>
      <RouterLink to="/forgot-password" class="btn-primary inline-block">Demander un nouveau lien</RouterLink>
    </div>

    <form v-else @submit.prevent="submit" class="space-y-4">
      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">Nouveau mot de passe</label>
        <input v-model="password" type="password" required minlength="8" class="input-field" placeholder="Min. 8 caractères" />
      </div>
      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">Confirmer le mot de passe</label>
        <input v-model="confirmPassword" type="password" required class="input-field" />
      </div>

      <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg text-center">{{ error }}</div>

      <button type="submit" :disabled="authStore.loading" class="w-full btn-primary py-3">
        {{ authStore.loading ? 'Mise à jour...' : 'Enregistrer le mot de passe' }}
      </button>
    </form>
  </AuthLayout>
</template>
