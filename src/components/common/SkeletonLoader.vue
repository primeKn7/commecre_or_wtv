<script setup>
defineProps({
  type: { type: String, default: 'card' },
  count: { type: Number, default: 1 }
})
</script>

<template>
  <template v-if="type === 'card'">
    <div v-for="n in count" :key="n" class="card animate-pulse">
      <div class="bg-gray-200 rounded-lg h-40 mb-4" />
      <div class="bg-gray-200 rounded h-4 w-3/4 mb-2" />
      <div class="bg-gray-200 rounded h-4 w-1/2 mb-3" />
      <div class="bg-gray-200 rounded h-8 w-1/3" />
    </div>
  </template>

  <template v-else-if="type === 'table'">
    <div v-for="n in count" :key="n" class="flex gap-4 py-3 animate-pulse">
      <div class="bg-gray-200 rounded h-4 flex-1" />
      <div class="bg-gray-200 rounded h-4 flex-1" />
      <div class="bg-gray-200 rounded h-4 w-24" />
    </div>
  </template>

  <template v-else>
    <div v-for="n in count" :key="n" class="animate-pulse">
      <div class="bg-gray-200 rounded h-4 w-full mb-2" />
    </div>
  </template>
</template>
