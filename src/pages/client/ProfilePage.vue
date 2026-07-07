<script setup>
import { reactive, ref, watchEffect } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const form = reactive({ first_name: '', last_name: '', phone: '' })
const success = ref(false)
const error = ref(null)

watchEffect(() => {
  if (authStore.profile) {
    form.first_name = authStore.profile.first_name
    form.last_name = authStore.profile.last_name
    form.phone = authStore.profile.phone || ''
  }
})

async function submit() {
  success.value = false
  error.value = null
  try {
    await authStore.updateProfile(form)
    success.value = true
  } catch (err) {
    error.value = err.message
  }
}
</script>

<template>
  <PublicLayout>
    <div class="max-w-xl mx-auto px-4 py-10">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Mon profil</h1>

      <div class="card mb-6 flex items-center gap-4">
        <div class="w-16 h-16 bg-blue-700 text-white rounded-full flex items-center justify-center text-2xl font-bold">
          {{ authStore.profile?.first_name?.charAt(0) ?? '?' }}
        </div>
        <div>
          <p class="font-bold text-gray-900">{{ authStore.profile?.full_name }}</p>
          <p class="text-sm text-gray-500">{{ authStore.profile?.email }}</p>
          <span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">{{ authStore.profile?.role }}</span>
        </div>
      </div>

      <form @submit.prevent="submit" class="card space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">Prénom</label>
            <input v-model="form.first_name" type="text" class="input-field" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">Nom</label>
            <input v-model="form.last_name" type="text" class="input-field" />
          </div>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Téléphone</label>
          <input v-model="form.phone" type="tel" class="input-field" />
        </div>

        <div v-if="success" class="text-green-600 text-sm bg-green-50 p-3 rounded-lg">✓ Profil mis à jour</div>
        <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{{ error }}</div>

        <button type="submit" :disabled="authStore.loading" class="btn-primary w-full">
          {{ authStore.loading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
        </button>
      </form>
    </div>
  </PublicLayout>
</template>
