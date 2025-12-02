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
          <!-- Name & role -->
          <h3 class="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
            {{ p.name }}
          </h3>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {{ p.role }}
          </p>

          <!-- Contact: phone + email -->
          <div class="mt-6 space-y-3 text-sm">
            <!-- Phone -->
            <a
              :href="`tel:${p.phoneLink}`"
              class="flex items-center justify-center gap-2 font-medium text-neutral-700 dark:text-neutral-200 hover:text-brand-orange focus-visible:outline-none"
            >
              <!-- Phone icon -->
              <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current text-brand-orange" aria-hidden="true">
                <path
                  d="M6.62 10.79a15.053 15.053 0 006.59 6.59l1.99-1.99a1 1 0 011.01-.24c1.12.37 2.33.57 3.59.57a1 1 0 011 1V21a1 1 0 01-1 1C11.4 22 2 12.6 2 2a1 1 0 011-1h3.28a1 1 0 011 1c0 1.26.2 2.47.57 3.59a1 1 0 01-.25 1.01l-1.98 1.99z"
                />
              </svg>
              <span>{{ p.phone }}</span>
            </a>

            <!-- Email -->
            <a
              :href="`mailto:${p.email}`"
              class="flex items-center justify-center gap-2 font-medium text-neutral-700 dark:text-neutral-200 hover:text-brand-orange focus-visible:outline-none"
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

type RoleKey =
  | 'ceo'
  | 'salesDirector'
  | 'salesRep'
  | 'designer'
  | 'warehouseLead'
  | 'regionalManager'

type Person = {
  name: string
  roleKey: RoleKey
  email: string
  phone: string
}

/* aktualizovaní lidé + jejich telefony */
const people: Person[] = [
  {
    name: 'Ing. Duc Le Viet',
    roleKey: 'ceo',
    email: 'le@voph.cz',
    phone: '775 372 979',
  },
  {
    name: 'Van Pham Hoang (Nam)',
    roleKey: 'salesDirector',
    email: 'nam@voph.cz',
    phone: '725 637 736',
  },
  {
    name: 'Van Manh Nguyen',
    roleKey: 'salesRep',
    email: 'manh@voph.cz',
    phone: '776 718 887',
  },
  {
    name: 'Kristýna Podlahová',
    roleKey: 'designer',
    email: 'podlahova@voph.cz',
    phone: '720 580 870',
  },
  {
    name: 'Vít Sechovec',
    roleKey: 'warehouseLead',
    email: 'sechovec@voph.cz',
    phone: '770 324 840',
  },
  {
    name: 'Marcel Rathuský',
    roleKey: 'regionalManager',
    email: 'marcel@voph.cz',
    phone: '775 372 789',
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
      salesDirector: 'Obchodní zástupce, doprava, nákupčí',
      salesRep: 'Obchodní zástupce',
      designer: 'Administrativa / grafika',
      warehouseLead: 'Vedoucí skladu',
      regionalManager: 'Nákupčí',
    },
  },
  vn: {
    title: 'Đội ngũ của chúng tôi',
    subtitle: 'Một đội ngũ gắn kết – giao tiếp nhanh, làm việc minh bạch và hiệu quả.',
    roles: {
      ceo: 'Giám đốc công ty',
      salesDirector: 'Nhân viên kinh doanh, vận chuyển, thu mua',
      salesRep: 'Nhân viên kinh doanh',
      designer: 'Hành chính / thiết kế đồ họa',
      warehouseLead: 'Trưởng kho',
      regionalManager: 'Nhân viên thu mua',
    },
  },
} as const

const t = computed(() => dict[lang.value])
const peopleView = computed(() =>
  people.map(p => ({
    ...p,
    role: t.value.roles[p.roleKey],
    phoneLink: p.phone.replace(/\s+/g, ''),
  })),
)

/* posloucháme přepínač jazyka z OSNavbaru */
function onLangChange(e: any) {
  if (e?.detail?.lang === 'cz' || e?.detail?.lang === 'vn') lang.value = e.detail.lang
}

onMounted(() => {
  const saved = localStorage.getItem('lang')
  if (saved === 'cz' || saved === 'vn') lang.value = saved
  window.addEventListener('langchange', onLangChange as any)
})

onBeforeUnmount(() => {
  window.removeEventListener('langchange', onLangChange as any)
})
</script>
