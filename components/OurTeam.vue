<!-- components/OurTeam.vue -->
<template>
  <section id="team" class="py-24 sm:py-32 bg-white dark:bg-neutral-900 transition-colors">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <!-- Heading -->
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {{ t.title }}
        </h2>
        <p class="mt-4 text-neutral-700 dark:text-neutral-300">
          {{ t.subtitle }}
        </p>
      </div>

      <!-- Cards -->
      <ul class="mt-16 flex flex-wrap justify-center gap-8">
        <li
          v-for="p in peopleView"
          :key="p.email"
          class="w-[320px] rounded-xl bg-white dark:bg-neutral-800 px-8 py-10 text-center ring-1 ring-black/5 dark:ring-white/10 shadow-sm shadow-black/5 dark:shadow-white/5 transition-colors"
        >
          <!-- Photo: square frame, no crop -->
          <div
            class="mx-auto mb-6 h-48 w-48 aspect-square rounded-xl ring-1 ring-black/5 dark:ring-white/10 bg-neutral-100 dark:bg-neutral-700/30 grid place-items-center overflow-hidden"
          >
            <img
              :src="p.imageUrl"
              :alt="p.name"
              class="max-h-full max-w-full object-contain p-1"
              loading="lazy"
              decoding="async"
            />
          </div>

          <!-- Name & role -->
          <h3 class="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
            {{ p.name }}
          </h3>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {{ p.role }}
          </p>

          <!-- Contact (email only) -->
          <div class="mt-6 space-y-3">
            <a
              :href="`mailto:${p.email}`"
              class="flex items-center justify-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-brand-orange focus-visible:outline-none"
            >
              <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current text-brand-orange" aria-hidden="true">
                <path
                  d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 2v.01L12 13 4 6.01V6h16zM4 18V8.24l7.4 5.92a1 1 0 001.2 0L20 8.24V18H4z"
                />
              </svg>
              <span>{{ p.email }}</span>
            </a>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

/* statické importy – jistota, že bundler soubory najde */
import person1 from '~/assets/images/OS-Person2.png'
import person2 from '~/assets/images/OS-Person2.png'
import person3 from '~/assets/images/OS-Person3.png'
import person4 from '~/assets/images/OS-Person4.png'
import person5 from '~/assets/images/OS-Person5.png'

type RoleKey =
  | 'ceo'
  | 'salesDirector'
  | 'salesRep'
  | 'designer'
  | 'warehouseLead'
  | 'regionalManager' // << NOVÁ „kategorie“ role

type Person = {
  name: string
  roleKey: RoleKey
  email: string
  imageUrl: string
}

/* původní data + Marcel */
const people: Person[] = [
  {
    name: 'Ing. Viet Duc Le',
    roleKey: 'ceo',
    email: 'le@voph.cz',
    imageUrl: person1,
  },
  {
    name: 'Hoang Pham Van',
    roleKey: 'salesDirector',
    email: 'nam@voph.cz',
    imageUrl: person2,
  },
  {
    name: 'Nguyen Van Manh',
    roleKey: 'salesRep',
    email: 'manh@voph.cz',
    imageUrl: person3,
  },
  {
    name: 'Kristýna Podlahová',
    roleKey: 'designer',
    email: 'podlahova@voph.cz',
    imageUrl: person4,
  },
  {
    name: 'Vít Sechovec',
    roleKey: 'warehouseLead',
    email: 'sechovec@voph.cz',
    imageUrl: person5,
  },
  // --- NOVĚ PŘIDÁNO ---
  {
    name: 'Marcel Rathouský',
    roleKey: 'regionalManager',
    email: 'marcel@voph.cz',
    imageUrl: person5, // klidně později vyměň za vlastní fotku
  },
]

/* jazyk & překlady */
const lang = ref<'cz' | 'vn'>('cz')
const dict = {
  cz: {
    title: 'Náš tým',
    subtitle: 'Jsme sehraný tým, který drží slovo. Rychlá komunikace, férové jednání a výsledky.',
    roles: {
      ceo: 'Ředitel společnosti',
      salesDirector: 'Obchodní ředitel',
      salesRep: 'Obchodní zástupce',
      designer: 'Grafický design',
      warehouseLead: 'Vedoucí skladu',
      regionalManager: 'Regionální manažer', // nové
    },
  },
  vn: {
    title: 'Đội ngũ của chúng tôi',
    subtitle: 'Một đội ngũ gắn kết – giao tiếp nhanh, làm việc minh bạch và hiệu quả.',
    roles: {
      ceo: 'Giám đốc công ty',
      salesDirector: 'Giám đốc kinh doanh',
      salesRep: 'Nhân viên kinh doanh',
      designer: 'Thiết kế đồ họa',
      warehouseLead: 'Trưởng kho',
      regionalManager: 'Quản lý khu vực', // mới
    },
  },
} as const

const t = computed(() => dict[lang.value])
const peopleView = computed(() => people.map(p => ({ ...p, role: t.value.roles[p.roleKey] })))

/* posloucháme přepínač jazyka z OSNavbaru */
function onLangChange(e: any) {
  if (e?.detail?.lang === 'cz' || e?.detail?.lang === 'vn') lang.value = e.detail.lang
}
onMounted(() => {
  const saved = localStorage.getItem('lang')
  if (saved === 'cz' || saved === 'vn') lang.value = saved
  window.addEventListener('langchange', onLangChange as any)
})
onBeforeUnmount(() => window.removeEventListener('langchange', onLangChange as any))
</script>
