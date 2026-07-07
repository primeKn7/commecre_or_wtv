import { supabase } from './supabaseClient'

export const parkingService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('parking_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
    if (error) throw error
    return data
  },

  async getSpots({ categorySlug, status, search, minPrice, maxPrice, sortBy = 'created_at', page = 1, perPage = 12 } = {}) {
    let query = supabase
      .from('parking_spots')
      .select('*, parking_categories(name, slug, icon)', { count: 'exact' })
      .eq('is_active', true)

    if (categorySlug) {
      const { data: cat } = await supabase.from('parking_categories').select('id').eq('slug', categorySlug).single()
      if (cat) query = query.eq('category_id', cat.id)
    }
    if (status) query = query.eq('status', status)
    if (search) query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`)
    if (minPrice) query = query.gte('hourly_price', minPrice)
    if (maxPrice) query = query.lte('hourly_price', maxPrice)

    if (sortBy === 'price_asc') query = query.order('hourly_price', { ascending: true })
    else if (sortBy === 'price_desc') query = query.order('hourly_price', { ascending: false })
    else query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })

    const from = (page - 1) * perPage
    query = query.range(from, from + perPage - 1)

    const { data, error, count } = await query
    if (error) throw error
    return { data, count }
  },

  async getSpotBySlug(slug) {
    const { data, error } = await supabase
      .from('parking_spots')
      .select('*, parking_categories(name, slug, icon)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    if (error) throw error
    return data
  },

  async checkAvailability(spotId, startDateTime, endDateTime) {
    const { data, error } = await supabase
      .from('reservations')
      .select('id')
      .eq('parking_spot_id', spotId)
      .not('status', 'in', '(cancelled,expired,completed)')
      .lte('start_date_time', endDateTime)
      .gte('end_date_time', startDateTime)
    if (error) throw error
    return data.length === 0
  },

  // Admin
  async adminGetSpots({ page = 1, perPage = 20 } = {}) {
    const from = (page - 1) * perPage
    const { data, error, count } = await supabase
      .from('parking_spots')
      .select('*, parking_categories(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + perPage - 1)
    if (error) throw error
    return { data, count }
  },

  async createSpot(spot) {
    const { data, error } = await supabase.from('parking_spots').insert(spot).select().single()
    if (error) throw error
    return data
  },

  async updateSpot(id, updates) {
    const { data, error } = await supabase.from('parking_spots').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async deleteSpot(id) {
    const { error } = await supabase.from('parking_spots').delete().eq('id', id)
    if (error) throw error
  },

  async adminGetCategories() {
    const { data, error } = await supabase.from('parking_categories').select('*').order('display_order')
    if (error) throw error
    return data
  },

  async createCategory(category) {
    const { data, error } = await supabase.from('parking_categories').insert(category).select().single()
    if (error) throw error
    return data
  },

  async updateCategory(id, updates) {
    const { data, error } = await supabase.from('parking_categories').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async deleteCategory(id) {
    const { error } = await supabase.from('parking_categories').delete().eq('id', id)
    if (error) throw error
  }
}
