<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ email: '', password: '' })
const error = ref(null)

async function submit() {
  error.value = null
  try {
    await authStore.login(form)
    const redirect = route.query.redirect || (authStore.isAdmin ? '/admin' : '/')
    router.push(redirect)
  } catch (err) {
    error.value = 'Email ou mot de passe incorrect'
  }
}
</script>

<template>
  <AuthLayout>
    <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Connexion</h2>

    <form @submit.prevent="submit" class="space-y-4">
      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">Email</label>
        <input v-model="form.email" type="email" required class="input-field" placeholder="votre@email.com" />
      </div>
      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">Mot de passe</label>
        <input v-model="form.password" type="password" required class="input-field" placeholder="••••••••" />
      </div>

      <div v-if="error" class="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">{{ error }}</div>

      <button type="submit" :disabled="authStore.loading" class="w-full btn-primary py-3">
        {{ authStore.loading ? 'Connexion...' : 'Se connecter' }}
      </button>
    </form>

    <div class="text-center mt-4 space-y-2">
      <RouterLink to="/forgot-password" class="text-sm text-blue-600 hover:underline block">Mot de passe oublié ?</RouterLink>
      <p class="text-sm text-gray-500">
        Pas encore de compte ?
        <RouterLink to="/register" class="text-blue-600 font-medium hover:underline">S'inscrire</RouterLink>
      </p>
    </div>
  </AuthLayout>
</template>
