import { ref } from 'vue'
import { paymentService } from '@/services/paymentService'

export function usePayment() {
  const loading = ref(false)
  const error = ref(null)
  const paymentResult = ref(null)

  async function initiatePayment(reservationId, userId, amount) {
    loading.value = true
    error.value = null
    try {
      const payment = await paymentService.initiate(reservationId, userId, amount)
      return payment
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function simulatePayment(paymentId, forceSuccess = true) {
    loading.value = true
    error.value = null
    try {
      const result = await paymentService.simulate(paymentId, forceSuccess)
      paymentResult.value = result
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadMyPayments(userId) {
    loading.value = true
    error.value = null
    try {
      const data = await paymentService.getMyPayments(userId)
      return data
    } catch (err) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading, error, paymentResult,
    initiatePayment, simulatePayment, loadMyPayments
  }
}
