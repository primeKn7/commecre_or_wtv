<script setup>
defineProps({
  icon: { type: String, default: '📭' },
  title: { type: String, default: 'Aucune donnee' },
  description: { type: String, default: '' }
})
</script>

<template>
  <div class="text-center py-16">
    <div class="text-5xl mb-4">{{ icon }}</div>
    <h3 class="text-lg font-semibold text-gray-700 mb-1">{{ title }}</h3>
    <p v-if="description" class="text-sm text-gray-400">{{ description }}</p>
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>
