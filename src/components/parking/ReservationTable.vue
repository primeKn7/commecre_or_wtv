<script setup>
import { RouterLink } from 'vue-router'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import PaymentStatusBadge from '@/components/common/PaymentStatusBadge.vue'

defineProps({
  reservations: { type: Array, required: true },
  showClient: { type: Boolean, default: false }
})

const statusLabel = {
  pending: 'En attente', confirmed: 'Confirmee', active: 'En cours',
  completed: 'Terminee', cancelled: 'Annulee', expired: 'Expiree'
}
const statusBadge = {
  pending: 'badge-reserved', confirmed: 'badge-available', active: 'badge-available',
  completed: 'badge-maintenance', cancelled: 'badge-occupied', expired: 'badge-maintenance'
}
</script>

<template>
  <!-- Desktop table -->
  <div class="hidden md:block overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-gray-500 border-b border-gray-100">
          <th class="pb-3 font-medium">N°</th>
          <th v-if="showClient" class="pb-3 font-medium">Client</th>
          <th class="pb-3 font-medium">Place</th>
          <th class="pb-3 font-medium">Debut</th>
          <th class="pb-3 font-medium">Fin</th>
          <th class="pb-3 font-medium">Montant</th>
          <th class="pb-3 font-medium">Statut</th>
          <th class="pb-3 font-medium">Paiement</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        <tr v-for="r in reservations" :key="r.id" class="hover:bg-gray-50">
          <td class="py-3 font-mono text-xs">
            <RouterLink :to="`/my-reservations/${r.id}`" class="text-blue-600 hover:underline">{{ r.reservation_number }}</RouterLink>
          </td>
          <td v-if="showClient" class="py-3">{{ r.profiles?.full_name || '—' }}</td>
          <td class="py-3 font-medium">{{ r.parking_spots?.name || '—' }}</td>
          <td class="py-3 text-gray-500 text-xs">{{ formatDate(r.start_date_time) }}</td>
          <td class="py-3 text-gray-500 text-xs">{{ formatDate(r.end_date_time) }}</td>
          <td class="py-3 font-bold text-blue-700">{{ formatCurrency(r.amount) }}</td>
          <td class="py-3"><span :class="statusBadge[r.status]">{{ statusLabel[r.status] }}</span></td>
          <td class="py-3"><PaymentStatusBadge :status="r.payment_status" /></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Mobile cards -->
  <div class="md:hidden space-y-3">
    <RouterLink v-for="r in reservations" :key="r.id" :to="`/my-reservations/${r.id}`" class="card block">
      <div class="flex items-center justify-between mb-2">
        <span class="font-mono text-xs text-blue-600">{{ r.reservation_number }}</span>
        <span :class="statusBadge[r.status]">{{ statusLabel[r.status] }}</span>
      </div>
      <p class="font-medium text-gray-900">{{ r.parking_spots?.name || '—' }}</p>
      <p v-if="showClient" class="text-sm text-gray-500">{{ r.profiles?.full_name }}</p>
      <div class="flex justify-between mt-2 text-sm">
        <span class="text-gray-400">{{ formatDate(r.start_date_time) }}</span>
        <span class="font-bold text-blue-700">{{ formatCurrency(r.amount) }}</span>
      </div>
    </RouterLink>
  </div>
</template>
