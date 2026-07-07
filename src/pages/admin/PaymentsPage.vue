<script setup>
import { onMounted, ref } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useAdminStore } from '@/stores/adminStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

const adminStore = useAdminStore()
const total = ref(0)

onMounted(async () => {
  const res = await adminStore.loadPayments()
  if (res) total.value = res.count ?? 0
})

const statusBadge = { pending: 'badge-reserved', success: 'badge-available', failed: 'badge-occupied', refunded: 'badge-maintenance' }
const statusLabel = { pending: 'En attente', success: 'Reussi', failed: 'Echoue', refunded: 'Rembourse' }
</script>

<template>
  <AdminLayout>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Paiements</h1>
      <p class="text-gray-500 text-sm">{{ total }} transactions</p>
    </div>

    <div class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b border-gray-100">
            <th class="pb-3 font-medium">Date</th>
            <th class="pb-3 font-medium">Client</th>
            <th class="pb-3 font-medium">Reservation</th>
            <th class="pb-3 font-medium">Provider</th>
            <th class="pb-3 font-medium">Montant</th>
            <th class="pb-3 font-medium">Statut</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="adminStore.loading">
            <td colspan="6" class="py-8 text-center text-gray-400">Chargement...</td>
          </tr>
          <tr v-else-if="!adminStore.payments.length">
            <td colspan="6" class="py-8 text-center text-gray-400">Aucun paiement</td>
          </tr>
          <tr v-for="p in adminStore.payments" :key="p.id" class="hover:bg-gray-50">
            <td class="py-3 text-gray-500 text-xs">{{ formatDate(p.created_at) }}</td>
            <td class="py-3">{{ p.profiles?.full_name || '—' }}</td>
            <td class="py-3 font-mono text-xs text-gray-600">{{ p.reservations?.reservation_number || '—' }}</td>
            <td class="py-3 text-gray-500">{{ p.provider }}</td>
            <td class="py-3 font-bold text-blue-700">{{ formatCurrency(p.amount) }}</td>
            <td class="py-3"><span :class="statusBadge[p.status]">{{ statusLabel[p.status] || p.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </AdminLayout>
</template>
