<script setup>
import { onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useAdminStore } from '@/stores/adminStore'
import { formatDate } from '@/utils/formatDate'

const adminStore = useAdminStore()

onMounted(() => adminStore.loadUsers())

async function toggleRole(user) {
  const newRole = user.role === 'admin' ? 'client' : 'admin'
  if (!confirm(`Changer le rôle de ${user.full_name} en "${newRole}" ?`)) return
  await adminStore.updateUserRole(user.id, newRole)
}

async function toggleActive(user) {
  await adminStore.toggleUserActive(user.id, !user.is_active)
}
</script>

<template>
  <AdminLayout>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Utilisateurs</h1>
    </div>

    <div class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b border-gray-100">
            <th class="pb-3 font-medium">Nom</th>
            <th class="pb-3 font-medium">Email</th>
            <th class="pb-3 font-medium">Téléphone</th>
            <th class="pb-3 font-medium">Rôle</th>
            <th class="pb-3 font-medium">Statut</th>
            <th class="pb-3 font-medium">Inscrit le</th>
            <th class="pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="adminStore.loading">
            <td colspan="7" class="py-8 text-center text-gray-400">Chargement...</td>
          </tr>
          <tr v-for="user in adminStore.users" :key="user.id" class="hover:bg-gray-50">
            <td class="py-3 font-medium text-gray-900">{{ user.full_name }}</td>
            <td class="py-3 text-gray-600">{{ user.email }}</td>
            <td class="py-3 text-gray-500">{{ user.phone ?? '—' }}</td>
            <td class="py-3">
              <span :class="user.role === 'admin' ? 'badge-reserved' : 'badge-available'">{{ user.role }}</span>
            </td>
            <td class="py-3">
              <span :class="user.is_active ? 'badge-available' : 'badge-occupied'">{{ user.is_active ? 'Actif' : 'Inactif' }}</span>
            </td>
            <td class="py-3 text-gray-400 text-xs">{{ formatDate(user.created_at) }}</td>
            <td class="py-3">
              <div class="flex gap-2">
                <button @click="toggleRole(user)" class="text-blue-600 hover:underline text-xs">Rôle</button>
                <button @click="toggleActive(user)" :class="[user.is_active ? 'text-red-500' : 'text-green-600', 'hover:underline text-xs']">
                  {{ user.is_active ? 'Désactiver' : 'Activer' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AdminLayout>
</template>
