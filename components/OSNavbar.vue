<template>
  <header
    ref="headerRef"
    :class="[
      'sticky top-0 z-50 backdrop-blur transition-colors',
      'bg-white/90 dark:bg-neutral-900/90',
      'border-b border-black/5 dark:border-white/10',
      scrolled ? 'shadow-sm' : ''
    ]"
    role="banner"
  >
    <!-- ROW 1 (MOBILE ONLY): centered logo -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 md:hidden grid place-items-center">
      <a href="/" class="block">
        <img :src="logoUrl" alt="ONESHOP" class="h-9 w-auto select-none" loading="eager" decoding="async" />
      </a>
    </div>

    <!-- ROW 2: main bar (hidden on mobile, grid from md up) -->
    <nav
      class="hidden md:grid mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 grid-cols-[auto_1fr_auto] items-center gap-4"
      aria-label="Hlavní navigace"
    >
      <!-- Logo (md+ vlevo) -->
      <a href="/" class="flex items-center gap-2 justify-self-start">
        <img :src="logoUrl" alt="ONESHOP" class="h-9 w-auto select-none" />
      </a>

      <!-- Odkazy uprostřed (jen ≥ lg) / burger na md -->
      <div class="justify-self-center">
        <!-- Desktop odkazy -->
        <ul class="hidden lg:flex items-center gap-6 whitespace-nowrap text-[15px] sm:text-base font-medium">
          <li v-for="l in nav[lang]" :key="l.label">
            <a
              href="javascript:void(0)"
              @click.prevent="scrollTo(l.href)"
              class="text-neutral-900 dark:text-white hover:text-brand-orange dark:hover:text-brand-orange transition-colors"
            >{{ l.label }}</a>
          </li>
        </ul>

        <!-- Burger (md only) -->
        <button
          class="md:inline-flex lg:hidden h-9 px-3 items-center justify-center rounded border border-black/10 dark:border-white/20 text-sm font-semibold text-neutral-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
          @click="menuOpen = !menuOpen"
          aria-haspopup="true"
          :aria-expanded="menuOpen"
          aria-label="Otevřít menu"
        >
          ☰ Menu
        </button>
      </div>

      <!-- Akce vpravo (jazyk, režim, CTA) -->
      <div class="justify-self-end flex items-center gap-2 min-w-[210px]">
        <!-- Jazyk -->
        <div class="inline-flex rounded-md border border-black/10 dark:border-white/20 overflow-hidden">
          <button
            class="px-3 py-1.5 text-xs font-semibold transition-colors"
            :class="lang === 'cz' ? 'bg-brand-orange text-white' : 'text-neutral-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10'"
            @click="setLang('cz')"
            aria-label="Čeština"
          >CZ</button>
          <button
            class="px-3 py-1.5 text-xs font-semibold transition-colors"
            :class="lang === 'vn' ? 'bg-brand-orange text-white' : 'text-neutral-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10'"
            @click="setLang('vn')"
            aria-label="Tiếng Việt"
          >VN</button>
        </div>

        <!-- Dark/Light -->
        <button
          @click="toggleTheme"
          class="h-9 px-3 text-xs font-semibold rounded border border-black/10 dark:border-white/20 text-neutral-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          :aria-pressed="isDark"
          :aria-label="isDark ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'"
        >
          <span v-if="isDark">☀️</span><span v-else>🌙</span>
        </button>

        <!-- CTA → #sales (smooth) -->
        <a
          href="javascript:void(0)"
          @click.prevent="scrollTo('#sales')"
          class="ml-2 h-9 inline-flex items-center justify-center min-w-[132px] rounded-md bg-brand-orange px-3.5 text-sm font-semibold text-white shadow hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange/60 transition-colors"
        >
          {{ lang === 'cz' ? 'Kontaktujte nás' : 'Liên hệ' }}
        </a>
      </div>
    </nav>

    <!-- ROW 2 (MOBILE ONLY): actions centered under logo -->
    <div class="md:hidden mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-2">
      <div class="flex justify-center items-center gap-2">
        <div class="inline-flex rounded-md border border-black/10 dark:border-white/20 overflow-hidden">
          <button
            class="px-3 py-1.5 text-xs font-semibold transition-colors"
            :class="lang === 'cz' ? 'bg-brand-orange text-white' : 'text-neutral-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10'"
            @click="setLang('cz')"
            aria-label="Čeština"
          >CZ</button>
          <button
            class="px-3 py-1.5 text-xs font-semibold transition-colors"
            :class="lang === 'vn' ? 'bg-brand-orange text-white' : 'text-neutral-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10'"
            @click="setLang('vn')"
            aria-label="Tiếng Việt"
          >VN</button>
        </div>

        <button
          @click="toggleTheme"
          class="h-9 px-3 text-xs font-semibold rounded border border-black/10 dark:border-white/20 text-neutral-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
          :aria-pressed="isDark"
        >
          <span v-if="isDark">☀️</span><span v-else>🌙</span>
        </button>

        <!-- CTA (mobile) → #sales (smooth) -->
        <a
          href="javascript:void(0)"
          @click.prevent="scrollTo('#sales')"
          class="h-9 inline-flex items-center justify-center rounded-md bg-brand-orange px-3.5 text-sm font-semibold text-white shadow hover:opacity-90"
        >
          {{ lang === 'cz' ? 'Kontaktujte nás' : 'Liên hệ' }}
        </a>
      </div>
    </div>

    <!-- Burger sheet (md..<lg) -->
    <transition name="fade">
      <div
        v-if="menuOpen"
        class="hidden md:block lg:hidden fixed left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 border-b border-black/5 dark:border-white/10 backdrop-blur"
        :style="{ top: headerHeight + 'px' }"
        @click.self="menuOpen=false"
      >
        <ul class="mx-auto max-w-7xl px-6 py-4 grid gap-2 sm:grid-cols-2">
          <li v-for="l in nav[lang]" :key="l.label">
            <a
              href="javascript:void(0)"
              @click.prevent="navClick(l.href)"
              class="block rounded-md px-4 py-3 text-base font-medium text-neutral-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
            >{{ l.label }}</a>
          </li>
        </ul>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import logoUrl from '~/assets/images/OS-Logo-Web-Orange.png'

/** Správné cíle (existující ID sekcí) – vše přes smooth scroll */
const nav = {
  cz: [
    { label: 'O nás',     href: '#about'    },
    { label: 'Náš tým',   href: '#team'     },
    { label: 'Pobočky',   href: '#pobocky'  }, // id v OSMap.vue
    { label: 'Sortiment', href: '#sortiment'}, // id v OsKategorieGrid.vue
    { label: 'Spolupráce',href: '#sales'    }, // id doplníme v Sales.vue
  ],
  vn: [
    { label: 'Giới thiệu', href: '#about'    },
    { label: 'Đội ngũ',     href: '#team'     },
    { label: 'Chi nhánh',   href: '#pobocky'  },
    { label: 'Danh mục',    href: '#sortiment'},
    { label: 'Liên hệ',     href: '#sales'    },
  ],
}

const headerRef = ref(null)
const headerHeight = ref(64)
const lang = ref('cz')
const isDark = ref(false)
const scrolled = ref(false)
const menuOpen = ref(false)

function updateHeaderHeight () {
  headerHeight.value = headerRef.value
    ? Math.round(headerRef.value.getBoundingClientRect().height)
    : 64
}

/** Smooth scroll s přesným offsetem aktuální výšky headeru */
function scrollTo (selector) {
  const el = document.querySelector(selector)
  if (!el) return
  updateHeaderHeight()
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  const top = el.getBoundingClientRect().top + window.scrollY - headerHeight.value
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
}
function navClick(href) {
  menuOpen.value = false
  scrollTo(href)
}

/** Jazyk – ulož + broadcast */
function setLang (l) {
  lang.value = l
  localStorage.setItem('lang', l)
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: l }}))
}

/** Tmavý režim */
function toggleTheme () {
  isDark.value = !isDark.value
  const root = document.documentElement
  if (isDark.value) {
    root.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    root.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

function onScroll () { scrolled.value = window.scrollY > 2 }
function onResize () { updateHeaderHeight() }

onMounted(() => {
  // init lang
  const savedLang = localStorage.getItem('lang')
  if (savedLang === 'cz' || savedLang === 'vn') lang.value = savedLang

  // init theme
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia?.('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }

  updateHeaderHeight()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  onScroll()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
