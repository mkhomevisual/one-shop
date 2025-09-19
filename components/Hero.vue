<!-- components/Hero.vue -->
<template>
  <section class="relative isolate">
    <div class="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
      <!-- Karusel (fade přes opacity) -->
      <div class="absolute inset-0">
        <div
          v-for="(img, i) in images"
          :key="img"
          class="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out will-change-[opacity]"
          :class="i === current ? 'opacity-100' : 'opacity-0'"
          :style="{ backgroundImage: `url(${img})` }"
        />
      </div>

      <!-- Overlay -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/50"></div>

      <!-- Obsah -->
      <div class="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
          {{ texts[lang].heroHeadline }}
        </h1>
        <p class="mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-white/80">
          {{ texts[lang].heroSubheadline }}
        </p>

        <!-- Jediné CTA: Zjistit více (scroll na #about) -->
        <div class="mt-10">
          <button
            type="button"
            @click="scrollTo('#about')"
            class="group inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-3 text-sm md:text-base font-semibold text-white backdrop-blur hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 transition"
            :aria-label="texts[lang].heroSecondaryCTA"
          >
            {{ texts[lang].heroSecondaryCTA }}
            <ChevronDownIcon
              class="size-5 md:size-6 transition-transform group-hover:translate-y-0.5"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import hero1 from '~/assets/images/Hero1.jpg'
import hero2 from '~/assets/images/Hero2.jpg'
import hero3 from '~/assets/images/Hero3.jpg'

const images = [hero1, hero2, hero3]

const lang = ref('cz')
const texts = {
  cz: {
    heroHeadline: 'Jeden obchod pro všechno',
    heroSubheadline: 'Pomáháme vietnamským prodejnám růst a přizpůsobit se nové době.',
    heroSecondaryCTA: 'Zjistit více',
  },
  vn: {
    heroHeadline: 'Giải pháp bán hàng thành công trong tầm tay bạn',
    heroSubheadline: 'Chúng tôi giúp bạn phát triển kinh doanh dễ dàng và nhanh chóng.',
    heroSecondaryCTA: 'Tìm hiểu thêm',
  },
}

const current = ref(0)
let timer

function startCarousel() {
  timer = setInterval(() => {
    current.value = (current.value + 1) % images.length
  }, 5000)
}
function stopCarousel() {
  if (timer) clearInterval(timer)
}

/** Header offset (sticky) */
function getHeaderOffset () {
  if (typeof window === 'undefined') return 64
  const header = document.querySelector('header[role="banner"]')
  return header ? Math.round(header.getBoundingClientRect().height) : 64
}

/** Smooth scroll s offsetem */
function scrollTo(selector) {
  if (typeof window === 'undefined') return
  const el = document.querySelector(selector)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - getHeaderOffset()
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
}

/** držíme jazyk podle navbaru */
function onLangChange (e) {
  const l = e?.detail?.lang
  if (l === 'cz' || l === 'vn') lang.value = l
}

onMounted(() => {
  const saved = localStorage.getItem('lang')
  if (saved === 'cz' || saved === 'vn') lang.value = saved
  window.addEventListener('langchange', onLangChange)
  startCarousel()
})
onBeforeUnmount(() => {
  stopCarousel()
  window.removeEventListener('langchange', onLangChange)
})
</script>
