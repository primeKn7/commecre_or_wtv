<script setup>
import { onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { useReservationStore } from '@/stores/reservationStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

const route = useRoute()
const reservationStore = useReservationStore()

onMounted(() => {
  reservationStore.loadReservation(route.params.id)
})

const statusLabel = {
  pending: 'En attente', confirmed: 'Confirmee', active: 'En cours',
  completed: 'Terminee', cancelled: 'Annulee', expired: 'Expiree'
}
const statusBadge = {
  pending: 'badge-reserved', confirmed: 'badge-available', active: 'badge-available',
  completed: 'badge-maintenance', cancelled: 'badge-occupied', expired: 'badge-maintenance'
}

const paymentLabel = {
  pending: 'En attente', success: 'Paye', failed: 'Echoue', refunded: 'Rembourse'
}

async function cancel() {
  if (!confirm('Annuler cette reservation ?')) return
  try {
    await reservationStore.cancelReservation(reservationStore.currentReservation.id)
    await reservationStore.loadReservation(route.params.id)
  } catch (err) {
    alert(err.message)
  }
}
</script>

<template>
  <PublicLayout>
    <div class="max-w-2xl mx-auto px-4 py-10">
      <RouterLink to="/my-reservations" class="text-blue-600 text-sm hover:underline mb-6 block">← Retour aux reservations</RouterLink>

      <div v-if="reservationStore.loading" class="card animate-pulse h-64" />

      <div v-else-if="reservationStore.currentReservation" class="space-y-6">
        <div class="card">
          <div class="border-b border-gray-100 pb-4 mb-4">
            <div class="flex items-center justify-between">
              <h1 class="text-2xl font-bold text-gray-900">Reservation {{ reservationStore.currentReservation.reservation_number }}</h1>
              <span :class="statusBadge[reservationStore.currentReservation.status]">
                {{ statusLabel[reservationStore.currentReservation.status] }}
              </span>
            </div>
            <p class="text-sm text-gray-500 mt-1">Creee le {{ formatDate(reservationStore.currentReservation.created_at) }}</p>
          </div>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Place</span>
              <span class="font-medium">{{ reservationStore.currentReservation.parking_spots?.name }}</span>
            </div>
            <div v-if="reservationStore.currentReservation.parking_spots?.code" class="flex justify-between">
              <span class="text-gray-500">Code</span>
              <span class="font-mono text-gray-600">{{ reservationStore.currentReservation.parking_spots.code }}</span>
            </div>
            <div v-if="reservationStore.currentReservation.parking_spots?.parking_categories?.name" class="flex justify-between">
              <span class="text-gray-500">Categorie</span>
              <span class="font-medium">{{ reservationStore.currentReservation.parking_spots.parking_categories.name }}</span>
            </div>
            <hr />
            <div class="flex justify-between">
              <span class="text-gray-500">Arrivee</span>
              <span class="font-medium">{{ formatDate(reservationStore.currentReservation.start_date_time) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Depart</span>
              <span class="font-medium">{{ formatDate(reservationStore.currentReservation.end_date_time) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Duree</span>
              <span class="font-medium">{{ reservationStore.currentReservation.duration_hours?.toFixed(1) }}h</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Paiement</span>
              <span class="font-medium">{{ paymentLabel[reservationStore.currentReservation.payment_status] || reservationStore.currentReservation.payment_status }}</span>
            </div>
            <hr />
            <div class="flex justify-between text-base font-bold">
              <span>Total</span>
              <span class="text-blue-700">{{ formatCurrency(reservationStore.currentReservation.amount) }}</span>
            </div>
          </div>
        </div>

        <button
          v-if="reservationStore.currentReservation.status === 'pending' || reservationStore.currentReservation.status === 'confirmed'"
          @click="cancel"
          :disabled="reservationStore.loading"
          class="w-full btn-danger py-3"
        >
          Annuler cette reservation
        </button>
      </div>

      <div v-else class="text-center py-20">
        <div class="text-6xl mb-4">😕</div>
        <h2 class="text-xl font-semibold text-gray-700 mb-2">Reservation introuvable</h2>
        <RouterLink to="/my-reservations" class="btn-primary mt-4 inline-block">Mes reservations</RouterLink>
      </div>
    </div>
  </PublicLayout>
</template>
