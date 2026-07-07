<script setup>
import { ref, reactive } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { supabase } from '@/services/supabaseClient'

const form = reactive({ fullName: '', email: '', phone: '', subject: '', message: '' })
const loading = ref(false)
const success = ref(false)
const error = ref(null)

async function submit() {
  loading.value = true
  error.value = null
  try {
    const { error: err } = await supabase.from('contact_messages').insert({
      full_name: form.fullName,
      email: form.email,
      phone: form.phone || null,
      subject: form.subject,
      message: form.message
    })
    if (err) throw err
    success.value = true
    Object.assign(form, { fullName: '', email: '', phone: '', subject: '', message: '' })
  } catch (err) {
    error.value = 'Erreur lors de l\'envoi. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <PublicLayout>
    <div class="max-w-3xl mx-auto px-4 py-16">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Nous contacter</h1>
      <p class="text-gray-500 mb-10">Notre équipe vous répondra dans les 24 heures</p>

      <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 rounded-xl p-6 text-center mb-8">
        <div class="text-4xl mb-2">✅</div>
        <h3 class="font-bold text-lg mb-1">Message envoyé !</h3>
        <p class="text-sm">Nous vous répondrons très bientôt.</p>
      </div>

      <form @submit.prevent="submit" class="card space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">Nom complet *</label>
            <input v-model="form.fullName" type="text" required class="input-field" placeholder="Jean Dupont" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">Email *</label>
            <input v-model="form.email" type="email" required class="input-field" placeholder="jean@exemple.com" />
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Téléphone</label>
          <input v-model="form.phone" type="tel" class="input-field" placeholder="+225 07 00 00 00" />
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Sujet *</label>
          <input v-model="form.subject" type="text" required class="input-field" placeholder="Objet de votre message" />
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">Message *</label>
          <textarea v-model="form.message" required rows="5" class="input-field resize-none" placeholder="Votre message..." />
        </div>

        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

        <button type="submit" :disabled="loading" class="w-full btn-primary">
          {{ loading ? 'Envoi en cours...' : 'Envoyer le message' }}
        </button>
      </form>
    </div>
  </PublicLayout>
</template>
