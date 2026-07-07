<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { parkingService } from '@/services/parkingService'
import { uploadService } from '@/services/uploadService'
import { supabase } from '@/services/supabaseClient'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const categories = ref([])
const loading = ref(false)
const uploading = ref(false)
const error = ref(null)

const form = reactive({
  name: '', code: '', slug: '', category_id: '', description: '',
  location_label: '', main_image_url: '', hourly_price: '',
  daily_price: '', status: 'available', services: '', capacity: 1,
  is_featured: false, is_active: true
})

onMounted(async () => {
  categories.value = await parkingService.adminGetCategories()

  if (isEdit.value) {
    const { data } = await supabase.from('parking_spots').select('*').eq('id', route.params.id).single()
    if (data) {
      Object.assign(form, {
        ...data,
        services: (data.services || []).join(', ')
      })
    }
  }
})

function toSlug(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function onNameInput() {
  if (!isEdit.value) form.slug = toSlug(form.name)
}

async function handleImageUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const url = await uploadService.uploadImage(file, 'parking-images', 'spots')
    form.main_image_url = url
  } catch (err) {
    error.value = 'Erreur upload: ' + err.message
  } finally {
    uploading.value = false
  }
}

async function submit() {
  loading.value = true
  error.value = null
  try {
    const payload = {
      ...form,
      hourly_price: Number(form.hourly_price),
      daily_price: Number(form.daily_price),
      capacity: Number(form.capacity),
      services: form.services.split(',').map(s => s.trim()).filter(Boolean)
    }

    if (isEdit.value) {
      await parkingService.updateSpot(route.params.id, payload)
    } else {
      await parkingService.createSpot(payload)
    }
    router.push('/admin/parking-spots')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AdminLayout>
    <div class="max-w-2xl">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">
        {{ isEdit ? 'Modifier la place' : 'Ajouter une place' }}
      </h1>

      <form @submit.prevent="submit" class="card space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">Nom *</label>
            <input v-model="form.name" @input="onNameInput" type="text" required class="input-field" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">Code *</label>
            <input v-model="form.code" type="text" required class="input-field" />
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Slug *</label>
          <input v-model="form.slug" type="text" required class="input-field" />
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Categorie *</label>
          <select v-model="form.category_id" required class="input-field">
            <option value="">Choisir une categorie</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Description</label>
          <textarea v-model="form.description" rows="3" class="input-field resize-none" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">Prix/heure (FCFA) *</label>
            <input v-model="form.hourly_price" type="number" min="1" required class="input-field" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">Prix/jour (FCFA) *</label>
            <input v-model="form.daily_price" type="number" min="1" required class="input-field" />
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Statut</label>
          <select v-model="form.status" class="input-field">
            <option value="available">Disponible</option>
            <option value="occupied">Occupe</option>
            <option value="reserved">Reserve</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Services (separes par virgule)</label>
          <input v-model="form.services" type="text" class="input-field" placeholder="Camera, Gardiennage, Recharge electrique" />
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Localisation interne</label>
          <input v-model="form.location_label" type="text" class="input-field" placeholder="Zone A, Niveau 2" />
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Image principale</label>
          <div class="flex gap-3 items-start">
            <div class="flex-1">
              <input type="file" accept="image/*" @change="handleImageUpload" class="input-field text-sm" />
              <p v-if="uploading" class="text-xs text-blue-600 mt-1">Upload en cours...</p>
              <input v-model="form.main_image_url" type="url" class="input-field mt-2" placeholder="Ou collez l'URL de l'image" />
            </div>
            <div v-if="form.main_image_url" class="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
              <img :src="form.main_image_url" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="form.is_featured" class="accent-blue-700" />
            <span class="text-sm">Mise en avant</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="form.is_active" class="accent-blue-700" />
            <span class="text-sm">Active</span>
          </label>
        </div>

        <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{{ error }}</div>

        <div class="flex gap-3 pt-2">
          <button type="submit" :disabled="loading || uploading" class="btn-primary flex-1">
            {{ loading ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Creer la place') }}
          </button>
          <RouterLink to="/admin/parking-spots" class="btn-outline px-6">Annuler</RouterLink>
        </div>
      </form>
    </div>
  </AdminLayout>
</template>
