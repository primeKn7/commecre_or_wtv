<script setup>
defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Confirmation' },
  message: { type: String, default: 'Etes-vous sur ?' },
  confirmText: { type: String, default: 'Confirmer' },
  cancelText: { type: String, default: 'Annuler' },
  danger: { type: Boolean, default: false }
})
defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="$emit('cancel')" />
      <div class="relative bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 z-10">
        <h3 class="text-lg font-bold text-gray-900 mb-2">{{ title }}</h3>
        <p class="text-sm text-gray-600 mb-6">{{ message }}</p>
        <div class="flex gap-3">
          <button @click="$emit('cancel')" class="btn-outline flex-1">{{ cancelText }}</button>
          <button @click="$emit('confirm')" :class="['flex-1 font-medium py-2 px-4 rounded-lg transition-colors', danger ? 'bg-red-600 text-white hover:bg-red-700' : 'btn-primary']">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
