import { ref, reactive } from 'vue'
import { parkingService } from '@/services/parkingService'

export function useParking() {
  const spots = ref([])
  const categories = ref([])
  const currentSpot = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const total = ref(0)

  const filters = reactive({
    categorySlug: '',
    status: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'created_at',
    page: 1,
    perPage: 12
  })

  async function loadSpots() {
    loading.value = true
    error.value = null
    try {
      const result = await parkingService.getSpots(filters)
      spots.value = result.data
      total.value = result.count
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function loadCategories() {
    try {
      categories.value = await parkingService.getCategories()
    } catch (err) {
      error.value = err.message
    }
  }

  async function loadSpotBySlug(slug) {
    loading.value = true
    error.value = null
    try {
      currentSpot.value = await parkingService.getSpotBySlug(slug)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function checkAvailability(spotId, startDateTime, endDateTime) {
    try {
      return await parkingService.checkAvailability(spotId, startDateTime, endDateTime)
    } catch (err) {
      error.value = err.message
      return false
    }
  }

  function resetFilters() {
    Object.assign(filters, {
      categorySlug: '', status: '', search: '',
      minPrice: '', maxPrice: '', sortBy: 'created_at', page: 1
    })
  }

  return {
    spots, categories, currentSpot, loading, error, total, filters,
    loadSpots, loadCategories, loadSpotBySlug, checkAvailability, resetFilters
  }
}
