import { createRouter, createWebHistory } from 'vue-router'
import { setupGuards } from './guards'

const routes = [
  // Public
  { path: '/', name: 'home', component: () => import('@/pages/public/HomePage.vue') },
  { path: '/parking', name: 'parking.gallery', component: () => import('@/pages/public/ParkingGalleryPage.vue') },
  { path: '/parking/:slug', name: 'parking.detail', component: () => import('@/pages/public/ParkingDetailPage.vue') },
  { path: '/contact', name: 'contact', component: () => import('@/pages/public/ContactPage.vue') },

  // Auth
  { path: '/login', name: 'auth.login', component: () => import('@/pages/auth/LoginPage.vue'), meta: { guestOnly: true } },
  { path: '/register', name: 'auth.register', component: () => import('@/pages/auth/RegisterPage.vue'), meta: { guestOnly: true } },
  { path: '/forgot-password', name: 'auth.forgot-password', component: () => import('@/pages/auth/ForgotPasswordPage.vue'), meta: { guestOnly: true } },

  // Client (requiert auth)
  { path: '/checkout', name: 'client.checkout', component: () => import('@/pages/client/CheckoutPage.vue'), meta: { requiresAuth: true } },
  { path: '/profile', name: 'client.profile', component: () => import('@/pages/client/ProfilePage.vue'), meta: { requiresAuth: true } },
  { path: '/my-reservations', name: 'client.reservations', component: () => import('@/pages/client/MyReservationsPage.vue'), meta: { requiresAuth: true } },
  { path: '/my-reservations/:id', name: 'client.reservation.detail', component: () => import('@/pages/client/ReservationDetailPage.vue'), meta: { requiresAuth: true } },

  // Admin (requiert role admin)
  { path: '/admin', name: 'admin.dashboard', component: () => import('@/pages/admin/DashboardPage.vue'), meta: { requiresAdmin: true } },
  { path: '/admin/parking-spots', name: 'admin.parking-spots', component: () => import('@/pages/admin/ParkingSpotsPage.vue'), meta: { requiresAdmin: true } },
  { path: '/admin/parking-spots/new', name: 'admin.parking-spots.new', component: () => import('@/pages/admin/ParkingFormPage.vue'), meta: { requiresAdmin: true } },
  { path: '/admin/parking-spots/:id/edit', name: 'admin.parking-spots.edit', component: () => import('@/pages/admin/ParkingFormPage.vue'), meta: { requiresAdmin: true } },
  { path: '/admin/categories', name: 'admin.categories', component: () => import('@/pages/admin/CategoriesPage.vue'), meta: { requiresAdmin: true } },
  { path: '/admin/reservations', name: 'admin.reservations', component: () => import('@/pages/admin/ReservationsPage.vue'), meta: { requiresAdmin: true } },
  { path: '/admin/payments', name: 'admin.payments', component: () => import('@/pages/admin/PaymentsPage.vue'), meta: { requiresAdmin: true } },
  { path: '/admin/users', name: 'admin.users', component: () => import('@/pages/admin/UsersPage.vue'), meta: { requiresAdmin: true } },
  { path: '/admin/messages', name: 'admin.messages', component: () => import('@/pages/admin/MessagesPage.vue'), meta: { requiresAdmin: true } },
  { path: '/admin/settings', name: 'admin.settings', component: () => import('@/pages/admin/SettingsPage.vue'), meta: { requiresAdmin: true } },

  // Fallback
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

setupGuards(router)

export default router
