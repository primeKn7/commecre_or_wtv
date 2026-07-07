<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { useParkingStore } from '@/stores/parkingStore'
import { supabase } from '@/services/supabaseClient'

const parkingStore = useParkingStore()
const stats = ref({ total_spots: 0, available_spots: 0, total_clients: 0 })

onMounted(async () => {
  await Promise.all([
    parkingStore.loadCategories(),
    parkingStore.loadSpots()
  ])

  const [availRes, clientsRes] = await Promise.all([
    supabase.from('parking_spots').select('*', { count: 'exact', head: true }).eq('status', 'available').eq('is_active', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client')
  ])
  stats.value = {
    ...stats.value,
    available_spots: availRes.count ?? 0,
    total_clients: clientsRes.count ?? 0
  }
})

const faqs = [
  { q: 'Comment réserver une place ?', a: 'Choisissez une place dans la galerie, sélectionnez vos dates et ajoutez-la au panier. Procédez au paiement pour confirmer.' },
  { q: 'Puis-je annuler ma réservation ?', a: 'Oui, tant que votre réservation n\'a pas encore commencé, vous pouvez l\'annuler depuis votre espace client.' },
  { q: 'Quels modes de paiement acceptez-vous ?', a: 'Nous acceptons les paiements par carte bancaire via notre interface sécurisée sandbox.' },
  { q: 'Y a-t-il des places pour les motos ?', a: 'Oui, nous disposons d\'une catégorie dédiée aux motos et scooters à tarif avantageux.' },
]

const testimonials = [
  { name: 'Kofi Asante', rating: 5, comment: 'Service excellent ! J\'ai réservé ma place en moins de 2 minutes.' },
  { name: 'Fatou Diallo', rating: 5, comment: 'Interface très intuitive et parking bien sécurisé. Je recommande vivement !' },
  { name: 'Jean-Marc Dupont', rating: 4, comment: 'Très pratique pour les longues durées. Tarifs compétitifs.' },
]

const openFaq = ref(null)
function toggleFaq(i) { openFaq.value = openFaq.value === i ? null : i }
</script>

<template>
  <PublicLayout>
    <!-- HERO -->
    <section class="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-24 px-4">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
          Votre parking<br /><span class="text-amber-400">réservé en 2 minutes</span>
        </h1>
        <p class="text-blue-200 text-xl mb-10 max-w-2xl mx-auto">
          Trouvez, réservez et payez votre place de parking en ligne. Simple, rapide et sécurisé.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink to="/parking" class="btn-secondary text-lg px-8 py-4">
            Voir les places disponibles
          </RouterLink>
          <RouterLink to="/register" class="btn-outline border-white text-white hover:bg-white/10 text-lg px-8 py-4">
            Créer un compte gratuit
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="py-16 bg-white border-b">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div class="p-8 rounded-2xl bg-blue-50">
            <div class="text-5xl font-black text-blue-700 mb-2">{{ stats.available_spots ?? '—' }}+</div>
            <p class="text-gray-600 font-medium">Places disponibles</p>
          </div>
          <div class="p-8 rounded-2xl bg-amber-50">
            <div class="text-5xl font-black text-amber-600 mb-2">{{ stats.total_clients ?? '—' }}+</div>
            <p class="text-gray-600 font-medium">Clients satisfaits</p>
          </div>
          <div class="p-8 rounded-2xl bg-green-50">
            <div class="text-5xl font-black text-green-600 mb-2">24/7</div>
            <p class="text-gray-600 font-medium">Disponible en permanence</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-4">Nos catégories de parking</h2>
        <p class="text-center text-gray-500 mb-12">Choisissez la catégorie qui correspond à votre véhicule</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <RouterLink
            v-for="cat in parkingStore.categories"
            :key="cat.id"
            :to="`/parking?category=${cat.slug}`"
            class="card hover:shadow-md hover:border-blue-200 transition-all text-center group cursor-pointer"
          >
            <div class="text-4xl mb-3">🅿️</div>
            <h3 class="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{{ cat.name }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ cat.description }}</p>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- COMMENT ÇA MARCHE -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Comment ça marche ?</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div v-for="(step, i) in [
            { icon: '🔍', title: 'Cherchez', desc: 'Parcourez les places disponibles et filtrez selon vos besoins' },
            { icon: '🛒', title: 'Ajoutez au panier', desc: 'Sélectionnez vos dates et heures d\'arrivée/départ' },
            { icon: '💳', title: 'Payez', desc: 'Procédez au paiement sécurisé en quelques secondes' },
            { icon: '✅', title: 'Confirmé !', desc: 'Votre place est réservée. Recevez votre confirmation.' },
          ]" :key="i" class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              {{ step.icon }}
            </div>
            <div class="w-8 h-8 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto -mt-2 mb-3 relative z-10">
              {{ i + 1 }}
            </div>
            <h3 class="font-bold text-gray-900 mb-2">{{ step.title }}</h3>
            <p class="text-gray-500 text-sm">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TARIFS -->
    <section class="py-16 bg-blue-900 text-white">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-4">Tarifs adaptés à tous les besoins</h2>
        <p class="text-blue-200 mb-12">Prix calculés automatiquement selon votre durée de stationnement</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="plan in [
            { name: 'Standard', hourly: '500', daily: '4 000', color: 'bg-white/10' },
            { name: 'VIP', hourly: '1 500', daily: '12 000', color: 'bg-amber-500/20 border border-amber-400', featured: true },
            { name: 'Longue durée', hourly: '300', daily: '2 500', color: 'bg-white/10' },
          ]" :key="plan.name" :class="['rounded-2xl p-8', plan.color]">
            <div v-if="plan.featured" class="text-xs font-bold text-amber-400 mb-2 uppercase tracking-wider">⭐ Populaire</div>
            <h3 class="text-xl font-bold mb-4">{{ plan.name }}</h3>
            <div class="text-4xl font-black mb-1">{{ plan.hourly }} <span class="text-lg font-normal text-blue-200">FCFA/h</span></div>
            <div class="text-blue-300 mb-6">ou {{ plan.daily }} FCFA/jour</div>
            <RouterLink to="/parking" class="block btn-secondary text-center">Réserver</RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- TÉMOIGNAGES -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Ce que disent nos clients</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="t in testimonials" :key="t.name" class="card">
            <div class="text-amber-400 text-2xl mb-3">{{ '⭐'.repeat(t.rating) }}</div>
            <p class="text-gray-700 mb-4 italic">"{{ t.comment }}"</p>
            <p class="font-semibold text-gray-900">— {{ t.name }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-16 bg-white">
      <div class="max-w-3xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Questions fréquentes</h2>
        <div class="space-y-4">
          <div v-for="(faq, i) in faqs" :key="i" class="border border-gray-200 rounded-xl overflow-hidden">
            <button @click="toggleFaq(i)" class="w-full text-left px-6 py-4 flex items-center justify-between font-medium text-gray-900 hover:bg-gray-50 transition-colors">
              {{ faq.q }}
              <span class="text-blue-700 transition-transform" :class="openFaq === i ? 'rotate-180' : ''">▼</span>
            </button>
            <div v-if="openFaq === i" class="px-6 pb-4 text-gray-600 text-sm">{{ faq.a }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA FINAL -->
    <section class="py-20 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-center px-4">
      <h2 class="text-3xl md:text-4xl font-extrabold mb-4">Prêt à réserver votre place ?</h2>
      <p class="mb-8 text-amber-100 text-lg">Rejoignez des milliers de clients satisfaits.</p>
      <RouterLink to="/parking" class="bg-white text-amber-600 font-bold px-10 py-4 rounded-xl text-lg hover:bg-amber-50 transition-colors inline-block">
        Voir les places disponibles →
      </RouterLink>
    </section>
  </PublicLayout>
</template>
