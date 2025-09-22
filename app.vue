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
 * HEAD hinty pro rychlejší navázání spojení k Google Maps (iframe)
 * + Netlify Identity widget (pro login / pozvánky do CMS).
 */
useHead({
  link: [
    { rel: 'dns-prefetch', href: 'https://www.google.com' },
    { rel: 'preconnect', href: 'https://www.google.com', crossorigin: '' },
    { rel: 'dns-prefetch', href: 'https://maps.google.com' },
    { rel: 'preconnect', href: 'https://maps.google.com', crossorigin: '' },
  ],
  script: [
    { src: 'https://identity.netlify.com/v1/netlify-identity-widget.js', defer: true }
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

/**
 * Netlify Identity helper – zavolá callback až bude widget dostupný.
 */
function whenIdentityReady(cb: (w: any) => void) {
  const tryNow = () => (window as any)?.netlifyIdentity
  const w = tryNow()
  if (w) return cb(w)
  const t = setInterval(() => {
    const wi = tryNow()
    if (wi) {
      clearInterval(t)
      cb(wi)
    }
  }, 100)
}

if (process.client) {
  // Init co nejdřív na klientu
  applyDarkClass(getInitialDark())

  onMounted(() => {
    // Reaguj na změnu systémového schématu (pokud není ruční volba)
    mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq?.addEventListener?.('change', onSchemeChange)

    // Pokud je v URL invite_token, otevři rovnou dialog pro vytvoření hesla
    const hasInvite =
      location.hash.includes('invite_token') || location.search.includes('invite_token')

    whenIdentityReady((w) => {
      if (hasInvite) w.open('signup') // zobraz „Nastavit heslo“

      // Příjemné chování: po přihlášení přesměruj rovnou do /admin
      w.on('init', (user: any) => {
        if (!user) {
          w.on('login', () => { window.location.href = '/admin/'; })
        }
      })
    })
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
