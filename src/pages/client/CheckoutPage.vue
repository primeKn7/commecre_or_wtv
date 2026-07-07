<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useReservationStore } from '@/stores/reservationStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

const cartStore = useCartStore()
const authStore = useAuthStore()
const reservationStore = useReservationStore()
const router = useRouter()

const promoInput = ref('')
const promoError = ref(null)
const checkoutResult = ref(null)

async function applyPromo() {
  promoError.value = null
  try {
    await cartStore.applyPromoCode(promoInput.value)
  } catch (err) {
    promoError.value = err.message
  }
}

async function checkout() {
  try {
    const result = await reservationStore.checkout(
      authStore.user.id,
      cartStore.items
    )
    checkoutResult.value = result
  } catch (err) {
    alert(err.message)
  }
}
</script>

<template>
  <PublicLayout>
    <div class="max-w-4xl mx-auto px-4 py-10">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Mon panier</h1>

      <!-- Résultat paiement -->
      <div v-if="checkoutResult" class="card text-center py-10">
        <div class="text-6xl mb-4">{{ checkoutResult.allSuccess ? '✅' : '❌' }}</div>
        <h2 class="text-2xl font-bold mb-2">{{ checkoutResult.allSuccess ? 'Réservation confirmée !' : 'Paiement échoué' }}</h2>
        <p class="text-gray-500 mb-6">{{ checkoutResult.allSuccess ? 'Vos places sont réservées. Consultez votre espace client.' : 'Votre panier a été conservé.' }}</p>
        <RouterLink v-if="checkoutResult.allSuccess" to="/my-reservations" class="btn-primary inline-block">Voir mes réservations</RouterLink>
      </div>

      <template v-else>
        <!-- Panier vide -->
        <div v-if="!cartStore.items.length" class="text-center py-20">
          <div class="text-6xl mb-4">🛒</div>
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Votre panier est vide</h2>
          <RouterLink to="/parking" class="btn-primary mt-4 inline-block">Trouver une place</RouterLink>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Items -->
          <div class="lg:col-span-2 space-y-4">
            <div v-for="item in cartStore.items" :key="item.id" class="card">
              <div class="flex items-start gap-4">
                <div class="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-3xl text-gray-400">
                  <img v-if="item.spotImage" :src="item.spotImage" :alt="item.spotName" class="w-full h-full object-cover" />
                  <span v-else>🅿️</span>
                </div>
                <div class="flex-1">
                  <h3 class="font-bold text-gray-900">{{ item.spotName }}</h3>
                  <p class="text-sm text-gray-500">{{ item.spotCode }} · {{ item.categoryName }}</p>
                  <p class="text-sm text-gray-600 mt-1">
                    Du {{ formatDate(item.startDateTime) }} au {{ formatDate(item.endDateTime) }}
                  </p>
                  <p class="text-sm text-gray-600">Durée : {{ item.durationHours.toFixed(1) }}h</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-blue-700">{{ formatCurrency(item.totalPrice) }}</p>
                  <button @click="cartStore.removeItem(item.id)" class="text-red-500 text-xs mt-2 hover:underline">Supprimer</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Récapitulatif -->
          <div class="card h-fit sticky top-24">
            <h3 class="font-bold text-gray-900 mb-4">Récapitulatif</h3>

            <div class="space-y-2 text-sm mb-4">
              <div class="flex justify-between">
                <span class="text-gray-600">Sous-total</span>
                <span>{{ formatCurrency(cartStore.subtotal) }}</span>
              </div>
              <div v-if="cartStore.promoDiscount > 0" class="flex justify-between text-green-600">
                <span>Réduction ({{ cartStore.promoCode?.code }})</span>
                <span>-{{ formatCurrency(cartStore.promoDiscount) }}</span>
              </div>
              <hr class="my-2" />
              <div class="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span class="text-blue-700">{{ formatCurrency(cartStore.total) }}</span>
              </div>
            </div>

            <!-- Code promo -->
            <div class="mb-4" v-if="!cartStore.promoCode">
              <div class="flex gap-2">
                <input v-model="promoInput" type="text" placeholder="Code promo" class="input-field text-sm flex-1" />
                <button @click="applyPromo" class="btn-outline text-sm px-3">OK</button>
              </div>
              <p v-if="promoError" class="text-red-500 text-xs mt-1">{{ promoError }}</p>
            </div>
            <div v-else class="mb-4 flex justify-between items-center text-sm">
              <span class="text-green-600 font-medium">✓ {{ cartStore.promoCode.code }}</span>
              <button @click="cartStore.removePromoCode()" class="text-gray-400 hover:text-red-500 text-xs">Retirer</button>
            </div>

            <button
              @click="checkout"
              :disabled="reservationStore.loading"
              class="w-full btn-primary py-3"
            >
              {{ reservationStore.loading ? '⏳ Traitement...' : '💳 Payer maintenant' }}
            </button>

            <p class="text-xs text-gray-400 text-center mt-3">
              Paiement sécurisé · Mode sandbox
            </p>
          </div>
        </div>
      </template>
    </div>
  </PublicLayout>
</template>
