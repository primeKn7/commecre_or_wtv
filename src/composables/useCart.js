import { computed } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

export function useCart() {
  const cartStore = useCartStore()
  const authStore = useAuthStore()
  const router = useRouter()

  const items = computed(() => cartStore.items)
  const count = computed(() => cartStore.count)
  const subtotal = computed(() => cartStore.subtotal)
  const total = computed(() => cartStore.total)
  const promoCode = computed(() => cartStore.promoCode)
  const promoDiscount = computed(() => cartStore.promoDiscount)

  function addToCart(spot, startDateTime, endDateTime) {
    cartStore.addItem(spot, startDateTime, endDateTime)
  }

  function removeFromCart(itemId) {
    cartStore.removeItem(itemId)
  }

  function clearCart() {
    cartStore.clearCart()
  }

  function goToCheckout() {
    if (!authStore.isAuthenticated) {
      router.push({ name: 'auth.login', query: { redirect: '/checkout' } })
      return
    }
    router.push('/checkout')
  }

  async function applyPromo(code) {
    return cartStore.applyPromoCode(code)
  }

  function removePromo() {
    cartStore.removePromoCode()
  }

  return {
    items, count, subtotal, total, promoCode, promoDiscount,
    addToCart, removeFromCart, clearCart, goToCheckout, applyPromo, removePromo
  }
}
