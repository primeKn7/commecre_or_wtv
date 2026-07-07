<script setup>
defineProps({
  label: { type: String, required: true },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false }
})
</script>

<template>
  <div>
    <label class="text-sm font-medium text-gray-700 block mb-1">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <slot />
    <p v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</p>
  </div>
</template>
