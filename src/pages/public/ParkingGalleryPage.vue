<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { useParkingStore } from '@/stores/parkingStore'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/utils/formatCurrency'

const parkingStore = useParkingStore()
const cartStore = useCartStore()
const route = useRoute()

onMounted(async () => {
  await parkingStore.loadCategories()
  if (route.query.category) {
    parkingStore.setFilter('categorySlug', route.query.category)
  } else {
    await parkingStore.loadSpots()
  }
  parkingStore.subscribeRealtime()
})

onUnmounted(() => {
  parkingStore.unsubscribeRealtime()
})

const statusBadge = {
  available: 'badge-available',
  occupied: 'badge-occupied',
  reserved: 'badge-reserved',
  maintenance: 'badge-maintenance'
}

const statusLabel = {
  available: 'Disponible',
  occupied: 'Occupé',
  reserved: 'Réservé',
  maintenance: 'Maintenance'
}
</script>

<template>
  <PublicLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Nos places de parking</h1>
      <p class="text-gray-500 mb-8">{{ parkingStore.totalCount }} places disponibles</p>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Filtres -->
        <aside class="lg:w-64 shrink-0 space-y-6">
          <div class="card">
            <h3 class="font-semibold text-gray-900 mb-3">Catégorie</h3>
            <div class="space-y-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="cat" :value="''" :checked="!parkingStore.filters.categorySlug" @change="parkingStore.setFilter('categorySlug', '')" class="accent-blue-700" />
                <span class="text-sm">Toutes</span>
              </label>
              <label v-for="cat in parkingStore.categories" :key="cat.id" class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="cat" :value="cat.slug" :checked="parkingStore.filters.categorySlug === cat.slug" @change="parkingStore.setFilter('categorySlug', cat.slug)" class="accent-blue-700" />
                <span class="text-sm">{{ cat.name }}</span>
              </label>
            </div>
          </div>

          <div class="card">
            <h3 class="font-semibold text-gray-900 mb-3">Disponibilité</h3>
            <div class="space-y-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="status" value="" :checked="!parkingStore.filters.status" @change="parkingStore.setFilter('status', '')" class="accent-blue-700" />
                <span class="text-sm">Toutes</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="status" value="available" @change="parkingStore.setFilter('status', 'available')" class="accent-blue-700" />
                <span class="text-sm">Disponible</span>
              </label>
            </div>
          </div>

          <div class="card">
            <h3 class="font-semibold text-gray-900 mb-3">Trier par</h3>
            <select @change="e => parkingStore.setFilter('sortBy', e.target.value)" class="input-field text-sm">
              <option value="default">Par défaut</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>
          </div>

          <button @click="parkingStore.resetFilters()" class="w-full btn-outline text-sm">
            Réinitialiser les filtres
          </button>
        </aside>

        <!-- Grille -->
        <div class="flex-1">
          <!-- Recherche -->
          <div class="mb-6 flex gap-3">
            <input
              type="text"
              placeholder="Rechercher par nom ou code..."
              :value="parkingStore.filters.search"
              @input="e => parkingStore.setFilter('search', e.target.value)"
              class="input-field flex-1"
            />
          </div>

          <!-- Loading -->
          <div v-if="parkingStore.loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="card animate-pulse">
              <div class="h-48 bg-gray-200 rounded-lg mb-4" />
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div class="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>

          <!-- Empty state -->
          <div v-else-if="!parkingStore.spots.length" class="text-center py-20">
            <div class="text-6xl mb-4">🅿️</div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Aucune place trouvée</h3>
            <p class="text-gray-500">Essayez de modifier vos filtres</p>
          </div>

          <!-- Grille des places -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <RouterLink
              v-for="spot in parkingStore.spots"
              :key="spot.id"
              :to="`/parking/${spot.slug}`"
              class="card hover:shadow-md transition-all hover:-translate-y-1 block"
            >
              <!-- Image -->
              <div class="h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden relative">
                <img v-if="spot.main_image_url" :src="spot.main_image_url" :alt="spot.name" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-5xl text-gray-400">🅿️</div>
                <span :class="[statusBadge[spot.status], 'absolute top-2 right-2']">{{ statusLabel[spot.status] }}</span>
              </div>

              <div class="flex items-start justify-between mb-2">
                <div>
                  <h3 class="font-bold text-gray-900">{{ spot.name }}</h3>
                  <p class="text-sm text-gray-500">{{ spot.code }} · {{ spot.parking_categories?.name }}</p>
                </div>
              </div>

              <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div>
                  <span class="font-bold text-blue-700">{{ formatCurrency(spot.hourly_price) }}/h</span>
                  <span class="text-sm text-gray-400 ml-2">{{ formatCurrency(spot.daily_price) }}/j</span>
                </div>
                <span v-if="spot.status === 'available'" class="text-xs text-green-600 font-medium">Disponible →</span>
              </div>
            </RouterLink>
          </div>

          <!-- Pagination -->
          <div v-if="parkingStore.totalPages > 1" class="flex justify-center gap-2 mt-10">
            <button
              v-for="p in parkingStore.totalPages"
              :key="p"
              @click="parkingStore.setFilter('page', p)"
              :class="['w-10 h-10 rounded-lg font-medium text-sm transition-colors',
                parkingStore.filters.page === p ? 'bg-blue-700 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50']"
            >{{ p }}</button>
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
