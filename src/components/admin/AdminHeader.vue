<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

defineEmits(['toggle-sidebar'])
const authStore = useAuthStore()
const router = useRouter()

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
    <button @click="$emit('toggle-sidebar')" class="md:hidden p-2 text-gray-600 hover:text-gray-900">
      ☰
    </button>

    <div class="flex-1" />

    <div class="flex items-center gap-4">
      <span class="text-sm text-gray-600">
        {{ authStore.profile?.full_name }}
      </span>
      <button @click="logout" class="text-sm text-red-600 hover:text-red-700 font-medium transition-colors">
        Déconnexion
      </button>
    </div>
  </header>
</template>
