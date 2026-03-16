<script setup lang="ts">
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import { useRoute } from 'vue-router'
import { useI18n } from '~/composables/useI18n'

const route = useRoute()
const { t } = useI18n()

// Props for mobile responsiveness
defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['toggle'])

// Define types for the menu
interface MenuItem {
  nameKey: string
  icon: string
  path?: string
  isExpandable?: boolean
  children?: MenuItem[]
}

interface MenuSection {
  titleKey: string
  items: MenuItem[]
}

// Control expanded state
const expandedSections = ref<string[]>(['menu.list_mgmt', 'menu.fin_mgmt', 'menu.data_center'])
const qrCodeDataUrl = ref('')
const copied = ref(false)
const isQrExpanded = ref(false)

// Define the menu structure
const menuSections: MenuSection[] = [
  {
    titleKey: 'menu.main',
    items: [
      { nameKey: 'menu.home', icon: 'dashboard', path: '/' }
    ]
  },
  {
    titleKey: 'menu.management',
    items: [
      { 
        nameKey: 'menu.list_mgmt', 
        icon: 'users', 
        isExpandable: true,
        children: [
          { nameKey: 'menu.agent_list', icon: 'users', path: '/agents' },
          { nameKey: 'menu.direct_players', icon: 'users-list', path: '/agents/direct-players' }
        ]
      },
      { 
        nameKey: 'menu.fin_mgmt', 
        icon: 'wallet', 
        isExpandable: true,
        children: [
          { nameKey: 'menu.withdrawal_req', icon: 'wallet', path: '/finance/withdrawal' },
          { nameKey: 'menu.downline_audit', icon: 'check-square', path: '/finance/audits' }
        ]
      },
      { 
        nameKey: 'menu.data_center', 
        icon: 'chart-pie', 
        isExpandable: true,
        children: [
          { nameKey: 'menu.performance_report', icon: 'bar-chart', path: '/performance' },
          { nameKey: 'menu.report_center', icon: 'clipboard-list', path: '/reports' }
        ]
      }
    ]
  }
]

const toggleSection = (nameKey: string) => {
  if (expandedSections.value.includes(nameKey)) {
    expandedSections.value = expandedSections.value.filter(m => m !== nameKey)
  } else {
    expandedSections.value.push(nameKey)
  }
}

const isSectionExpanded = (nameKey: string) => expandedSections.value.includes(nameKey)

// --- Promo Code ---
const promoCode = ref('VIP888')
const promoLink = ref('')

onMounted(async () => {
  promoLink.value = `https://example.com/register?ref=${promoCode.value}`
  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(promoLink.value, {
      width: 180,
      margin: 2,
      color: { dark: '#1e293b', light: '#ffffff' },
    })
  } catch (err) {
    console.error('QR Code generation failed:', err)
  }
})

async function copyLink() {
  try {
    await navigator.clipboard.writeText(promoLink.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    console.error('Failed to copy link')
  }
}

function downloadQRCode() {
  if (!qrCodeDataUrl.value) return
  const link = document.createElement('a')
  link.href = qrCodeDataUrl.value
  link.download = `promo_qrcode_${promoCode.value}.png`
  link.click()
}
</script>

<template>
  <!-- Overlay for Mobile -->
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
    @click="emit('toggle')"
  ></div>

  <aside 
    class="fixed lg:sticky top-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 transition-transform duration-300 transform"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >
    <!-- Logo Section -->
    <div class="p-8 pb-0">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
        </div>
        <div>
          <h2 class="text-lg font-black text-white tracking-tighter leading-none">{{ t('common.system_name') }}</h2>
          <p class="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Agent Portal</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-4 space-y-3 overflow-y-auto custom-scrollbar">
      <div v-for="section in menuSections" :key="section.titleKey" class="mb-2">
        <div class="space-y-1 px-3">
          <div v-for="item in section.items" :key="item.nameKey">
            <!-- Expandable Item -->
            <div v-if="item.isExpandable">
              <button 
                @click="toggleSection(item.nameKey)"
                class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden"
                :class="isSectionExpanded(item.nameKey) ? 'bg-slate-800/50 text-white' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'"
              >
                <div class="flex items-center gap-3 relative z-10">
                  <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-slate-700/50">
                    <svg v-if="item.icon === 'users'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <svg v-else-if="item.icon === 'wallet'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a19 19 0 0 1-5 7.96V16a2 2 0 0 0-2-2"/></svg>
                    <svg v-else-if="item.icon === 'chart-pie'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                  </div>
                  <span class="text-sm font-bold tracking-wide">{{ t(item.nameKey) }}</span>
                </div>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" height="14" 
                  viewBox="0 0 24 24" fill="none" 
                  stroke="currentColor" stroke-width="3" 
                  stroke-linecap="round" stroke-linejoin="round"
                  class="transition-transform duration-300 text-slate-600"
                  :class="{ 'rotate-180 text-indigo-400': isSectionExpanded(item.nameKey) }"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              <!-- Children -->
              <div 
                v-show="isSectionExpanded(item.nameKey)"
                class="mt-1 space-y-1 overflow-hidden transition-all duration-300"
              >
                <NuxtLink 
                  v-for="child in item.children" 
                  :key="child.path"
                  :to="child.path || '/'"
                  class="flex items-center gap-3 pl-14 pr-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                  :class="route.path === child.path ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/20'"
                >
                  {{ t(child.nameKey) }}
                </NuxtLink>
              </div>
            </div>

            <!-- Simple Link -->
            <NuxtLink 
              v-else
              :to="item.path || '/'"
              @click="emit('toggle')"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden"
              :class="route.path === item.path ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'"
            >
              <div class="flex items-center gap-3 relative z-10">
                <div 
                  class="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg"
                  :class="route.path === item.path ? 'bg-white/20' : 'bg-slate-800 border border-slate-700/50'"
                >
                  <svg v-if="item.icon === 'dashboard'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                </div>
                <span class="text-sm font-bold tracking-wide">{{ t(item.nameKey) }}</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- QR Code Section -->
    <div class="px-6 pb-6 pt-2 mt-auto border-t border-slate-800/50 bg-slate-900 sticky bottom-0 z-20">
      <!-- Toggle Button for Mobile -->
      <button 
        @click="isQrExpanded = !isQrExpanded"
        class="md:hidden w-full flex items-center justify-between py-3 text-slate-400 font-bold text-xs uppercase tracking-widest"
      >
        <span class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="4" height="4" x="3" y="3" rx="1"/><rect width="4" height="4" x="17" y="3" rx="1"/><rect width="4" height="4" x="17" y="17" rx="1"/><rect width="4" height="4" x="3" y="17" rx="1"/><rect width="4" height="4" x="10" y="10" rx="1"/><rect width="4" height="4" x="10" y="3" rx="1"/><rect width="4" height="4" x="10" y="17" rx="1"/><rect width="4" height="4" x="17" y="10" rx="1"/><rect width="4" height="4" x="3" y="10" rx="1"/></svg>
          {{ t('common.promo_link') }}
        </span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" height="16" 
          viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" stroke-width="2" 
          stroke-linecap="round" stroke-linejoin="round"
          class="transition-transform duration-300"
          :class="isQrExpanded ? 'rotate-180' : ''"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <!-- Expandable Content -->
      <div 
        class="bg-slate-800/50 p-4 rounded-2xl space-y-4 md:block overflow-hidden transition-all duration-300"
        :class="isQrExpanded ? 'max-h-[300px] opacity-100 mt-2' : 'max-h-0 opacity-0 md:max-h-[300px] md:opacity-100 md:mt-4 p-0 md:p-4 border-0 pb-0 md:pb-4 mb-2 md:mb-0'"
      >
        <div class="hidden md:block text-[10px] text-slate-500 uppercase font-black tracking-widest text-center">{{ t('common.promo_link') }}</div>
        <div class="flex justify-center">
          <div 
            class="p-2 bg-white rounded-xl shadow-sm cursor-pointer hover:shadow-xl transition-all"
            @click="downloadQRCode"
          >
            <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" class="w-24 h-24 rounded-lg">
          </div>
        </div>
        <button 
          @click="copyLink"
          class="w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
          :class="copied ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'"
        >
          {{ copied ? t('common.copied') : t('common.copy_link') }}
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 10px;
}
</style>
