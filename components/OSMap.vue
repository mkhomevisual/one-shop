<!-- components/OSMap.vue -->
<template>
  <section id="pobocky" class="relative py-24 sm:py-32 bg-white dark:bg-gray-900 transition-colors">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <!-- Hlavička -->
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-sm font-semibold tracking-wide text-brand-orange">{{ t.kicker }}</h2>
        <p class="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-brand-anthracite dark:text-white">
          {{ t.title }}
        </p>
        <p class="mt-6 text-lg text-neutral-700 dark:text-neutral-300">
          {{ t.subtitle }}
        </p>
      </div>

      <!-- Obsah: LEVÝ SEZNAM + PRAVÁ MAPA -->
      <div class="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Seznam (vertikální) -->
        <aside class="lg:col-span-1 lg:sticky lg:top-8 self-start">
          <div class="rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white dark:bg-neutral-800/60 p-4">
            <label class="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-200">
              {{ t.searchLabel }}
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model="query"
                type="search"
                :placeholder="t.searchPlaceholder"
                class="w-full rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white
                       ring-1 ring-black/10 dark:ring-white/10 px-3 py-2 focus:outline-none
                       focus:ring-2 focus:ring-brand-orange"
              />
              <div class="hidden sm:flex gap-1">
                <button @click="scrollList(-1)"
                        class="rounded-md px-2.5 py-2 ring-1 ring-black/10 dark:ring-white/10 bg-white dark:bg-neutral-900 hover:bg-black/5 dark:hover:bg-white/5"
                        :aria-label="t.scrollUp">↑</button>
                <button @click="scrollList(1)"
                        class="rounded-md px-2.5 py-2 ring-1 ring-black/10 dark:ring-white/10 bg-white dark:bg-neutral-900 hover:bg-black/5 dark:hover:bg-white/5"
                        :aria-label="t.scrollDown">↓</button>
              </div>
            </div>

            <ul
              ref="listRef"
              class="mt-4 divide-y divide-black/5 dark:divide-white/10 overflow-auto pr-1 list-scroll"
              :style="{ maxHeight: listMaxHeight }"
            >
              <li v-for="s in filtered" :key="s.id">
                <button
                  class="w-full text-left py-2.5 px-2 focus:outline-none group rounded-md
                         hover:bg-black/5 dark:hover:bg-white/5"
                  :class="active?.id === s.id ? 'bg-black/5 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/10' : ''"
                  @click="select(s)"
                >
                  <p class="font-semibold text-brand-anthracite dark:text-white group-hover:underline text-[15px] leading-tight">
                    {{ nameOf(s) }}
                  </p>
                  <p class="text-[13px] text-neutral-600 dark:text-neutral-300 mt-0.5 leading-snug">
                    {{ s.address }}
                  </p>
                  <p v-if="hoursOf(s)" class="text-[12px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                    <span class="font-medium">{{ t.hoursLabel }}:</span> {{ hoursOf(s) }}
                  </p>
                </button>
              </li>
            </ul>
          </div>
        </aside>

        <!-- Mapa (iframe) -->
        <div class="lg:col-span-2">
          <div class="rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 bg-white dark:bg-neutral-800/60">
            <div ref="mapWrap" class="aspect-[16/9] w-full">
              <iframe
                v-if="shouldLoad && active"
                :key="active.id + '-' + lang"
                class="h-full w-full"
                :src="gmapsEmbed(active)"
                style="border:0"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                allowfullscreen
              ></iframe>
            </div>
            <div class="p-4 flex items-center gap-2">
              <a
                v-if="active"
                class="inline-flex items-center justify-center rounded-md bg-brand-orange px-3.5 py-2
                       text-sm font-semibold text-white shadow hover:opacity-90 focus-visible:outline
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange/60"
                :href="gmapsLink(active)"
                target="_blank" rel="noopener"
              >{{ t.openInMaps }}</a>

              <div class="ml-auto text-sm text-neutral-600 dark:text-neutral-300 truncate">
                {{ active ? nameOf(active) : '' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

type Lang = 'cz' | 'vn'
type Localized = string | { cz: string; vn: string }
type Store = {
  id: number
  slug?: string
  name: Localized
  address: string
  hours?: Localized
  phone?: string
  lat?: number | null
  lng?: number | null
}

const props = defineProps<{ items?: Store[]; dataUrl?: string }>()

/* ---------- i18n (SSR-safe) ---------- */
const lang = ref<Lang>('cz')
function onLangChange (e: any) {
  const l = e?.detail?.lang || (typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null)
  if (l === 'cz' || l === 'vn') lang.value = l
}
onMounted(() => {
  const saved = (typeof localStorage !== 'undefined') ? localStorage.getItem('lang') : null
  if (saved === 'cz' || saved === 'vn') lang.value = saved as Lang
  window.addEventListener('langchange', onLangChange as any)
})
onBeforeUnmount(() => window.removeEventListener('langchange', onLangChange as any))

const dict = {
  cz: {
    kicker: 'Naše pobočky',
    title: 'Najděte nejbližší prodejnu',
    subtitle: 'Jednoduše si vyberte pobočku ze seznamu a otevřete trasu v Mapách.',
    hoursLabel: 'Otevírací doba',
    openInMaps: 'Otevřít v Google Maps',
    searchLabel: 'Vyhledat pobočku',
    searchPlaceholder: 'Název nebo adresa…',
    scrollUp: 'Posunout seznam nahoru',
    scrollDown: 'Posunout seznam dolů'
  },
  vn: {
    kicker: 'Chi nhánh của chúng tôi',
    title: 'Tìm cửa hàng gần bạn',
    subtitle: 'Chọn chi nhánh từ danh sách và mở lộ trình trên Google Maps.',
    hoursLabel: 'Giờ mở cửa',
    openInMaps: 'Mở bằng Google Maps',
    searchLabel: 'Tìm cửa hàng',
    searchPlaceholder: 'Tên hoặc địa chỉ…',
    scrollUp: 'Cuộn lên',
    scrollDown: 'Cuộn xuống'
  }
} as const
const t = computed(() => dict[lang.value])

/* ---------- Data ---------- */
const list = ref<Store[]>([])
const active = ref<Store | null>(null)
const query = ref('')

/* ---------- Lazy iframe ---------- */
const mapWrap = ref<HTMLElement | null>(null)
const shouldLoad = ref(false)
let io: IntersectionObserver | null = null

/* ---------- Seznam výška & scroll ---------- */
const listRef = ref<HTMLElement | null>(null)
const listMaxHeight = ref<string>('520px') // fallback

function syncListHeight() {
  const wrap = mapWrap.value
  if (!wrap) return
  const rect = wrap.getBoundingClientRect()
  const h = rect.height + 56
  listMaxHeight.value = `${Math.max(320, Math.round(h))}px`
}

function scrollList(dir: 1 | -1) {
  const el = listRef.value
  if (!el) return
  const step = Math.max(200, el.clientHeight * 0.8)
  el.scrollBy({ top: dir * step, behavior: 'smooth' })
}

onMounted(async () => {
  // data
  if (props.items?.length) {
    list.value = props.items
  } else {
    const url = props.dataUrl || '/data/stores.json'
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error(String(res.status))
      const data = await res.json()
      // 🔧 NORMALIZACE: podporuj pole i { items: [...] }
      list.value = Array.isArray(data)
        ? data
        : (Array.isArray((data as any).items) ? (data as any).items : [])
    } catch (e) {
      console.error('stores.json fetch fail', e)
      list.value = []
    }
  }
  active.value = list.value[0] || null

  // lazy iframe
  io = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) {
      shouldLoad.value = true
      io?.disconnect()
      io = null
    }
  }, { rootMargin: '120px' })
  if (mapWrap.value) io.observe(mapWrap.value)

  // výška seznamu = výška mapy (živě)
  const ro = new ResizeObserver(() => syncListHeight())
  if (mapWrap.value) ro.observe(mapWrap.value)
  syncListHeight()
})

onBeforeUnmount(() => io?.disconnect())

/* ---------- Helpers ---------- */
function tt(val?: Localized): string {
  if (!val) return ''
  return typeof val === 'string' ? val : (lang.value === 'vn' ? (val as any).vn : (val as any).cz)
}

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return list.value
  return list.value.filter(s =>
    tt(s.name).toLowerCase().includes(q) ||
    (s.address || '').toLowerCase().includes(q)
  )
})

function select(s: Store) {
  active.value = s
  if (!shouldLoad.value) shouldLoad.value = true
}

function nameOf(s?: Store) { return s ? tt(s.name) : '' }
function hoursOf(s?: Store) { return s ? tt(s.hours) : '' }

/* ---------- Google Maps URL builders ---------- */
function gmapsEmbed(s: Store) {
  const q = encodeURIComponent(s.address || nameOf(s))
  return `https://www.google.com/maps?q=${q}&output=embed`
}
function gmapsLink(s: Store) {
  const dest = encodeURIComponent(s.address || nameOf(s))
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`
}
</script>

<style scoped>
/* scroll estetika u seznamu */
.list-scroll {
  -ms-overflow-style: auto;
  scrollbar-width: thin;
}
.list-scroll::-webkit-scrollbar { width: 8px; }
.list-scroll::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,.15);
  border-radius: 8px;
}
.dark .list-scroll::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,.18);
}
</style>
