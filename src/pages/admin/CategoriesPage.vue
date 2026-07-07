<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { parkingService } from '@/services/parkingService'

const categories = ref([])
const loading = ref(false)
const showForm = ref(false)
const editTarget = ref(null)
const form = ref({ name: '', slug: '', description: '', icon: '', display_order: 0, is_active: true })

async function load() {
  loading.value = true
  categories.value = await parkingService.adminGetCategories()
  loading.value = false
}

function toSlug(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function openNew() { editTarget.value = null; form.value = { name: '', slug: '', description: '', icon: '', display_order: 0, is_active: true }; showForm.value = true }
function openEdit(cat) { editTarget.value = cat; form.value = { ...cat }; showForm.value = true }

async function submit() {
  if (!editTarget.value) {
    await parkingService.createCategory(form.value)
  } else {
    await parkingService.updateCategory(editTarget.value.id, form.value)
  }
  showForm.value = false
  await load()
}

async function remove(id) {
  if (!confirm('Supprimer cette catégorie ?')) return
  await parkingService.deleteCategory(id)
  await load()
}

onMounted(load)
</script>

<template>
  <AdminLayout>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Catégories</h1>
      <button @click="openNew" class="btn-primary">+ Ajouter</button>
    </div>

    <!-- Formulaire -->
    <div v-if="showForm" class="card mb-6 max-w-lg">
      <h2 class="font-bold text-gray-900 mb-4">{{ editTarget ? 'Modifier' : 'Nouvelle catégorie' }}</h2>
      <form @submit.prevent="submit" class="space-y-3">
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Nom *</label>
          <input v-model="form.name" @input="form.slug = toSlug(form.name)" type="text" required class="input-field" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Slug *</label>
          <input v-model="form.slug" type="text" required class="input-field" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Description</label>
          <input v-model="form.description" type="text" class="input-field" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Icône (nom Lucide)</label>
          <input v-model="form.icon" type="text" class="input-field" placeholder="Car, Star, Truck..." />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Ordre d'affichage</label>
          <input v-model.number="form.display_order" type="number" class="input-field" />
        </div>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="form.is_active" class="accent-blue-700" />
          <span class="text-sm">Active</span>
        </label>
        <div class="flex gap-3">
          <button type="submit" class="btn-primary">Enregistrer</button>
          <button type="button" @click="showForm = false" class="btn-outline">Annuler</button>
        </div>
      </form>
    </div>

    <!-- Liste -->
    <div class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b border-gray-100">
            <th class="pb-3 font-medium">Ordre</th>
            <th class="pb-3 font-medium">Nom</th>
            <th class="pb-3 font-medium">Slug</th>
            <th class="pb-3 font-medium">Statut</th>
            <th class="pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="cat in categories" :key="cat.id" class="hover:bg-gray-50">
            <td class="py-3 text-gray-500">{{ cat.display_order }}</td>
            <td class="py-3 font-medium text-gray-900">{{ cat.name }}</td>
            <td class="py-3 font-mono text-xs text-gray-400">{{ cat.slug }}</td>
            <td class="py-3"><span :class="cat.is_active ? 'badge-available' : 'badge-maintenance'">{{ cat.is_active ? 'Active' : 'Inactive' }}</span></td>
            <td class="py-3">
              <div class="flex gap-2">
                <button @click="openEdit(cat)" class="text-blue-600 hover:underline text-xs">Modifier</button>
                <button @click="remove(cat.id)" class="text-red-500 hover:underline text-xs">Supprimer</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AdminLayout>
</template>
