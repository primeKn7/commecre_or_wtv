<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="bg-blue-900 text-white mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="col-span-1 md:col-span-2">
          <div class="text-2xl font-bold mb-3">🅿️ AutoPark Manager</div>
          <p class="text-blue-200 text-sm leading-relaxed">
            La plateforme de gestion de parking la plus moderne. Réservez votre place en quelques clics, 24h/24.
          </p>
        </div>

        <!-- Links -->
        <div>
          <h4 class="font-semibold mb-3 text-amber-400">Navigation</h4>
          <ul class="space-y-2 text-sm text-blue-200">
            <li><RouterLink to="/" class="hover:text-white transition-colors">Accueil</RouterLink></li>
            <li><RouterLink to="/parking" class="hover:text-white transition-colors">Nos parkings</RouterLink></li>
            <li><RouterLink to="/contact" class="hover:text-white transition-colors">Contact</RouterLink></li>
          </ul>
        </div>

        <!-- Account -->
        <div>
          <h4 class="font-semibold mb-3 text-amber-400">Mon compte</h4>
          <ul class="space-y-2 text-sm text-blue-200">
            <li><RouterLink to="/login" class="hover:text-white transition-colors">Connexion</RouterLink></li>
            <li><RouterLink to="/register" class="hover:text-white transition-colors">Inscription</RouterLink></li>
            <li><RouterLink to="/my-reservations" class="hover:text-white transition-colors">Mes réservations</RouterLink></li>
          </ul>
        </div>
      </div>

      <hr class="border-blue-700 my-8" />
      <p class="text-center text-blue-300 text-sm">
        © {{ new Date().getFullYear() }} AutoPark Manager. Tous droits réservés.
      </p>
    </div>
  </footer>
</template>
