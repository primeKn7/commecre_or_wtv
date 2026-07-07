<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const email = ref('')
const sent = ref(false)
const error = ref(null)

async function submit() {
  error.value = null
  try {
    await authStore.forgotPassword(email.value)
    sent.value = true
  } catch (err) {
    error.value = 'Erreur lors de l\'envoi. Vérifiez votre email.'
  }
}
</script>

<template>
  <AuthLayout>
    <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Mot de passe oublié</h2>

    <div v-if="sent" class="text-center py-4">
      <div class="text-5xl mb-3">📧</div>
      <h3 class="font-bold text-gray-900 mb-2">Email envoyé !</h3>
      <p class="text-gray-500 text-sm">Vérifiez votre boîte mail pour réinitialiser votre mot de passe.</p>
      <RouterLink to="/login" class="btn-primary mt-6 inline-block">Retour à la connexion</RouterLink>
    </div>

    <form v-else @submit.prevent="submit" class="space-y-4">
      <p class="text-gray-500 text-sm text-center mb-4">Entrez votre email pour recevoir un lien de réinitialisation</p>

      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">Email</label>
        <input v-model="email" type="email" required class="input-field" placeholder="votre@email.com" />
      </div>

      <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg text-center">{{ error }}</div>

      <button type="submit" :disabled="authStore.loading" class="w-full btn-primary py-3">
        {{ authStore.loading ? 'Envoi...' : 'Envoyer le lien' }}
      </button>
    </form>

    <p class="text-center text-sm text-gray-500 mt-4">
      <RouterLink to="/login" class="text-blue-600 hover:underline">← Retour à la connexion</RouterLink>
    </p>
  </AuthLayout>
</template>
