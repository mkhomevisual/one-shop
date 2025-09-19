<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

type Item = { icon: string; cz: string; vn: string; href?: string }

// PNG ikony
import Ik01 from '@/assets/icons/png/Ikona1.png'
import Ik02 from '@/assets/icons/png/Ikona2.png'
import Ik03 from '@/assets/icons/png/Ikona3.png'
import Ik04 from '@/assets/icons/png/Ikona4.png'
import Ik05 from '@/assets/icons/png/Ikona5.png'
import Ik06 from '@/assets/icons/png/Ikona6.png'
import Ik07 from '@/assets/icons/png/Ikona7.png'
import Ik08 from '@/assets/icons/png/Ikona8.png'
import Ik09 from '@/assets/icons/png/Ikona9.png'
import Ik10 from '@/assets/icons/png/Ikona10.png'
import Ik11 from '@/assets/icons/png/Ikona11.png'
import Ik12 from '@/assets/icons/png/Ikona12.png'

const items: Item[] = [
  { icon: Ik01, cz: 'Ruční nářadí',                 vn: 'Dụng cụ cầm tay' },
  { icon: Ik02, cz: 'Kotouče a brusné materiály',   vn: 'Đĩa cắt & vật liệu mài' },
  { icon: Ik03, cz: 'Příslušenství ke kompresorům',  vn: 'Phụ kiện máy nén' },
  { icon: Ik04, cz: 'Sváření',                       vn: 'Hàn' },
  { icon: Ik05, cz: 'Plynové vařiče',                vn: 'Bếp gas' },
  { icon: Ik06, cz: 'Autopotřeby',                   vn: 'Phụ kiện ô tô' },
  { icon: Ik07, cz: 'Barvy, laky, tmely, silikony',  vn: 'Sơn, vecni, keo trét, silicon' },
  { icon: Ik08, cz: 'Malířské a zednické potřeby',   vn: 'Dụng cụ sơn & xây' },
  { icon: Ik09, cz: 'Šrouby, matice',                vn: 'Ốc vít, đai ốc' },
  { icon: Ik10, cz: 'Domácí potřeby',                vn: 'Đồ gia dụng' },
  { icon: Ik11, cz: 'Železářství',                   vn: 'Kim khí' },
  { icon: Ik12, cz: 'Ochranné pomůcky',              vn: 'Đồ bảo hộ' },
]

// jazyk z navbaru
const lang = ref<'cz'|'vn'>(localStorage.getItem('lang') === 'vn' ? 'vn' : 'cz')
function onLangChange (e: any) {
  const l = e?.detail?.lang || localStorage.getItem('lang')
  if (l === 'cz' || l === 'vn') lang.value = l
}
onMounted(() => window.addEventListener('langchange', onLangChange))
onBeforeUnmount(() => window.removeEventListener('langchange', onLangChange))

// pomalejší fade-up + stagger
const vAppear = {
  mounted (el: HTMLElement, binding: { value?: number }) {
    const delay = Number(binding?.value ?? 0)
    el.style.transitionProperty = 'opacity, transform'
    el.style.transitionDuration = '1200ms'
    el.style.transitionTimingFunction = 'cubic-bezier(0.22, 1, 0.36, 1)'
    el.style.transitionDelay = `${delay}ms`
    el.classList.add('opacity-0', 'translate-y-6')
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        el.classList.remove('opacity-0', 'translate-y-6')
        el.classList.add('opacity-100', 'translate-y-0')
        io.unobserve(el)
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' })
    io.observe(el)
  }
}
</script>

<template>
  <section id="sortiment" class="bg-white dark:bg-neutral-900 py-24 sm:py-32 transition-colors">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <!-- Hlavička -->
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {{ lang === 'cz' ? 'Náš sortiment' : 'Danh mục sản phẩm' }}
        </h2>
        <p class="mt-6 text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
          {{
            lang === 'cz'
              ? 'Široká nabídka pro velkoobchod i retail. Stabilní sklad, rychlá dostupnost a férové ceny.'
              : 'Danh mục phong phú cho bán buôn và bán lẻ. Kho ổn định, sẵn hàng nhanh, giá minh bạch.'
          }}
        </p>
      </div>

      <!-- Grid dlaždic – 1 sloupec na mobilu -->
      <ul class="relative mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-6">
        <li v-for="(it, i) in items" :key="it.cz">
          <a
            :href="it.href || '#'"
            v-appear="i * 120"
            class="group flex flex-col items-center justify-center text-center rounded-xl
                                      bg-transparent p-6 sm:p-8 lg:p-10 transition-all duration-300
                   hover:-translate-y-0.5 hover:border-brand-orange
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/60"
            :aria-label="lang==='cz' ? it.cz : it.vn"
          >
            <img
              :src="it.icon"
              :alt="lang==='cz' ? it.cz : it.vn"
              class="mx-auto h-8 w-8 sm:h-16 sm:w-16 lg:h-16 lg:w-16 mb-4 object-contain pointer-events-none select-none"
              draggable="false"
            />
            <!-- sjednocená výška titulku (max 2 řádky) -->
            <div
              class="mt-1 min-h-[3.25rem] flex items-center justify-center px-3
                     text-neutral-900 dark:text-white text-base sm:text-lg font-regular mt-5 leading-tight"
              style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;"
            >
              {{ lang==='cz' ? it.cz : it.vn }}
            </div>
          </a>
        </li>
      </ul>

      <p class="py-10 mt-6 text-xs text-center text-neutral-500 dark:text-neutral-400">
        {{ lang==='cz' ? 'Některé prodejny mohou nabízet i širší sortiment.' : 'Một số cửa hàng có thể bán nhiều nhóm hàng hơn.' }}
      </p>
    </div>
  </section>
</template>
