<template>
  <button 
    :class="[
      'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2',
      variantClasses[variant]
    ]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'outline' | 'ghost'
}>(), {
  variant: 'primary'
})

const variantClasses = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
  outline: 'border border-gray-300 bg-white hover:bg-gray-100 text-gray-900 shadow-sm',
  ghost: 'hover:bg-gray-100 hover:text-gray-900 text-gray-700'
}
</script>
