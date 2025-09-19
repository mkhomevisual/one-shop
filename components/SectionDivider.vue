<script setup lang="ts">
const props = withDefaults(defineProps<{ full?: boolean }>(), { full: false })
</script>

<template>
  <!-- wrapper, který drží střed a šířku jako ostatní sekce -->
  <div
    :class="[
      'w-full mx-auto',
      props.full ? 'max-w-none px-0' : 'max-w-7xl px-6 lg:px-8'
    ]"
  >
    <div class="relative w-full select-none pointer-events-none">
      <div
        class="h-[2px] sm:h-[3px] w-full bg-gradient-to-r
               from-transparent via-color-none to-transparent
               dark:via-brand-orange/80"
      />
      <div
        class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-4
               bg-gradient-to-r from-transparent via-brand-gray/10 to-transparent
               dark:via-brand-orange/10 blur-md"
      />
    </div>
  </div>
</template>
