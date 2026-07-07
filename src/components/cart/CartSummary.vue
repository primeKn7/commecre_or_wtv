<script setup>
import { formatCurrency } from '@/utils/formatCurrency'

defineProps({
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  itemCount: { type: Number, required: true },
  loading: { type: Boolean, default: false }
})
defineEmits(['checkout'])
</script>

<template>
  <div class="card">
    <h3 class="font-bold text-gray-900 mb-4">Resume</h3>
    <div class="space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-gray-500">{{ itemCount }} place(s)</span>
        <span>{{ formatCurrency(subtotal) }}</span>
      </div>
      <div v-if="discount > 0" class="flex justify-between text-green-600">
        <span>Reduction</span>
        <span>-{{ formatCurrency(discount) }}</span>
      </div>
      <hr />
      <div class="flex justify-between text-base font-bold">
        <span>Total</span>
        <span class="text-blue-700">{{ formatCurrency(total) }}</span>
      </div>
    </div>
    <button
      @click="$emit('checkout')"
      :disabled="loading || itemCount === 0"
      class="btn-primary w-full mt-4"
    >
      {{ loading ? 'Traitement...' : 'Payer maintenant' }}
    </button>
  </div>
</template>
