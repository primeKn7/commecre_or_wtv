<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  message: { type: String, default: '' },
  type: { type: String, default: 'success' },
  duration: { type: Number, default: 3000 }
})

const emit = defineEmits(['close'])
const visible = ref(false)

watch(() => props.message, (val) => {
  if (val) {
    visible.value = true
    setTimeout(() => {
      visible.value = false
      emit('close')
    }, props.duration)
  }
}, { immediate: true })

const colors = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error: 'bg-red-50 border-red-400 text-red-800',
  warning: 'bg-amber-50 border-amber-400 text-amber-800',
  info: 'bg-blue-50 border-blue-400 text-blue-800'
}
const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-[-100%] opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-[-100%] opacity-0"
    >
      <div v-if="visible" class="fixed top-4 right-4 z-[200] max-w-sm w-full">
        <div :class="['border-l-4 rounded-lg p-4 shadow-lg flex items-start gap-3', colors[type]]">
          <span class="text-lg font-bold">{{ icons[type] }}</span>
          <p class="text-sm flex-1">{{ message }}</p>
          <button @click="visible = false; emit('close')" class="opacity-60 hover:opacity-100 text-lg leading-none">&times;</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
