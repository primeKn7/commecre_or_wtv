<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <RouterLink to="/" class="text-white text-3xl font-bold">
          🅿️ AutoPark Manager
        </RouterLink>
      </div>
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <slot />
      </div>
      <p class="text-center text-blue-200 text-sm mt-6">
        © 2026 AutoPark Manager. Tous droits réservés.
      </p>
    </div>
  </div>
</template>
