<!-- components/About.vue -->
<template>
  <section
    id="about"
    ref="rootRef"
    class="bg-gray-100 py-24 sm:py-32 dark:bg-gray-900 transition-colors"
  >
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <!-- Texty nahoře -->
      <div class="mx-auto max-w-2xl lg:text-center">
        <h2
          class="text-sm font-semibold tracking-wide text-brand-orange transition-all duration-700 ease-out will-change-[opacity,transform]"
          :class="visibleTop[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          {{ copy[lang].eyebrow }}
        </h2>

        <p
          class="mt-2 text-pretty text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white lg:text-balance transition-all duration-700 ease-out will-change-[opacity,transform]"
          :class="visibleTop[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          {{ copy[lang].headline }}
        </p>

        <p
          class="mt-6 text-lg text-gray-700 dark:text-gray-300 transition-all duration-700 ease-out will-change-[opacity,transform]"
          :class="visibleTop[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          {{ copy[lang].sub }}
        </p>
      </div>

      <!-- Grid 6 benefitů -->
      <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
        <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
          <div
            v-for="(f, i) in currentFeatures"
            :key="f.name"
            class="relative pl-16 transition-all duration-700 ease-out will-change-[opacity,transform]"
            :class="visibleFeatures[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
          >
            <dt class="text-base font-semibold text-gray-900 dark:text-white">
              <div class="absolute left-0 top-0 flex size-10 items-center justify-center rounded-lg bg-brand-orange">
                <component :is="f.icon" class="size-6 text-white" aria-hidden="true" />
              </div>
              {{ f.name }}
            </dt>
            <dd class="mt-2 text-base text-gray-600 dark:text-gray-400">
              {{ f.description }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import {
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  PaintBrushIcon,
  MegaphoneIcon
} from '@heroicons/vue/24/outline'

/** Texty nad gridem */
const copy = {
  cz: {
    eyebrow: 'Krabicové řešení pro váš obchod',
    headline: 'Jsme partner pro úspěšný prodej',
    sub: 'Dodáme ověřený sortiment, logistiku a podporu – od výběru zboží po marketing. Stavíme dlouhodobá partnerství a pomáháme vašemu podnikání růst.'
  },
  vn: {
    eyebrow: 'Giải pháp trọn gói cho doanh nghiệp',
    headline: 'Chúng tôi là đối tác bán hàng tin cậy',
    sub: 'Cung cấp danh mục đã kiểm chứng, hậu cần và hỗ trợ – từ chọn hàng đến marketing. Đồng hành cùng bạn để phát triển bền vững.'
  }
}

/** 6 benefitů CZ/VN */
const featuresCZ = [
  { name: 'Poradenství a výměna zboží', description: 'Zboží si u nás vyzkoušíte v praxi. Co nepůjde, můžete bez zbytečných řečí vyměnit za vhodnější položky.', icon: ChatBubbleLeftRightIcon },
  { name: 'Výběr zboží na míru městu', description: 'Zkušenostmi víme, co se kde prodává. Doporučíme sortiment, který má v vaší lokalitě nejvyšší šanci na úspěch.', icon: SparklesIcon },
  { name: 'Exkluzivita pro vaši lokalitu', description: 'Po dohodě chráníme vybrané položky nebo celé značky v dané oblasti, abyste měli férový prostor růst.', icon: ShieldCheckIcon },
  { name: 'Obratový bonus 1–2 %', description: 'Za společné výsledky odměňujeme. Jednoduchá pravidla, jasné vyúčtování – bez kliček.', icon: ArrowTrendingUpIcon },
  { name: 'Branding prodejny', description: 'Navrhneme a zajistíme polepy, cedule i regálové značení, aby prodejna působila profesionálně a sjednoceně.', icon: PaintBrushIcon },
  { name: 'Marketingová podpora', description: 'Připravíme letáky, akční kampaně i online podporu. Pomůžeme přivést zákazníky přímo k vám.', icon: MegaphoneIcon }
]
const featuresVN = [
  { name: 'Tư vấn & đổi hàng', description: 'Bạn có thể thử hàng thực tế. Mặt hàng bán chậm có thể đổi sang sản phẩm phù hợp hơn.', icon: ChatBubbleLeftRightIcon },
  { name: 'Chọn hàng theo thành phố', description: 'Chúng tôi gợi ý danh mục phù hợp với khu vực để bán tốt hơn ngay từ đầu.', icon: SparklesIcon },
  { name: 'Độc quyền khu vực', description: 'Theo thỏa thuận, bảo vệ một số mặt hàng/nhãn hiệu trong khu vực của bạn để bạn phát triển ổn định.', icon: ShieldCheckIcon },
  { name: 'Thưởng doanh số 1–2%', description: 'Thưởng minh bạch theo doanh số chung, quy tắc rõ ràng – không rườm rà.', icon: ArrowTrendingUpIcon },
  { name: 'Làm nhận diện cửa hàng', description: 'Thiết kế & thi công decal, bảng biển, nhãn kệ – cửa hàng chuyên nghiệp, đồng bộ.', icon: PaintBrushIcon },
  { name: 'Hỗ trợ marketing', description: 'Tờ rơi, khuyến mãi, hỗ trợ online – giúp đưa khách hàng đến trực tiếp cửa hàng.', icon: MegaphoneIcon }
]

const lang = ref('cz')
const currentFeatures = computed(() => (lang.value === 'cz' ? featuresCZ : featuresVN))

/** Viditelnost pro fade-up (3 horní prvky + 6 benefitů) */
const visibleTop = ref([false, false, false])
const visibleFeatures = ref(Array(6).fill(false))

/** IO na kořen + spuštění jednou */
const rootRef = ref(null)
let io = null
let hasStarted = false

function start () {
  if (hasStarted) return
  hasStarted = true

  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

  if (reduce) {
    // Bez animací – rovnou vše viditelné
    visibleTop.value = [true, true, true]
    visibleFeatures.value = visibleFeatures.value.map(() => true)
    return
  }

  // Top texty (0 / 100 / 200 ms)
  ;[0, 1, 2].forEach(i => {
    setTimeout(() => { visibleTop.value[i] = true }, i * 100)
  })

  // Benefity (i * 120 ms)
  currentFeatures.value.forEach((_, i) => {
    setTimeout(() => { visibleFeatures.value[i] = true }, i * 120)
  })
}

function onLangChange (e) {
  const l = e?.detail?.lang ?? (typeof window !== 'undefined' ? localStorage.getItem('lang') : null)
  if (l === 'cz' || l === 'vn') lang.value = l
}

onMounted(() => {
  // načíst jazyk
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
  io?.disconnect?.()
  if (typeof window !== 'undefined') {
    window.removeEventListener('langchange', onLangChange)
  }
})
</script>
