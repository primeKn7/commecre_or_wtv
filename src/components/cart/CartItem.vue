<script setup>
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

defineProps({
  item: { type: Object, required: true }
})
defineEmits(['remove'])
</script>

<template>
  <div class="card flex gap-4">
    <img
      :src="item.spotImage || 'https://placehold.co/100x100/e2e8f0/64748b?text=P'"
      :alt="item.spotName"
      class="w-20 h-20 rounded-lg object-cover shrink-0"
    />
    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-2">
        <div>
          <h3 class="font-bold text-gray-900">{{ item.spotName }}</h3>
          <p v-if="item.categoryName" class="text-xs text-blue-600">{{ item.categoryName }}</p>
        </div>
        <button @click="$emit('remove', item.id)" class="text-red-400 hover:text-red-600 text-lg shrink-0">&times;</button>
      </div>
      <div class="text-xs text-gray-500 mt-1 space-y-0.5">
        <p>Du {{ formatDate(item.startDateTime) }}</p>
        <p>Au {{ formatDate(item.endDateTime) }}</p>
        <p>Duree : {{ item.durationHours.toFixed(1) }}h</p>
      </div>
      <div class="mt-2 flex justify-between items-center">
        <span class="text-xs text-gray-400">{{ formatCurrency(item.unitPrice) }}/h</span>
        <span class="font-bold text-blue-700">{{ formatCurrency(item.totalPrice) }}</span>
      </div>
    </div>
  </div>
</template>
