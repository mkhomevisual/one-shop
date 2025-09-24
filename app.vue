<template>
  <div class="min-h-screen overflow-x-clip">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
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
    { src: 'https://identity.netlify.com/v1/netlify-identity-widget.js', defer: true },
  ],
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
  const stored = localStorage.getItem('theme')
  if (!stored) applyDarkClass(e.matches)
}

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
  applyDarkClass(getInitialDark())
  onMounted(() => {
    mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq?.addEventListener?.('change', onSchemeChange)

    const hasInvite =
      location.hash.includes('invite_token') || location.search.includes('invite_token')

    whenIdentityReady((w) => {
      if (hasInvite) w.open('signup')
      w.on('init', (user: any) => {
        if (!user) {
          w.on('login', () => {
            window.location.href = '/admin/'
          })
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
/* Globální overflow fix */
html, body {
  overflow-x: clip;
}

/* Skryje obsah do doby, než se uplatní dark/light třída */
[v-cloak] { display: none; }
</style>
