<script setup>
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useAdminStore } from '@/stores/adminStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

const adminStore = useAdminStore()

onMounted(() => {
  adminStore.loadDashboardStats()
  adminStore.loadReservations({ page: 1, perPage: 5 })
  adminStore.subscribeRealtime()
})

onUnmounted(() => {
  adminStore.unsubscribeRealtime()
})

const statCards = [
  { key: 'total_reservations', label: 'Reservations totales', icon: '📅', color: 'bg-blue-50 text-blue-700' },
  { key: 'today_reservations', label: "Reservations aujourd'hui", icon: '🗓️', color: 'bg-amber-50 text-amber-600' },
  { key: 'today_revenue', label: "Revenus du jour", icon: '💰', currency: true, color: 'bg-green-50 text-green-600' },
  { key: 'month_revenue', label: 'Revenus du mois', icon: '📈', currency: true, color: 'bg-purple-50 text-purple-600' },
  { key: 'total_clients', label: 'Clients', icon: '👥', color: 'bg-pink-50 text-pink-600' },
  { key: 'available_spots', label: 'Places disponibles', icon: '🟢', color: 'bg-teal-50 text-teal-600' },
  { key: 'occupied_spots', label: 'Places occupees', icon: '🔴', color: 'bg-red-50 text-red-600' },
  { key: 'new_messages', label: 'Nouveaux messages', icon: '✉️', color: 'bg-indigo-50 text-indigo-600' },
]

const statusLabels = {
  pending: 'En attente', confirmed: 'Confirmee', active: 'En cours',
  completed: 'Terminee', cancelled: 'Annulee', expired: 'Expiree'
}
const statusBadge = {
  pending: 'badge-reserved', confirmed: 'badge-available', active: 'badge-available',
  completed: 'badge-maintenance', cancelled: 'badge-occupied', expired: 'badge-maintenance'
}
</script>

<template>
  <AdminLayout>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-500 text-sm mt-1">Vue d'ensemble en temps reel</p>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in statCards" :key="stat.key" :class="['card', stat.color]">
        <div class="text-3xl mb-2">{{ stat.icon }}</div>
        <div class="text-2xl font-black">
          <template v-if="!adminStore.stats">—</template>
          <template v-else-if="stat.currency">{{ formatCurrency(adminStore.stats?.[stat.key] ?? 0) }}</template>
          <template v-else>{{ adminStore.stats?.[stat.key] ?? 0 }}</template>
        </div>
        <p class="text-sm font-medium mt-1 opacity-80">{{ stat.label }}</p>
      </div>
    </div>

    <!-- Dernieres reservations -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-bold text-gray-900">Dernieres reservations</h2>
        <RouterLink to="/admin/reservations" class="text-sm text-blue-600 hover:underline">Tout voir →</RouterLink>
      </div>

      <div v-if="!adminStore.reservations.length && !adminStore.loading" class="text-center py-8 text-gray-400 text-sm">Aucune reservation</div>
      <div v-else-if="adminStore.loading" class="text-center py-8 text-gray-400 text-sm">Chargement...</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500 border-b border-gray-100">
              <th class="pb-3 font-medium">N</th>
              <th class="pb-3 font-medium">Client</th>
              <th class="pb-3 font-medium">Place</th>
              <th class="pb-3 font-medium">Montant</th>
              <th class="pb-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="r in adminStore.reservations.slice(0, 5)" :key="r.id" class="hover:bg-gray-50">
              <td class="py-3 font-mono text-xs text-gray-500">{{ r.reservation_number }}</td>
              <td class="py-3">{{ r.profiles?.full_name || '—' }}</td>
              <td class="py-3">{{ r.parking_spots?.name || '—' }}</td>
              <td class="py-3 font-semibold text-blue-700">{{ formatCurrency(r.amount) }}</td>
              <td class="py-3"><span :class="statusBadge[r.status] || 'badge-maintenance'">{{ statusLabels[r.status] || r.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>
