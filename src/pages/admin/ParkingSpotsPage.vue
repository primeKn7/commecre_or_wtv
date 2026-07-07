<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { parkingService } from '@/services/parkingService'
import { formatCurrency } from '@/utils/formatCurrency'

const spots = ref([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)

async function load() {
  loading.value = true
  try {
    const res = await parkingService.adminGetSpots({ page: page.value })
    spots.value = res.data
    total.value = res.count
  } finally {
    loading.value = false
  }
}

async function deleteSpot(id) {
  if (!confirm('Supprimer cette place ?')) return
  await parkingService.deleteSpot(id)
  await load()
}

async function changeStatus(id, status) {
  try {
    await parkingService.updateSpot(id, { status })
    await load()
  } catch (err) {
    alert('Erreur: ' + err.message)
  }
}

onMounted(load)

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
  <AdminLayout>
    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Places de parking</h1>
        <p class="text-gray-500 text-sm">{{ total }} places au total</p>
      </div>
      <RouterLink to="/admin/parking-spots/new" class="btn-primary">+ Ajouter une place</RouterLink>
    </div>

    <div class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b border-gray-100">
            <th class="pb-3 font-medium">Nom</th>
            <th class="pb-3 font-medium">Code</th>
            <th class="pb-3 font-medium">Categorie</th>
            <th class="pb-3 font-medium">Prix/h</th>
            <th class="pb-3 font-medium">Prix/j</th>
            <th class="pb-3 font-medium">Statut</th>
            <th class="pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="loading">
            <td colspan="7" class="py-8 text-center text-gray-400">Chargement...</td>
          </tr>
          <tr v-else-if="!spots.length">
            <td colspan="7" class="py-8 text-center text-gray-400">Aucune place</td>
          </tr>
          <tr v-for="spot in spots" :key="spot.id" class="hover:bg-gray-50">
            <td class="py-3 font-medium text-gray-900">
              <div class="flex items-center gap-2">
                <img v-if="spot.main_image_url" :src="spot.main_image_url" class="w-8 h-8 rounded object-cover" />
                <span>{{ spot.name }}</span>
              </div>
            </td>
            <td class="py-3 font-mono text-xs text-gray-500">{{ spot.code }}</td>
            <td class="py-3 text-gray-600">{{ spot.parking_categories?.name }}</td>
            <td class="py-3 font-semibold">{{ formatCurrency(spot.hourly_price) }}</td>
            <td class="py-3 text-gray-500">{{ formatCurrency(spot.daily_price) }}</td>
            <td class="py-3">
              <select
                :value="spot.status"
                @change="changeStatus(spot.id, $event.target.value)"
                class="text-xs border border-gray-200 rounded px-2 py-1"
              >
                <option value="available">Disponible</option>
                <option value="occupied">Occupe</option>
                <option value="reserved">Reserve</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </td>
            <td class="py-3">
              <div class="flex gap-2">
                <RouterLink :to="`/admin/parking-spots/${spot.id}/edit`" class="text-blue-600 hover:underline text-xs">Modifier</RouterLink>
                <button @click="deleteSpot(spot.id)" class="text-red-500 hover:underline text-xs">Supprimer</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="Math.ceil(total / 20) > 1" class="flex justify-center gap-2 mt-6">
      <button
        v-for="p in Math.ceil(total / 20)"
        :key="p"
        @click="page = p; load()"
        :class="['w-10 h-10 rounded-lg font-medium text-sm transition-colors',
          page === p ? 'bg-blue-700 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50']"
      >{{ p }}</button>
    </div>
  </AdminLayout>
</template>
