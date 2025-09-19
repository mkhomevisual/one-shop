<!-- components/News.vue -->
<template>
  <section id="novinky" :class="wrapperClasses">
    <div class="mx-auto max-w-7xl px-6 lg:px-8 py-14 sm:py-16">
      <!-- Section header -->
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl sm:text-4xl font-bold tracking-tight" :class="headingColor">
          {{ tt(heading) }}
        </h2>
        <p v-if="subtitle" class="mt-4 text-base sm:text-lg leading-relaxed" :class="mutedText">
          {{ tt(subtitle) }}
        </p>
      </div>

      <!-- Cards: stejné výšky -->
      <ul class="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        <li v-for="(post, i) in limitedItems" :key="keyOf(post)" v-appear="i * 80" class="h-full">
          <article :class="cardClasses">
            <!-- Image top (pevná výška přes aspect ratio) -->
            <div class="relative overflow-hidden rounded-lg aspect-[16/9]">
              <img
                :src="post.image"
                :alt="tt(post.title)"
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>

            <!-- Text block (vyplní zbytek karty) -->
            <div class="pt-3 flex-1 min-h-0">
              <h3 class="text-lg sm:text-xl font-semibold leading-tight" :class="headingColor"
                  style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                {{ tt(post.title) }}
              </h3>
              <time class="mt-1 block text-xs sm:text-sm" :class="subdued">
                {{ formatDate(post.date) }}
              </time>
              <p class="mt-2 text-sm sm:text-base leading-relaxed" :class="mutedText"
                 style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">
                {{ tt(post.excerpt) }}
              </p>
            </div>
          </article>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

type Localized = string | { cz: string; vn: string }

export type NewsItem = {
  title: Localized
  date: string | Date
  excerpt: Localized
  image: string
  href?: string
  id?: string
}

const props = defineProps({
  items: { type: Array as () => NewsItem[], default: () => [] },
  limit: { type: Number, default: 3 },
  heading: {
    type: [String, Object] as () => Localized,
    default: () => ({ cz: 'Novinky', vn: 'Tin mới' })
  },
  subtitle: {
    type: [String, Object] as () => Localized,
    default: () => ({ cz: 'Zjistěte, co je u nás nového.', vn: 'Cập nhật mới nhất từ chúng tôi.' })
  },
  /** variant: 'auto' (default) sleduje <html class="dark"> z navbaru; lze i ručně "light" | "dark" */
  variant: { type: String as () => 'auto' | 'light' | 'dark', default: 'auto' },
})

// Language (cz|vn)
const lang = ref<'cz'|'vn'>(localStorage.getItem('lang') === 'vn' ? 'vn' : 'cz')
function onLangChange (e: any) {
  const l = e?.detail?.lang || localStorage.getItem('lang')
  if (l === 'cz' || l === 'vn') lang.value = l
}
onMounted(() => window.addEventListener('langchange', onLangChange))
onBeforeUnmount(() => window.removeEventListener('langchange', onLangChange))

function tt(val: Localized): string {
  return typeof val === 'string' ? val : (lang.value === 'vn' ? val.vn : val.cz)
}
function keyOf(post: NewsItem) {
  const t = tt(post.title)
  return post.id || `${t}-${post.date}`
}

/* ---------- Fetch z /data/news.json, pokud nepřijdou props.items ---------- */
const fetched = ref<NewsItem[]>([])
onMounted(async () => {
  if (props.items.length) return
  try {
    const r = await fetch('/data/news.json', { cache: 'no-store' })
    const data = await r.json()
    fetched.value = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : [])
  } catch (e) {
    console.error('news.json fetch fail', e)
    fetched.value = []
  }
})
const allItems = computed<NewsItem[]>(() => (props.items.length ? props.items : fetched.value))

/* ---------- Řazení podle data (desc) + limit ---------- */
const limitedItems = computed(() => {
  const sorted = [...allItems.value].sort((a, b) => {
    const da = new Date(a.date as any).getTime() || 0
    const db = new Date(b.date as any).getTime() || 0
    return db - da
  })
  return sorted.slice(0, Math.max(0, props.limit))
})

// Theme/dark
const currentTheme = ref<'light' | 'dark'>(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
let mo: MutationObserver | null = null
function syncThemeFromDom() { currentTheme.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light' }

onMounted(() => {
  if (props.variant === 'auto') {
    mo = new MutationObserver(syncThemeFromDom)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    syncThemeFromDom()
  }
})
onBeforeUnmount(() => { mo?.disconnect() })

const isDark = computed(() => props.variant === 'dark' || (props.variant === 'auto' && currentTheme.value === 'dark'))
const wrapperClasses = computed(() => (isDark.value ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900'))
const headingColor = computed(() => (isDark.value ? 'text-white' : 'text-neutral-900'))
const mutedText = computed(() => (isDark.value ? 'text-neutral-300' : 'text-neutral-600'))
const subdued = computed(() => (isDark.value ? 'text-neutral-400' : 'text-neutral-500'))

const cardClasses = computed(() =>
  [
    'group rounded-xl ring-1 shadow-sm hover:shadow-md transition',
    // stejné výšky: karta je flex sloupec a roztáhne se na plnou výšku <li>
    'h-full flex flex-col',
    'px-4 py-4 sm:px-5 sm:py-5',
    isDark.value ? 'bg-neutral-800/60 ring-white/10' : 'bg-white ring-black/5'
  ].join(' ')
)

function formatDate(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(date.getTime())) return ''
  const locale = lang.value === 'vn' ? 'vi-VN' : 'cs-CZ'
  return date.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' })
}

/* Fade-up on enter */
const vAppear = {
  mounted(el: HTMLElement, binding: { value?: number }) {
    const delay = Number(binding?.value ?? 0)
    el.style.transitionProperty = 'opacity, transform'
    el.style.transitionDuration = '700ms'
    el.style.transitionTimingFunction = 'cubic-bezier(0.22, 1, 0.36, 1)'
    el.style.transitionDelay = `${delay}ms`
    el.classList.add('opacity-0', 'translate-y-5')
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        el.classList.remove('opacity-0', 'translate-y-5')
        el.classList.add('opacity-100', 'translate-y-0')
        io.unobserve(el)
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' })
    io.observe(el)
  }
}
</script>

<style scoped>
/* Relying on Tailwind for aesthetics and consistency */
</style>
