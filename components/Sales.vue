<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'

type Lang = 'cz' | 'vn'
const lang = ref<Lang>('cz')

function onLangChange (e: any) {
  const l =
    e?.detail?.lang ??
    (typeof window !== 'undefined' ? localStorage.getItem('lang') : null)
  if (l === 'cz' || l === 'vn') lang.value = l
}

onMounted(() => {
  const saved = localStorage.getItem('lang')
  if (saved === 'cz' || saved === 'vn') lang.value = saved
  window.addEventListener('langchange', onLangChange)
})
onBeforeUnmount(() => window.removeEventListener('langchange', onLangChange))

const t = {
  cz: {
    h2: 'Zaujala vás naše nabídka spolupráce?',
    p:  'Napište nám a probereme to.',
    first: 'Jméno',
    last:  'Příjmení',
    company: 'Společnost',
    email: 'E-mail',
    phone: 'Telefonní číslo',
    message: 'Zpráva',
    consent: 'Zaškrtnutím souhlasíte se zpracováním',
    consentLink: 'osobních údajů',
    submit: 'Odeslat',
    sending: 'Odesílám…',
    ok: 'Děkujeme! Ozveme se vám.',
    err: 'Omlouváme se, něco se pokazilo. Zkuste to prosím znovu.',
  },
  vn: {
    h2: 'Bạn quan tâm đến hợp tác?',
    p:  'Hãy nhắn cho chúng tôi — cùng trao đổi chi tiết.',
    first: 'Tên',
    last:  'Họ',
    company: 'Công ty',
    email: 'E-mail',
    phone: 'Số điện thoại',
    message: 'Tin nhắn',
    consent: 'Bằng việc đánh dấu, bạn đồng ý việc xử lý',
    consentLink: 'dữ liệu cá nhân',
    submit: 'Gửi',
    sending: 'Đang gửi…',
    ok: 'Cảm ơn bạn! Chúng tôi sẽ liên hệ.',
    err: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại.',
  }
} as const

const sending = ref(false)
const sent = ref<null | 'ok' | 'err'>(null)

const form = reactive<{
  first: string
  last: string
  company: string
  email: string
  phone: string
  message: string
  website: string // honeypot
}>({
  first: '',
  last: '',
  company: '',
  email: '',
  phone: '',
  message: '',
  website: ''
})

// helper: URL-encode objekt na x-www-form-urlencoded
function encode(data: Record<string, string>) {
  return Object.keys(data)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k] ?? ''))
    .join('&')
}

async function onSubmit() {
  sent.value = null

  // jednoduchá validace
  if (!form.first || !form.last || !form.email || !form.message) {
    sent.value = 'err'
    return
  }

  // honeypot
  if (form.website) {
    sent.value = 'ok'
    return
  }

  sending.value = true
  try {
    const body = encode({
      'form-name': 'sales',
      first: form.first,
      last: form.last,
      company: form.company,
      email: form.email,
      phone: form.phone,
      message: form.message,
      website: form.website,
    })

    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    })

    if (res.ok) {
      sent.value = 'ok'
      form.first = ''
      form.last = ''
      form.company = ''
      form.email = ''
      form.phone = ''
      form.message = ''
      form.website = ''
    } else {
      sent.value = 'err'
    }
  } catch {
    sent.value = 'err'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <section id="sales" class="relative isolate bg-gray-100 px-6 py-24 sm:py-32 lg:px-8 dark:bg-gray-900">
    <!-- SKRYTÝ skeleton pro Netlify detekci -->
    <form name="sales" netlify netlify-honeypot="website" hidden>
      <input type="text" name="first" />
      <input type="text" name="last" />
      <input type="text" name="company" />
      <input type="email" name="email" />
      <input type="tel" name="phone" />
      <textarea name="message"></textarea>
      <input type="text" name="website" />
    </form>

    <!-- Dekorativní blob -->
    <div class="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu blur-3xl sm:-top-80" aria-hidden="true">
      <div
        class="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg]
               bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]
               dark:opacity-20"
        style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
      />
    </div>

    <!-- Nadpisy -->
    <div class="mx-auto max-w-2xl text-center">
      <h2 class="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
        {{ t[lang].h2 }}
      </h2>
      <p class="mt-2 text-lg/8 text-gray-600 dark:text-gray-400">{{ t[lang].p }}</p>
    </div>

    <!-- Viditelný formulář řízený Vue -->
    <form class="mx-auto mt-16 max-w-xl sm:mt-20" @submit.prevent="onSubmit" novalidate data-netlify="true">
      <div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <div>
          <label for="first" class="block text-sm/6 font-semibold text-gray-900 dark:text-white">
            {{ t[lang].first }}
          </label>
          <div class="mt-2.5">
            <input
              id="first" name="first" v-model="form.first" type="text" autocomplete="given-name"
              class="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
            />
          </div>
        </div>

        <div>
          <label for="last" class="block text-sm/6 font-semibold text-gray-900 dark:text-white">
            {{ t[lang].last }}
          </label>
          <div class="mt-2.5">
            <input
              id="last" name="last" v-model="form.last" type="text" autocomplete="family-name"
              class="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
            />
          </div>
        </div>

        <div class="sm:col-span-2">
          <label for="company" class="block text-sm/6 font-semibold text-gray-900 dark:text-white">
            {{ t[lang].company }}
          </label>
          <div class="mt-2.5">
            <input
              id="company" name="company" v-model="form.company" type="text" autocomplete="organization"
              class="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
            />
          </div>
        </div>

        <div class="sm:col-span-2">
          <label for="email" class="block text-sm/6 font-semibold text-gray-900 dark:text-white">
            {{ t[lang].email }}
          </label>
          <div class="mt-2.5">
            <input
              id="email" name="email" v-model="form.email" type="email" autocomplete="email"
              class="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
            />
          </div>
        </div>

        <div class="sm:col-span-2">
          <label for="phone" class="block text-sm/6 font-semibold text-gray-900 dark:text-white">
            {{ t[lang].phone }}
          </label>
          <div class="mt-2.5">
            <div
              class="flex rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[:focus-within]:outline has-[:focus-within]:outline-2 has-[:focus-within]:-outline-offset-2 has-[:focus-within]:outline-indigo-600 dark:bg-white/5 dark:outline-white/10 dark:has-[:focus-within]:outline-indigo-500"
            >
              <input
                id="phone" name="phone" v-model="form.phone" type="tel" inputmode="tel" autocomplete="tel"
                class="block min-w-0 grow py-1.5 pl-3 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 dark:bg-transparent dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>

        <div class="sm:col-span-2">
          <label for="message" class="block text-sm/6 font-semibold text-gray-900 dark:text-white">
            {{ t[lang].message }}
          </label>
          <div class="mt-2.5">
            <textarea
              id="message" name="message" v-model="form.message" rows="4"
              class="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
            ></textarea>
          </div>
        </div>

        <!-- Honeypot -->
        <input
          type="text"
          v-model="form.website"
          name="website"
          class="hidden"
          tabindex="-1"
          autocomplete="off"
          aria-hidden="true"
        />

        <div class="flex gap-x-4 sm:col-span-2">
          <div class="flex h-6 items-center">
            <div
              class="group relative inline-flex w-8 shrink-0 rounded-full bg-gray-200 p-px outline-offset-2 outline-gray-600 ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out has-[:checked]:bg-gray-600 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 dark:bg-white/5 dark:outline-indigo-500 dark:ring-white/10 dark:has-[:checked]:bg-indigo-500"
            >
              <span
                class="size-4 rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-[:checked]:translate-x-3.5"
              />
              <input type="checkbox" class="absolute inset-0 appearance-none focus:outline-none" id="agree-to-policies" name="agree-to-policies" />
            </div>
          </div>
          <label class="text-sm/6 text-gray-600 dark:text-gray-400" for="agree-to-policies">
            {{ t[lang].consent }}
            <a href="#" class="whitespace-nowrap font-semibold text-indigo-600 dark:text-indigo-400">
              {{ t[lang].consentLink }}
            </a>.
          </label>
        </div>
      </div>

      <div class="mt-10">
        <button
          type="submit"
          :disabled="sending"
          class="block w-full rounded-md bg-brand-orange px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm
                 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed
                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 dark:bg-brand-orange"
        >
          {{ sending ? t[lang].sending : t[lang].submit }}
        </button>

        <p v-if="sent==='ok'" class="mt-4 text-center text-sm text-green-600 dark:text-green-400" aria-live="polite">
          {{ t[lang].ok }}
        </p>
        <p v-else-if="sent==='err'" class="mt-4 text-center text-sm text-red-600 dark:text-red-400" aria-live="polite">
          {{ t[lang].err }}
        </p>
      </div>
    </form>
  </section>
</template>
