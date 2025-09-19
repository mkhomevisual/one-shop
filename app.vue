<!-- app.vue -->
<template>
  <!-- Globální wrapper pro celý web -->
  <div v-cloak class="min-h-screen bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white transition-colors">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useHead } from '#imports'

/**
 * HEAD hinty pro rychlejší navázání spojení k Google Maps (iframe):
 * - dns-prefetch + preconnect zkrátí čekání na první byty.
 */
useHead({
  link: [
    { rel: 'dns-prefetch', href: 'https://www.google.com' },
    { rel: 'preconnect', href: 'https://www.google.com', crossorigin: '' },
    { rel: 'dns-prefetch', href: 'https://maps.google.com' },
    { rel: 'preconnect', href: 'https://maps.google.com', crossorigin: '' },
  ]
})

/**
 * Dark mód: inicializace + reakce na změnu systémového schématu.
 * Ukládáme uživatelskou volbu v localStorage pod klíčem "theme".
 */
function applyDarkClass(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
}

function getInitialDark(): boolean {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark') return true
  if (stored === 'light') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

let mq: MediaQueryList | null = null
function onSchemeChange(e: MediaQueryListEvent) {
  // Respektuj jen pokud uživatel nemá ruční volbu uloženou
  const stored = localStorage.getItem('theme')
  if (!stored) applyDarkClass(e.matches)
}

if (process.client) {
  // Init co nejdřív na klientu
  applyDarkClass(getInitialDark())

  onMounted(() => {
    mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq?.addEventListener?.('change', onSchemeChange)
  })

  onBeforeUnmount(() => {
    mq?.removeEventListener?.('change', onSchemeChange)
  })
}
</script>

<style>
/* Skryje obsah do doby, než se uplatní dark/light třída → bez záblesků motivu */
[v-cloak] { display: none; }
</style>
