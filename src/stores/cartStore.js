import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { supabase } from '@/services/supabaseClient'
import { calculateDuration } from '@/utils/calculateDuration'

const CART_KEY = 'autopark_cart'

export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem(CART_KEY) || '[]'))
  const promoCode = ref(null)
  const promoDiscount = ref(0)
  const loading = ref(false)
  const error = ref(null)

  const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.totalPrice, 0))
  const total = computed(() => Math.max(0, subtotal.value - promoDiscount.value))
  const count = computed(() => items.value.length)

  function addItem(spot, startDateTime, endDateTime) {
    const existing = items.value.find(
      i => i.parkingSpotId === spot.id &&
        i.startDateTime === startDateTime &&
        i.endDateTime === endDateTime
    )
    if (existing) return

    const durationHours = calculateDuration(startDateTime, endDateTime)
    const totalPrice = durationHours * spot.hourly_price

    items.value.push({
      id: crypto.randomUUID(),
      parkingSpotId: spot.id,
      spotName: spot.name,
      spotCode: spot.code,
      spotImage: spot.main_image_url,
      categoryName: spot.parking_categories?.name,
      startDateTime,
      endDateTime,
      durationHours,
      unitPrice: spot.hourly_price,
      totalPrice
    })
  }

  function removeItem(itemId) {
    items.value = items.value.filter(i => i.id !== itemId)
  }

  function updateItemDates(itemId, startDateTime, endDateTime, hourlyPrice) {
    const item = items.value.find(i => i.id === itemId)
    if (!item) return
    item.startDateTime = startDateTime
    item.endDateTime = endDateTime
    item.durationHours = calculateDuration(startDateTime, endDateTime)
    item.totalPrice = item.durationHours * (hourlyPrice ?? item.unitPrice)
  }

  function clearCart() {
    items.value = []
    promoCode.value = null
    promoDiscount.value = 0
  }

  async function applyPromoCode(code) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (err || !data) throw new Error('Code promo invalide ou expiré')
      if (data.used_count >= data.max_uses) throw new Error('Code promo épuisé')

      promoCode.value = data
      if (data.type === 'percentage') {
        promoDiscount.value = subtotal.value * (data.value / 100)
      } else {
        promoDiscount.value = data.value
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function removePromoCode() {
    promoCode.value = null
    promoDiscount.value = 0
  }

  // Persister dans localStorage
  watch(items, (val) => {
    localStorage.setItem(CART_KEY, JSON.stringify(val))
  }, { deep: true })

  return {
    items, promoCode, promoDiscount, loading, error,
    subtotal, total, count,
    addItem, removeItem, updateItemDates, clearCart,
    applyPromoCode, removePromoCode
  }
})
