<script setup>
import { RouterLink, useRoute } from 'vue-router'

defineProps({ open: Boolean })
defineEmits(['close'])

const route = useRoute()

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: '📊', exact: true },
  { label: 'Places', to: '/admin/parking-spots', icon: '🅿️' },
  { label: 'Catégories', to: '/admin/categories', icon: '🏷️' },
  { label: 'Réservations', to: '/admin/reservations', icon: '📅' },
  { label: 'Paiements', to: '/admin/payments', icon: '💳' },
  { label: 'Utilisateurs', to: '/admin/users', icon: '👥' },
  { label: 'Messages', to: '/admin/messages', icon: '✉️' },
  { label: 'Paramètres', to: '/admin/settings', icon: '⚙️' },
]
</script>

<template>
  <!-- Overlay mobile -->
  <div v-if="open" @click="$emit('close')" class="fixed inset-0 bg-black/50 z-40 md:hidden" />

  <!-- Sidebar -->
  <aside :class="[
    'fixed md:static inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white flex flex-col transition-transform duration-300',
    open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
  ]">
    <!-- Logo -->
    <div class="h-16 flex items-center px-6 border-b border-blue-700">
      <RouterLink to="/" class="text-xl font-bold">🅿️ AutoPark</RouterLink>
      <span class="ml-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded font-medium">ADMIN</span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        @click="$emit('close')"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          route.path === item.to || (!item.exact && route.path.startsWith(item.to + '/'))
            ? 'bg-white/20 text-white'
            : 'text-blue-200 hover:bg-white/10 hover:text-white'
        ]"
      >
        <span class="text-lg">{{ item.icon }}</span>
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- Retour site -->
    <div class="p-4 border-t border-blue-700">
      <RouterLink to="/" class="flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors">
        ← Retour au site
      </RouterLink>
    </div>
  </aside>
</template>
