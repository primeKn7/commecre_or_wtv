<script setup>
import { RouterLink } from 'vue-router'
import { formatCurrency } from '@/utils/formatCurrency'

defineProps({
  spot: { type: Object, required: true }
})

const statusBadge = {
  available: 'badge-available', occupied: 'badge-occupied',
  reserved: 'badge-reserved', maintenance: 'badge-maintenance'
}
const statusLabel = {
  available: 'Disponible', occupied: 'Occupe',
  reserved: 'Reserve', maintenance: 'Maintenance'
}
</script>

<template>
  <RouterLink :to="`/parking/${spot.slug}`" class="card group hover:shadow-lg transition-shadow duration-300 block">
    <div class="relative overflow-hidden rounded-lg mb-3">
      <img
        :src="spot.main_image_url || 'https://placehold.co/400x250/e2e8f0/64748b?text=Parking'"
        :alt="spot.name"
        class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <span v-if="spot.is_featured" class="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded font-medium">
        En vedette
      </span>
      <span :class="[statusBadge[spot.status], 'absolute top-2 right-2']">
        {{ statusLabel[spot.status] }}
      </span>
    </div>

    <div class="flex items-start justify-between gap-2 mb-1">
      <h3 class="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{{ spot.name }}</h3>
      <span class="text-xs text-gray-400 font-mono">{{ spot.code }}</span>
    </div>

    <p v-if="spot.parking_categories?.name" class="text-xs text-blue-600 font-medium mb-2">{{ spot.parking_categories.name }}</p>

    <p v-if="spot.description" class="text-sm text-gray-500 line-clamp-2 mb-3">{{ spot.description }}</p>

    <div class="flex items-end justify-between mt-auto">
      <div>
        <span class="text-lg font-bold text-blue-700">{{ formatCurrency(spot.hourly_price) }}</span>
        <span class="text-xs text-gray-400">/heure</span>
      </div>
      <span class="text-xs text-blue-600 font-medium group-hover:underline">Voir details →</span>
    </div>
  </RouterLink>
</template>
