import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabaseClient'
import { reservationService } from '@/services/reservationService'
import { paymentService } from '@/services/paymentService'

export const useAdminStore = defineStore('admin', () => {
  const stats = ref(null)
  const reservations = ref([])
  const payments = ref([])
  const users = ref([])
  const messages = ref([])
  const siteSettings = ref(null)
  const loading = ref(false)
  const error = ref(null)

  let realtimeChannel = null

  async function loadDashboardStats() {
    loading.value = true
    error.value = null
    try {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

      const [
        resTotal,
        resToday,
        clientsCount,
        availCount,
        occupiedCount,
        msgCount,
        todayPay,
        monthPay
      ] = await Promise.all([
        supabase.from('reservations').select('*', { count: 'exact', head: true }),
        supabase.from('reservations').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
        supabase.from('parking_spots').select('*', { count: 'exact', head: true }).eq('status', 'available').eq('is_active', true),
        supabase.from('parking_spots').select('*', { count: 'exact', head: true }).neq('status', 'available').eq('is_active', true),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('payments').select('amount').eq('status', 'success').gte('created_at', startOfDay),
        supabase.from('payments').select('amount').eq('status', 'success').gte('created_at', startOfMonth),
      ])

      stats.value = {
        total_reservations: resTotal.count ?? 0,
        today_reservations: resToday.count ?? 0,
        total_clients: clientsCount.count ?? 0,
        available_spots: availCount.count ?? 0,
        occupied_spots: occupiedCount.count ?? 0,
        new_messages: msgCount.count ?? 0,
        today_revenue: (todayPay.data ?? []).reduce((sum, p) => sum + (p.amount || 0), 0),
        month_revenue: (monthPay.data ?? []).reduce((sum, p) => sum + (p.amount || 0), 0),
      }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function loadReservations(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const result = await reservationService.adminGetAll(filters)
      reservations.value = result.data
      return result
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function updateReservationStatus(id, status) {
    try {
      const data = await reservationService.adminUpdateStatus(id, status)
      const idx = reservations.value.findIndex(r => r.id === id)
      if (idx !== -1) reservations.value[idx].status = data.status
      return data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function loadPayments(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const result = await paymentService.adminGetAll(filters)
      payments.value = result.data
      return result
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function loadUsers({ page = 1, perPage = 20 } = {}) {
    loading.value = true
    error.value = null
    try {
      const from = (page - 1) * perPage
      const { data, error: err, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, from + perPage - 1)
      if (err) throw err
      users.value = data
      return { data, count }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function updateUserRole(userId, role) {
    const { data, error: err } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()
    if (err) throw err
    const idx = users.value.findIndex(u => u.id === userId)
    if (idx !== -1) users.value[idx] = data
    return data
  }

  async function toggleUserActive(userId, isActive) {
    const { data, error: err } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId)
      .select()
      .single()
    if (err) throw err
    const idx = users.value.findIndex(u => u.id === userId)
    if (idx !== -1) users.value[idx] = data
    return data
  }

  async function loadMessages({ status } = {}) {
    loading.value = true
    error.value = null
    try {
      let query = supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
      if (status) query = query.eq('status', status)
      const { data, error: err } = await query
      if (err) throw err
      messages.value = data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function updateMessageStatus(id, status) {
    const { data, error: err } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    const idx = messages.value.findIndex(m => m.id === id)
    if (idx !== -1) messages.value[idx] = data
    return data
  }

  async function deleteMessage(id) {
    const { error: err } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id)
    if (err) throw err
    messages.value = messages.value.filter(m => m.id !== id)
  }

  async function loadSiteSettings() {
    const { data, error: err } = await supabase.from('site_settings').select('*').single()
    if (err) throw err
    siteSettings.value = data
    return data
  }

  async function updateSiteSettings(updates) {
    const { data, error: err } = await supabase
      .from('site_settings')
      .update(updates)
      .eq('id', siteSettings.value?.id)
      .select()
      .single()
    if (err) throw err
    siteSettings.value = data
    return data
  }

  async function logAction(userId, action, entity, entityId, description) {
    await supabase.from('audit_logs').insert({ user_id: userId, action, entity, entity_id: entityId, description })
  }

  function subscribeRealtime() {
    realtimeChannel = supabase
      .channel('admin_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
        loadDashboardStats()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        loadDashboardStats()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_messages' }, () => {
        loadDashboardStats()
      })
      .subscribe()
  }

  function unsubscribeRealtime() {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }

  return {
    stats, reservations, payments, users, messages, siteSettings, loading, error,
    loadDashboardStats, loadReservations, updateReservationStatus, loadPayments, loadUsers,
    updateUserRole, toggleUserActive,
    loadMessages, updateMessageStatus, deleteMessage,
    loadSiteSettings, updateSiteSettings, logAction,
    subscribeRealtime, unsubscribeRealtime
  }
})
