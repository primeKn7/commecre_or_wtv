import { defineStore } from 'pinia'
import { ref } from 'vue'
import { reservationService } from '@/services/reservationService'
import { paymentService } from '@/services/paymentService'
import { useCartStore } from './cartStore'
import { supabase } from '@/services/supabaseClient'

function generateReservationNumber() {
  const now = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `RES-${now}-${rand}`
}

export const useReservationStore = defineStore('reservation', () => {
  const myReservations = ref([])
  const currentReservation = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function loadMyReservations(userId) {
    loading.value = true
    error.value = null
    try {
      myReservations.value = await reservationService.getMyReservations(userId)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function loadReservation(id) {
    loading.value = true
    error.value = null
    try {
      currentReservation.value = await reservationService.getById(id)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function checkout(userId, cartItems) {
    loading.value = true
    error.value = null
    const cartStore = useCartStore()
    const createdReservations = []
    const discountRatio = cartStore.subtotal > 0
      ? cartStore.promoDiscount / cartStore.subtotal
      : 0

    try {
      for (const item of cartItems) {
        const { data: conflicts } = await supabase
          .from('reservations')
          .select('id')
          .eq('parking_spot_id', item.parkingSpotId)
          .not('status', 'in', '(cancelled,expired,completed)')
          .lte('start_date_time', item.endDateTime)
          .gte('end_date_time', item.startDateTime)

        if (conflicts?.length > 0) {
          throw new Error(`La place ${item.spotName} n'est plus disponible sur ce créneau`)
        }

        const discountAmount = item.totalPrice * discountRatio
        const finalAmount = item.totalPrice - discountAmount

        const reservation = await reservationService.create({
          reservation_number: generateReservationNumber(),
          user_id: userId,
          parking_spot_id: item.parkingSpotId,
          promo_code_id: cartStore.promoCode?.id ?? null,
          start_date_time: item.startDateTime,
          end_date_time: item.endDateTime,
          duration_hours: item.durationHours,
          amount: item.totalPrice,
          discount_amount: discountAmount,
          final_amount: finalAmount,
          status: 'pending',
          payment_status: 'pending'
        })

        createdReservations.push({ ...reservation, payableAmount: finalAmount })
      }

      const paymentResults = []
      for (const res of createdReservations) {
        const payment = await paymentService.initiate(res.id, userId, res.payableAmount)
        const { payment: paid, success } = await paymentService.simulate(payment.id, true)

        if (success) {
          await supabase.from('reservations')
            .update({ status: 'confirmed', payment_status: 'success' })
            .eq('id', res.id)
        } else {
          await supabase.from('reservations')
            .update({ payment_status: 'failed' })
            .eq('id', res.id)
        }

        paymentResults.push({ reservation: res, payment: paid, success })
      }

      const allSuccess = paymentResults.every(r => r.success)
      if (allSuccess) {
        cartStore.clearCart()
      }

      return { reservations: createdReservations, payments: paymentResults, allSuccess }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelReservation(id) {
    loading.value = true
    error.value = null
    try {
      await reservationService.cancel(id)
      const idx = myReservations.value.findIndex(r => r.id === id)
      if (idx !== -1) myReservations.value[idx].status = 'cancelled'
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    myReservations, currentReservation, loading, error,
    loadMyReservations, loadReservation, checkout, cancelReservation
  }
})
