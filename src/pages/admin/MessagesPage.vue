<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useAdminStore } from '@/stores/adminStore'
import { formatDate } from '@/utils/formatDate'

const adminStore = useAdminStore()
const statusFilter = ref('')

async function load() {
  await adminStore.loadMessages({ status: statusFilter.value || undefined })
}

onMounted(load)

async function deleteMessage(id) {
  if (!confirm('Supprimer ce message ?')) return
  await adminStore.deleteMessage(id)
}

const statusLabel = { new: 'Nouveau', read: 'Lu', resolved: 'Resolu' }
const statusBadge = { new: 'badge-reserved', read: 'badge-available', resolved: 'badge-maintenance' }
</script>

<template>
  <AdminLayout>
    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <h1 class="text-2xl font-bold text-gray-900">Messages de contact</h1>
      <select v-model="statusFilter" @change="load" class="input-field w-auto">
        <option value="">Tous</option>
        <option value="new">Nouveaux</option>
        <option value="read">Lus</option>
        <option value="resolved">Resolus</option>
      </select>
    </div>

    <div class="space-y-4">
      <div v-if="adminStore.loading" class="card animate-pulse h-24" />

      <div v-else-if="!adminStore.messages.length" class="text-center py-20 text-gray-400">
        <div class="text-5xl mb-3">✉️</div>
        <p>Aucun message</p>
      </div>

      <div v-for="msg in adminStore.messages" :key="msg.id" class="card">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-1">
              <h3 class="font-bold text-gray-900">{{ msg.full_name }}</h3>
              <span :class="statusBadge[msg.status]">{{ statusLabel[msg.status] }}</span>
            </div>
            <p class="text-sm text-gray-500">{{ msg.email }} · {{ msg.phone }}</p>
            <p class="font-medium text-gray-800 mt-2">{{ msg.subject }}</p>
            <p class="text-gray-600 text-sm mt-1">{{ msg.message }}</p>
            <p class="text-xs text-gray-400 mt-2">{{ formatDate(msg.created_at) }}</p>
          </div>
          <div class="flex flex-col gap-1">
            <button v-if="msg.status === 'new'" @click="adminStore.updateMessageStatus(msg.id, 'read')" class="text-xs text-blue-600 hover:underline">Marquer lu</button>
            <button v-if="msg.status !== 'resolved'" @click="adminStore.updateMessageStatus(msg.id, 'resolved')" class="text-xs text-green-600 hover:underline">Resolu</button>
            <button @click="deleteMessage(msg.id)" class="text-xs text-red-500 hover:underline">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
