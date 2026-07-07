<script setup>
import { onMounted, ref } from 'vue'
import { parkingService } from '@/services/parkingService'

const props = defineProps({
  modelValue: { type: Object, required: true }
})
const emit = defineEmits(['update:modelValue', 'filter'])

const categories = ref([])

onMounted(async () => {
  categories.value = await parkingService.getCategories()
})

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value, page: 1 })
  emit('filter')
}

function reset() {
  emit('update:modelValue', {
    categorySlug: '', status: '', search: '',
    minPrice: '', maxPrice: '', sortBy: 'created_at', page: 1
  })
  emit('filter')
}
</script>

<template>
  <div class="card">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <input
        :value="modelValue.search"
        @input="update('search', $event.target.value)"
        type="text"
        placeholder="Rechercher..."
        class="input-field"
      />

      <select :value="modelValue.categorySlug" @change="update('categorySlug', $event.target.value)" class="input-field">
        <option value="">Toutes les categories</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.slug">{{ cat.name }}</option>
      </select>

      <select :value="modelValue.sortBy" @change="update('sortBy', $event.target.value)" class="input-field">
        <option value="created_at">Plus recents</option>
        <option value="price_asc">Prix croissant</option>
        <option value="price_desc">Prix decroissant</option>
      </select>

      <button @click="reset" class="btn-outline text-sm">Reinitialiser</button>
    </div>
  </div>
</template>
