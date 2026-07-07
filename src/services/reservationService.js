import { supabase } from './supabaseClient'

export const reservationService = {
  async create(reservation) {
    const { data, error } = await supabase
      .from('reservations')
      .insert(reservation)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getMyReservations(userId) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, parking_spots(name, code, main_image_url, parking_categories(name))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, parking_spots(*, parking_categories(name)), profiles(full_name, email, phone)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async cancel(id) {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async adminGetAll({ status, page = 1, perPage = 20 } = {}) {
    let query = supabase
      .from('reservations')
      .select('*, parking_spots(name, code), profiles(full_name, email, phone)', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)

    const from = (page - 1) * perPage
    query = query.range(from, from + perPage - 1)

    const { data, error, count } = await query
    if (error) throw error
    return { data, count }
  },

  async adminUpdateStatus(id, status) {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
}
