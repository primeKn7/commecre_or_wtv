<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { useReservationStore } from '@/stores/reservationStore'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

const reservationStore = useReservationStore()
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.user?.id) {
    reservationStore.loadMyReservations(authStore.user.id)
  }
})

const statusBadge = {
  pending: 'badge-reserved',
  confirmed: 'badge-available',
  active: 'badge-available',
  completed: 'badge-maintenance',
  cancelled: 'badge-occupied',
  expired: 'badge-maintenance'
}

const statusLabel = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  active: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
  expired: 'Expirée'
}

async function cancel(id) {
  if (!confirm('Annuler cette réservation ?')) return
  await reservationStore.cancelReservation(id)
}
</script>

<template>
  <PublicLayout>
    <div class="max-w-4xl mx-auto px-4 py-10">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Mes réservations</h1>

      <div v-if="reservationStore.loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="card animate-pulse h-24" />
      </div>

      <div v-else-if="!reservationStore.myReservations.length" class="text-center py-20">
        <div class="text-6xl mb-4">📅</div>
        <h2 class="text-xl font-semibold text-gray-700 mb-2">Aucune réservation</h2>
        <RouterLink to="/parking" class="btn-primary mt-4 inline-block">Réserver une place</RouterLink>
      </div>

      <div v-else class="space-y-4">
        <div v-for="r in reservationStore.myReservations" :key="r.id" class="card">
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-1">
                <h3 class="font-bold text-gray-900">{{ r.parking_spots?.name }}</h3>
                <span :class="statusBadge[r.status]">{{ statusLabel[r.status] }}</span>
              </div>
              <p class="text-sm text-gray-500">N° {{ r.reservation_number }}</p>
              <p class="text-sm text-gray-600 mt-1">
                {{ formatDate(r.start_date_time) }} → {{ formatDate(r.end_date_time) }}
              </p>
            </div>
            <div class="text-right">
              <p class="font-bold text-blue-700 text-lg">{{ formatCurrency(r.amount) }}</p>
              <RouterLink :to="`/my-reservations/${r.id}`" class="text-sm text-blue-600 hover:underline block mt-1">Voir détails</RouterLink>
              <button
                v-if="r.status === 'pending' || r.status === 'confirmed'"
                @click="cancel(r.id)"
                class="text-sm text-red-500 hover:underline mt-1 block"
              >Annuler</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
