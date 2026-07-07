import { supabase } from './supabaseClient'

const PROVIDER = import.meta.env.VITE_PAYMENT_PROVIDER || 'simulation'

export const paymentService = {
  async initiate(reservationId, userId, amount) {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        reservation_id: reservationId,
        user_id: userId,
        provider: PROVIDER === 'simulation' ? 'manual' : PROVIDER,
        amount,
        currency: 'XOF',
        status: 'pending'
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Simulation de paiement sandbox (succès / échec aléatoire)
  async simulate(paymentId, forceSuccess = true) {
    await new Promise(r => setTimeout(r, 1500)) // simule latence
    const success = forceSuccess || Math.random() > 0.2

    const { data, error } = await supabase
      .from('payments')
      .update({
        status: success ? 'success' : 'failed',
        paid_at: success ? new Date().toISOString() : null,
        provider_reference: 'SIM-' + Date.now()
      })
      .eq('id', paymentId)
      .select()
      .single()
    if (error) throw error
    return { payment: data, success }
  },

  async getMyPayments(userId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*, reservations(reservation_number, parking_spots(name))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async adminGetAll({ page = 1, perPage = 20 } = {}) {
    const from = (page - 1) * perPage
    const { data, error, count } = await supabase
      .from('payments')
      .select('*, reservations(reservation_number), profiles(full_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + perPage - 1)
    if (error) throw error
    return { data, count }
  }
}
