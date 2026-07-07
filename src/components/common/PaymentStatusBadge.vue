<script setup>
defineProps({
  status: { type: String, required: true }
})

const config = {
  pending: { label: 'En attente', class: 'badge-reserved' },
  success: { label: 'Paye', class: 'badge-available' },
  failed: { label: 'Echoue', class: 'badge-occupied' },
  refunded: { label: 'Rembourse', class: 'badge-maintenance' }
}
</script>

<template>
  <span :class="config[status]?.class || 'badge-maintenance'">
    {{ config[status]?.label || status }}
  </span>
</template>
