<!-- components/Footer.vue -->
<template>
  <footer class="bg-white dark:bg-neutral-900">
    <div class="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
      <!-- Logo -->
      <div class="flex justify-center mb-8">
        <a href="/" class="block">
          <img :src="logoUrl" alt="ONESHOP" class="h-9 w-auto select-none" loading="lazy" decoding="async" />
        </a>
      </div>

      <!-- Odkazy -->
      <nav class="-mb-6 flex flex-wrap justify-center gap-x-12 gap-y-3 text-sm/6" aria-label="Footer">
        <template v-for="item in nav[lang]" :key="item.label">
          <!-- hash (smooth scroll s offsetem headeru) -->
          <a
            v-if="item.type === 'hash'"
            href="javascript:void(0)"
            @click.prevent="scrollTo(item.href)"
            class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >{{ item.label }}</a>

          <!-- (rezerva) route odkaz -->
          <a
            v-else
            :href="item.href"
            class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >{{ item.label }}</a>
        </template>
      </nav>

      <p class="mt-10 text-center text-sm/6 text-gray-600 dark:text-gray-400">
        &copy; 2024 OneShop. Všechna práva vyhrazena.<br>
        Web &amp; Design vytvořil Martin Klíma.
      </p>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import logoUrl from '~/assets/images/OS-Logo-Web-Orange.png'

/** Stejné hash cíle jako v navbaru */
const nav = {
  cz: [
    { label: 'O nás',     href: '#about',     type: 'hash'  },
    { label: 'Náš tým',   href: '#team',      type: 'hash'  },
    { label: 'Pobočky',   href: '#pobocky',   type: 'hash'  },
    { label: 'Sortiment', href: '#sortiment', type: 'hash'  },
    { label: 'Kontakt',   href: '#sales',     type: 'hash'  }, // Sales má id="sales"
  ],
  vn: [
    { label: 'Giới thiệu', href: '#about',     type: 'hash'  },
    { label: 'Đội ngũ',    href: '#team',      type: 'hash'  },
    { label: 'Chi nhánh',  href: '#pobocky',   type: 'hash'  },
    { label: 'Danh mục',   href: '#sortiment', type: 'hash'  },
    { label: 'Liên hệ',    href: '#sales',     type: 'hash'  },
  ],
}

/** jazyk */
const lang = ref('cz')
function onLangChange (e) {
  const l = e?.detail?.lang ?? (typeof window !== 'undefined' ? localStorage.getItem('lang') : null)
  if (l === 'cz' || l === 'vn') lang.value = l
}

/** Smooth scroll s offsetem sticky headeru */
function getHeaderOffset () {
  if (typeof window === 'undefined') return 64
  const header = document.querySelector('header[role="banner"]')
  return header ? Math.round(header.getBoundingClientRect().height) : 64
}
function scrollTo (selector) {
  if (typeof window === 'undefined') return
  const el = document.querySelector(selector)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - getHeaderOffset()
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
}

onMounted(() => {
  const saved = localStorage.getItem('lang')
  if (saved === 'cz' || saved === 'vn') lang.value = saved
  window.addEventListener('langchange', onLangChange)
})
onBeforeUnmount(() => {
  window.removeEventListener('langchange', onLangChange)
})
</script>
