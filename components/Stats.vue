<!-- components/Stats.vue -->
<template>
  <section
    ref="rootRef"
    class="bg-brand-orange py-24 sm:py-16 shadow-[0_0_30px_5px_rgba(249,115,22,0.35)]"
    aria-label="Statistiky"
  >
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <dl class="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
        <div
          v-for="(row, i) in rows"
          :key="row.label"
          class="mx-auto flex max-w-xs flex-col gap-y-4 transition-all duration-700 ease-out will-change-[opacity,transform]"
          :class="visible[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          <dt class="text-sm font-medium leading-7 text-white/90">
            {{ row.label }}
          </dt>
          <dd
            class="order-first text-3xl sm:text-5xl font-semibold tracking-tight text-white tabular-nums"
            aria-live="polite"
          >
            {{ formatted(i) }}
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

type Lang = 'cz' | 'vn'
const lang = ref<Lang>('cz') // default; načtu z localStorage až na klientu

/** data (čísla jako number + suffix, popisky pro CZ/VN) */
const data = [
  {
    targets: 100,
    suffix: '+',
    label: { cz: 'Kvalitních dodavatelů', vn: 'Nhà cung cấp chất lượng' },
  },
  {
    targets: 1000,
    suffix: '+',
    label: { cz: 'Spolupracujících maloobchodů', vn: 'Cửa hàng bán lẻ hợp tác' },
  },
  {
    targets: 40000,
    suffix: '+',
    label: { cz: 'Položek na skladě', vn: 'Sản phẩm có sẵn trong kho' },
  },
] as const

const rows = computed(() =>
  data.map(d => ({ label: d.label[lang.value], targets: d.targets, suffix: d.suffix }))
)

/** stav animací */
const values  = ref<number[]>(data.map(() => 0))
const visible = ref<boolean[]>(data.map(() => false))

function formatWithDots(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
function formatted(i: number) {
  return `${formatWithDots(Math.round(values.value[i]))}${rows.value[i].suffix}`
}

function animateTo(index: number, target: number, duration = 2000) {
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    values.value[index] = target
    return
  }
  const start = performance.now()
  const from = 0
  const delta = target - from
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration)
    const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
    values.value[index] = from + delta * eased
    if (t < 1) requestAnimationFrame(tick)
    else values.value[index] = target
  }
  requestAnimationFrame(tick)
}

/** spuštění jednou po zobrazení */
let hasStarted = false
function start() {
  if (hasStarted) return
  hasStarted = true
  rows.value.forEach((r, i) => {
    setTimeout(() => {
      visible.value[i] = true
      animateTo(i, r.targets, 2000)
    }, i * 120) // jemný stagger
  })
}

/** IO na kořen */
const rootRef = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null

function onLangChange(e: any) {
  const l =
    e?.detail?.lang ??
    (typeof window !== 'undefined' ? localStorage.getItem('lang') : null)
  if (l === 'cz' || l === 'vn') lang.value = l
}

onMounted(() => {
  // načti jazyk bezpečně až na klientu
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('lang')
    if (saved === 'cz' || saved === 'vn') lang.value = saved
  }

  io = new IntersectionObserver(
    entries => {
      if (entries.some(e => e.isIntersecting)) start()
    },
    { threshold: 0.2 }
  )
  if (rootRef.value) io.observe(rootRef.value)

  window.addEventListener('langchange', onLangChange)
})

onBeforeUnmount(() => {
  io?.disconnect()
  if (typeof window !== 'undefined') {
    window.removeEventListener('langchange', onLangChange)
  }
})
</script>
