<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { useParkingStore } from '@/stores/parkingStore'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

const route = useRoute()
const parkingStore = useParkingStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

const startDateTime = ref('')
const endDateTime = ref('')
const added = ref(false)

onMounted(async () => {
  await parkingStore.loadSpotBySlug(route.params.slug)
})

function addToCart() {
  if (!startDateTime.value || !endDateTime.value) return
  cartStore.addItem(parkingStore.selectedSpot, startDateTime.value, endDateTime.value)
  added.value = true
  setTimeout(() => added.value = false, 3000)
}

const statusBadge = {
  available: 'badge-available',
  occupied: 'badge-occupied',
  reserved: 'badge-reserved',
  maintenance: 'badge-maintenance'
}
</script>

<template>
  <PublicLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Loading -->
      <div v-if="parkingStore.loading" class="animate-pulse space-y-4">
        <div class="h-96 bg-gray-200 rounded-2xl" />
        <div class="h-8 bg-gray-200 rounded w-1/3" />
      </div>

      <div v-else-if="parkingStore.selectedSpot" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Colonne principale -->
        <div class="lg:col-span-2">
          <!-- Image principale -->
          <div class="h-80 bg-gray-200 rounded-2xl overflow-hidden mb-6">
            <img v-if="parkingStore.selectedSpot.main_image_url"
              :src="parkingStore.selectedSpot.main_image_url"
              :alt="parkingStore.selectedSpot.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-8xl text-gray-300">🅿️</div>
          </div>

          <!-- Infos -->
          <div class="flex items-start justify-between mb-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ parkingStore.selectedSpot.name }}</h1>
              <p class="text-gray-500 mt-1">
                Code : <strong>{{ parkingStore.selectedSpot.code }}</strong> ·
                {{ parkingStore.selectedSpot.parking_categories?.name }}
              </p>
            </div>
            <span :class="[statusBadge[parkingStore.selectedSpot.status], 'text-sm px-3 py-1']">
              {{ parkingStore.selectedSpot.status }}
            </span>
          </div>

          <p class="text-gray-600 leading-relaxed mb-6">{{ parkingStore.selectedSpot.description }}</p>

          <!-- Services -->
          <div v-if="parkingStore.selectedSpot.services?.length" class="mb-6">
            <h3 class="font-semibold text-gray-900 mb-3">Services inclus</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="s in parkingStore.selectedSpot.services" :key="s"
                class="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full font-medium">
                ✓ {{ s }}
              </span>
            </div>
          </div>

          <!-- Localisation -->
          <div v-if="parkingStore.selectedSpot.location_label" class="card mb-6">
            <h3 class="font-semibold text-gray-900 mb-1">📍 Localisation</h3>
            <p class="text-gray-600 text-sm">{{ parkingStore.selectedSpot.location_label }}</p>
          </div>
        </div>

        <!-- Panneau réservation -->
        <div class="lg:col-span-1">
          <div class="card sticky top-24">
            <div class="mb-4">
              <span class="text-3xl font-black text-blue-700">{{ formatCurrency(parkingStore.selectedSpot.hourly_price) }}</span>
              <span class="text-gray-400 text-sm">/heure</span>
              <br />
              <span class="text-lg font-bold text-gray-600">{{ formatCurrency(parkingStore.selectedSpot.daily_price) }}</span>
              <span class="text-gray-400 text-sm">/jour</span>
            </div>

            <template v-if="parkingStore.selectedSpot.status === 'available'">
              <div class="space-y-3 mb-4">
                <div>
                  <label class="text-sm font-medium text-gray-700 block mb-1">Arrivée</label>
                  <input type="datetime-local" v-model="startDateTime" class="input-field" />
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700 block mb-1">Départ</label>
                  <input type="datetime-local" v-model="endDateTime" :min="startDateTime" class="input-field" />
                </div>
              </div>

              <template v-if="authStore.isAuthenticated">
                <button @click="addToCart" :disabled="!startDateTime || !endDateTime" class="w-full btn-primary mb-3">
                  🛒 Ajouter au panier
                </button>
                <RouterLink to="/checkout" class="w-full btn-secondary block text-center">
                  ⚡ Réserver maintenant
                </RouterLink>
                <div v-if="added" class="mt-3 text-center text-green-600 text-sm font-medium">✓ Ajouté au panier !</div>
              </template>

              <template v-else>
                <RouterLink :to="`/login?redirect=/parking/${route.params.slug}`" class="w-full btn-primary block text-center mb-2">
                  Se connecter pour réserver
                </RouterLink>
                <RouterLink to="/register" class="w-full btn-outline block text-center text-sm">
                  Créer un compte
                </RouterLink>
              </template>
            </template>

            <div v-else class="p-4 bg-red-50 rounded-lg text-center text-red-700 font-medium">
              Cette place n'est pas disponible à la réservation
            </div>
          </div>
        </div>
      </div>

      <!-- 404 -->
      <div v-else class="text-center py-20">
        <div class="text-6xl mb-4">😕</div>
        <h2 class="text-2xl font-bold text-gray-700 mb-2">Place introuvable</h2>
        <RouterLink to="/parking" class="btn-primary mt-4 inline-block">Retour à la galerie</RouterLink>
      </div>
    </div>
  </PublicLayout>
</template>
