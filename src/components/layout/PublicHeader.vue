<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()
const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)

async function logout() {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <header class="bg-blue-900 text-white sticky top-0 z-50 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2 font-bold text-xl">
          🅿️ <span class="hidden sm:inline">AutoPark Manager</span>
        </RouterLink>

        <!-- Nav desktop -->
        <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
          <RouterLink to="/" class="hover:text-amber-400 transition-colors" active-class="text-amber-400">Accueil</RouterLink>
          <RouterLink to="/parking" class="hover:text-amber-400 transition-colors" active-class="text-amber-400">Parking</RouterLink>
          <RouterLink to="/contact" class="hover:text-amber-400 transition-colors" active-class="text-amber-400">Contact</RouterLink>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <!-- Panier -->
          <RouterLink to="/checkout" class="relative p-2 hover:text-amber-400 transition-colors">
            🛒
            <span v-if="cartStore.count > 0" class="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {{ cartStore.count }}
            </span>
          </RouterLink>

          <!-- Utilisateur connecté -->
          <template v-if="authStore.isAuthenticated">
            <div class="relative">
              <button @click="userMenuOpen = !userMenuOpen" class="flex items-center gap-2 hover:text-amber-400 transition-colors text-sm">
                <div class="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-white">
                  {{ authStore.profile?.first_name?.charAt(0) ?? '?' }}
                </div>
              </button>
              <div v-if="userMenuOpen" @click.away="userMenuOpen = false"
                class="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-lg shadow-xl border border-gray-100 py-1 z-50">
                <RouterLink to="/profile" @click="userMenuOpen = false" class="block px-4 py-2 text-sm hover:bg-gray-50">Mon profil</RouterLink>
                <RouterLink to="/my-reservations" @click="userMenuOpen = false" class="block px-4 py-2 text-sm hover:bg-gray-50">Mes réservations</RouterLink>
                <RouterLink v-if="authStore.isAdmin" to="/admin" @click="userMenuOpen = false" class="block px-4 py-2 text-sm hover:bg-gray-50 text-blue-700 font-medium">Administration</RouterLink>
                <hr class="my-1" />
                <button @click="logout" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Déconnexion</button>
              </div>
            </div>
          </template>

          <!-- Non connecté -->
          <template v-else>
            <RouterLink to="/login" class="text-sm hover:text-amber-400 transition-colors hidden md:block">Connexion</RouterLink>
            <RouterLink to="/register" class="btn-secondary text-sm px-3 py-1.5 hidden md:block">S'inscrire</RouterLink>
          </template>

          <!-- Menu mobile -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2">
            ☰
          </button>
        </div>
      </div>
    </div>

    <!-- Menu mobile -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-blue-800 border-t border-blue-700 px-4 py-3 space-y-2">
      <RouterLink to="/" @click="mobileMenuOpen = false" class="block py-2 hover:text-amber-400">Accueil</RouterLink>
      <RouterLink to="/parking" @click="mobileMenuOpen = false" class="block py-2 hover:text-amber-400">Parking</RouterLink>
      <RouterLink to="/contact" @click="mobileMenuOpen = false" class="block py-2 hover:text-amber-400">Contact</RouterLink>
      <template v-if="!authStore.isAuthenticated">
        <RouterLink to="/login" @click="mobileMenuOpen = false" class="block py-2 hover:text-amber-400">Connexion</RouterLink>
        <RouterLink to="/register" @click="mobileMenuOpen = false" class="block py-2 hover:text-amber-400">S'inscrire</RouterLink>
      </template>
    </div>
  </header>
</template>
