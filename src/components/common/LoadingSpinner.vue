<script setup>
defineProps({
  size: { type: String, default: 'md' },
  text: { type: String, default: '' }
})
const sizeClass = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-8">
    <div :class="[sizeClass[size], 'border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin']" />
    <p v-if="text" class="text-sm text-gray-500">{{ text }}</p>
  </div>
</template>
