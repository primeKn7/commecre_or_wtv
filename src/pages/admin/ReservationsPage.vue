<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useAdminStore } from '@/stores/adminStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

const adminStore = useAdminStore()
const statusFilter = ref('')
const page = ref(1)
const total = ref(0)

async function load() {
  const res = await adminStore.loadReservations({ status: statusFilter.value, page: page.value })
  if (res) total.value = res.count ?? 0
}

onMounted(load)

const statusOptions = ['', 'pending', 'confirmed', 'active', 'completed', 'cancelled', 'expired']
const statusLabels = {
  '': 'Tous', pending: 'En attente', confirmed: 'Confirmée',
  active: 'En cours', completed: 'Terminée', cancelled: 'Annulée', expired: 'Expirée'
}
const statusBadge = {
  pending: 'badge-reserved', confirmed: 'badge-available', active: 'badge-available',
  completed: 'badge-maintenance', cancelled: 'badge-occupied', expired: 'badge-maintenance'
}

async function updateStatus(id, status) {
  const label = statusLabels[status] || status
  if (!confirm(`Changer le statut en "${label}" ?`)) return
  try {
    await adminStore.updateReservationStatus(id, status)
  } catch (err) {
    alert('Erreur: ' + err.message)
  }
}
</script>

<template>
  <AdminLayout>
    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Reservations</h1>
        <p class="text-gray-500 text-sm">{{ total }} reservations</p>
      </div>
      <select v-model="statusFilter" @change="load" class="input-field w-auto">
        <option v-for="s in statusOptions" :key="s" :value="s">{{ statusLabels[s] }}</option>
      </select>
    </div>

    <div class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b border-gray-100">
            <th class="pb-3 font-medium">N</th>
            <th class="pb-3 font-medium">Client</th>
            <th class="pb-3 font-medium">Place</th>
            <th class="pb-3 font-medium">Debut</th>
            <th class="pb-3 font-medium">Fin</th>
            <th class="pb-3 font-medium">Montant</th>
            <th class="pb-3 font-medium">Statut</th>
            <th class="pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="adminStore.loading">
            <td colspan="8" class="py-8 text-center text-gray-400">Chargement...</td>
          </tr>
          <tr v-else-if="!adminStore.reservations.length">
            <td colspan="8" class="py-8 text-center text-gray-400">Aucune reservation</td>
          </tr>
          <tr v-for="r in adminStore.reservations" :key="r.id" class="hover:bg-gray-50">
            <td class="py-3 font-mono text-xs text-gray-500">{{ r.reservation_number }}</td>
            <td class="py-3">{{ r.profiles?.full_name || '—' }}</td>
            <td class="py-3">{{ r.parking_spots?.name || '—' }}</td>
            <td class="py-3 text-gray-500 text-xs">{{ formatDate(r.start_date_time) }}</td>
            <td class="py-3 text-gray-500 text-xs">{{ formatDate(r.end_date_time) }}</td>
            <td class="py-3 font-semibold text-blue-700">{{ formatCurrency(r.amount) }}</td>
            <td class="py-3"><span :class="statusBadge[r.status] || 'badge-maintenance'">{{ statusLabels[r.status] || r.status }}</span></td>
            <td class="py-3">
              <div class="flex gap-1 flex-wrap">
                <button v-if="r.status === 'pending'" @click="updateStatus(r.id, 'confirmed')" class="text-xs text-green-600 hover:underline">Confirmer</button>
                <button v-if="r.status === 'confirmed'" @click="updateStatus(r.id, 'active')" class="text-xs text-blue-600 hover:underline">Activer</button>
                <button v-if="r.status === 'active'" @click="updateStatus(r.id, 'completed')" class="text-xs text-purple-600 hover:underline">Terminer</button>
                <button v-if="r.status !== 'cancelled' && r.status !== 'completed' && r.status !== 'expired'" @click="updateStatus(r.id, 'cancelled')" class="text-xs text-red-500 hover:underline">Annuler</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AdminLayout>
</template>
