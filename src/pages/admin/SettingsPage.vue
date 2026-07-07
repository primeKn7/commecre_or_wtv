<script setup>
import { reactive, ref, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useAdminStore } from '@/stores/adminStore'
import { uploadService } from '@/services/uploadService'

const adminStore = useAdminStore()
const form = reactive({})
const success = ref(false)
const error = ref(null)
const uploading = ref(false)

onMounted(async () => {
  try {
    const data = await adminStore.loadSiteSettings()
    if (data) Object.assign(form, data)
  } catch (err) {
    error.value = 'Erreur lors du chargement des parametres'
  }
})

async function handleLogoUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const url = await uploadService.uploadImage(file, 'parking-images', 'logo')
    form.logo_url = url
  } catch (err) {
    error.value = 'Erreur upload: ' + err.message
  } finally {
    uploading.value = false
  }
}

async function submit() {
  success.value = false
  error.value = null
  try {
    await adminStore.updateSiteSettings(form)
    success.value = true
  } catch (err) {
    error.value = err.message
  }
}
</script>

<template>
  <AdminLayout>
    <div class="max-w-2xl">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Parametres du site</h1>

      <form @submit.prevent="submit" class="card space-y-4">
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Nom du parking</label>
          <input v-model="form.site_name" type="text" class="input-field" />
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Logo</label>
          <div class="flex items-center gap-3">
            <input type="file" accept="image/*" @change="handleLogoUpload" class="input-field text-sm flex-1" />
            <div v-if="form.logo_url" class="w-12 h-12 rounded border border-gray-200 overflow-hidden shrink-0">
              <img :src="form.logo_url" class="w-full h-full object-contain" />
            </div>
          </div>
          <p v-if="uploading" class="text-xs text-blue-600 mt-1">Upload en cours...</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">Email de contact</label>
            <input v-model="form.contact_email" type="email" class="input-field" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">Telephone</label>
            <input v-model="form.contact_phone" type="tel" class="input-field" />
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Adresse</label>
          <input v-model="form.address" type="text" class="input-field" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">Horaires d'ouverture</label>
            <input v-model="form.opening_hours" type="text" class="input-field" placeholder="08:00 - 20:00" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">Devise</label>
            <input v-model="form.currency" type="text" class="input-field" placeholder="XOF" />
          </div>
        </div>

        <hr class="my-2" />
        <h3 class="font-semibold text-gray-800">Reseaux sociaux</h3>
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Facebook URL</label>
          <input v-model="form.facebook_url" type="url" class="input-field" placeholder="https://facebook.com/..." />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Instagram URL</label>
          <input v-model="form.instagram_url" type="url" class="input-field" placeholder="https://instagram.com/..." />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">LinkedIn URL</label>
          <input v-model="form.linkedin_url" type="url" class="input-field" placeholder="https://linkedin.com/..." />
        </div>

        <hr class="my-2" />
        <div class="flex items-center gap-6">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="form.sandbox_payment_enabled" class="accent-blue-700" />
            <span class="text-sm">Paiement sandbox active</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="form.maintenance_mode" class="accent-blue-700" />
            <span class="text-sm">Mode maintenance</span>
          </label>
        </div>

        <div v-if="success" class="text-green-600 text-sm bg-green-50 p-3 rounded-lg">Parametres enregistres</div>
        <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{{ error }}</div>

        <button type="submit" :disabled="uploading" class="btn-primary w-full">Enregistrer</button>
      </form>
    </div>
  </AdminLayout>
</template>
