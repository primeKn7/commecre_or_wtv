import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { parkingService } from '@/services/parkingService'
import { supabase } from '@/services/supabaseClient'

export const useParkingStore = defineStore('parking', () => {
  const spots = ref([])
  const categories = ref([])
  const selectedSpot = ref(null)
  const totalCount = ref(0)
  const loading = ref(false)
  const error = ref(null)

  const filters = ref({
    categorySlug: '',
    status: '',
    search: '',
    minPrice: null,
    maxPrice: null,
    sortBy: 'default',
    page: 1,
    perPage: 12
  })

  let realtimeChannel = null

  const availableSpots = computed(() => spots.value.filter(s => s.status === 'available'))
  const totalPages = computed(() => Math.ceil(totalCount.value / filters.value.perPage))

  async function loadCategories() {
    try {
      categories.value = await parkingService.getCategories()
    } catch (err) {
      error.value = err.message
    }
  }

  async function loadSpots() {
    loading.value = true
    error.value = null
    try {
      const { data, count } = await parkingService.getSpots(filters.value)
      spots.value = data
      totalCount.value = count
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function loadSpotBySlug(slug) {
    loading.value = true
    error.value = null
    try {
      selectedSpot.value = await parkingService.getSpotBySlug(slug)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  function setFilter(key, value) {
    filters.value[key] = value
    if (key !== 'page') filters.value.page = 1
  }

  function resetFilters() {
    filters.value = { categorySlug: '', status: '', search: '', minPrice: null, maxPrice: null, sortBy: 'default', page: 1, perPage: 12 }
  }

  function subscribeRealtime() {
    realtimeChannel = supabase
      .channel('parking_spots_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_spots' }, () => {
        loadSpots()
      })
      .subscribe()
  }

  function unsubscribeRealtime() {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }

  // Recharger quand les filtres changent
  watch(filters, () => { loadSpots() }, { deep: true })

  return {
    spots, categories, selectedSpot, totalCount, loading, error, filters,
    availableSpots, totalPages,
    loadCategories, loadSpots, loadSpotBySlug,
    setFilter, resetFilters,
    subscribeRealtime, unsubscribeRealtime
  }
})
