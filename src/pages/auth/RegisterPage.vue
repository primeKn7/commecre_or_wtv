<script setup>
import { reactive, ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' })
const error = ref(null)

const passwordMismatch = computed(() => form.confirmPassword && form.password !== form.confirmPassword)

async function submit() {
  if (passwordMismatch.value) return
  error.value = null
  try {
    await authStore.register(form)
    router.push('/')
  } catch (err) {
    error.value = err.message || 'Erreur lors de l\'inscription'
  }
}
</script>

<template>
  <AuthLayout>
    <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Créer un compte</h2>

    <form @submit.prevent="submit" class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Prénom *</label>
          <input v-model="form.firstName" type="text" required class="input-field" placeholder="Jean" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Nom *</label>
          <input v-model="form.lastName" type="text" required class="input-field" placeholder="Dupont" />
        </div>
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">Email *</label>
        <input v-model="form.email" type="email" required class="input-field" />
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">Téléphone</label>
        <input v-model="form.phone" type="tel" class="input-field" placeholder="+225 07 00 00 00" />
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">Mot de passe *</label>
        <input v-model="form.password" type="password" required minlength="8" class="input-field" placeholder="Min. 8 caractères" />
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">Confirmer le mot de passe *</label>
        <input v-model="form.confirmPassword" type="password" required class="input-field" :class="{ 'border-red-400': passwordMismatch }" />
        <p v-if="passwordMismatch" class="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</p>
      </div>

      <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg text-center">{{ error }}</div>

      <button type="submit" :disabled="authStore.loading || passwordMismatch" class="w-full btn-primary py-3">
        {{ authStore.loading ? 'Inscription...' : 'Créer mon compte' }}
      </button>
    </form>

    <p class="text-center text-sm text-gray-500 mt-4">
      Déjà un compte ?
      <RouterLink to="/login" class="text-blue-600 font-medium hover:underline">Se connecter</RouterLink>
    </p>
  </AuthLayout>
</template>
