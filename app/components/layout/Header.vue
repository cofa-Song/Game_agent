```
<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '~/composables/useI18n'

const { t, locale: currentLocale, setLocale, locales } = useI18n()
const route = useRoute()

// Define emits
const emit = defineEmits(['toggle-sidebar'])

// Breadcrumb Mapping
const breadcrumbMap: Record<string, string> = {
  '/': '業績概覽',
  '/agents': '列表管理',
  '/agents/direct-players': '直屬玩家',
  '/finance': '財務管理',
  '/finance/withdrawal': '佣金提領申請',
  '/finance/audits': '下線提領審核',
  '/performance': '業績報表',
  '/reports': '報表管理中心',
  '/finance/logs': '錢包日誌',
  '/profile': '個人資料'
}

// Generate breadcrumbs based on current path
const breadcrumbs = computed(() => {
  const path = route.path
  const crumbs = [{ name: t('common.home'), path: '/' }]
  
  if (path === '/') {
    crumbs.push({ name: t('home.title'), path: '/' })
    return crumbs
  }

  const parts = path.split('/').filter(p => p !== '')
  let currentPath = ''
  
  parts.forEach((part) => {
    currentPath += `/${part}`
    
    // Manual mapping for breadcrumbs with translation keys
    let name = part
    if (currentPath === '/agents') name = '列表管理'
    if (currentPath === '/agents/direct-players') name = '直屬玩家'
    if (currentPath === '/finance') name = '財務管理'
    if (currentPath === '/finance/withdrawal') name = '佣金提領申請'
    if (currentPath === '/finance/audits') name = '下線提領審核'
    if (currentPath === '/performance') name = '業績報表'
    if (currentPath === '/reports') name = '報表管理中心'
    
    if (currentPath === '/performance' || currentPath === '/reports') {
        if (!crumbs.some(c => c.name === '數據中心')) {
            crumbs.push({ name: '數據中心', path: '#' })
        }
    }

    crumbs.push({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      path: currentPath 
    })
  })
  
  return crumbs
})

const isLangMenuOpen = ref(false)
const langMenuRef = ref<HTMLElement | null>(null)

const languages = [
  { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
]

const toggleLangMenu = () => {
  isLangMenuOpen.value = !isLangMenuOpen.value
}

const switchLanguage = (code: string) => {
  setLocale(code)
  isLangMenuOpen.value = false
}

const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value
}

const handleLogout = () => {
    navigateTo('/login')
}

const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
        isDropdownOpen.value = false
    }
    if (langMenuRef.value && !langMenuRef.value.contains(event.target as Node)) {
        isLangMenuOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

// --- Mock Global Balances ---
const globalPromotionBalance = ref(15000)
const globalCommissionBalance = ref(456800)

const formatNumber = (num: number) => new Intl.NumberFormat().format(num)
</script>

<template>
  <header class="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
    <!-- Left side: Mobile Toggle & Breadcrumbs -->
    <div class="flex items-center gap-2 md:gap-3 overflow-hidden">
      <!-- Hamburger Menu for Mobile -->
      <button 
        @click="emit('toggle-sidebar')"
        class="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      </button>

      <nav class="hidden sm:flex items-center gap-0.5 overflow-hidden">
        <div v-for="(crumb, index) in breadcrumbs" :key="crumb.path" class="flex items-center">
          <!-- Separator -->
          <svg v-if="index > 0" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="mx-1 text-slate-300 shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
          
          <NuxtLink 
            :to="crumb.path" 
            class="text-[11px] md:text-xs font-bold transition-colors shrink-0 truncate max-w-[80px] md:max-w-none"
            :class="index === breadcrumbs.length - 1 ? 'text-slate-900 pointer-events-none' : 'text-slate-400 hover:text-indigo-600'"
          >
            {{ crumb.name }}
          </NuxtLink>
        </div>
      </nav>
    </div>

    <!-- Right side (Balances & Profile Area) -->
    <div class="flex items-center gap-2 md:gap-5">
      <!-- Global Balances -->
      <div class="flex items-center gap-2 md:gap-4 mr-1 md:mr-2">
        <!-- Promotion Balance -->
        <NuxtLink to="/wallet" class="flex flex-col items-end group transition-all">
          <span class="hidden md:block text-[9px] text-slate-400 font-extrabold uppercase tracking-widest leading-tight group-hover:text-indigo-400">{{ t('common.promotion_budget') }}</span>
          <div class="flex items-center gap-1 sm:gap-1.5 cursor-pointer">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span class="text-xs sm:text-sm font-black text-slate-900 font-mono tracking-tight group-hover:text-emerald-600 transition-colors">
              ${{ formatNumber(globalPromotionBalance) }}
            </span>
          </div>
        </NuxtLink>

        <!-- Divider -->
        <div class="h-6 sm:h-8 w-px bg-slate-100"></div>

        <!-- Commission Balance -->
        <NuxtLink to="/wallet" class="flex flex-col items-end group transition-all">
          <span class="hidden md:block text-[9px] text-slate-400 font-extrabold uppercase tracking-widest leading-tight group-hover:text-indigo-400">{{ t('common.commission_balance') }}</span>
          <div class="flex items-center gap-1 sm:gap-1.5 cursor-pointer">
            <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
            <span class="text-xs sm:text-sm font-black text-slate-900 font-mono tracking-tight group-hover:text-indigo-600 transition-colors">
              ${{ formatNumber(globalCommissionBalance) }}
            </span>
          </div>
        </NuxtLink>
      </div>

      <!-- Language Selector -->
      <div class="relative" ref="langMenuRef">
        <button 
          @click="toggleLangMenu"
          class="p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <span class="text-[10px] font-black uppercase tracking-wider hidden md:block">{{ currentLocale }}</span>
        </button>

        <!-- Lang Dropdown -->
        <div 
          v-if="isLangMenuOpen"
          class="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
        >
          <button 
            v-for="lang in languages" 
            :key="lang.code"
            @click="switchLanguage(lang.code)"
            class="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors text-sm font-bold"
            :class="currentLocale === lang.code ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'"
          >
            <div class="flex items-center gap-2">
              <span class="text-base">{{ lang.flag }}</span>
              <span>{{ lang.name }}</span>
            </div>
            <svg v-if="currentLocale === lang.code" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>
      </div>

      <!-- User Profile -->
      <div class="relative" ref="dropdownRef">
        <button 
          @click="toggleDropdown"
          class="flex items-center gap-2 p-1 rounded-full hover:bg-slate-50 transition-colors focus:outline-none border border-transparent hover:border-slate-200"
        >
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
            AD
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400 transition-transform" :class="{ 'rotate-180': isDropdownOpen }"><path d="m6 9 6 6 6-6"/></svg>
        </button>

        <!-- Profile Dropdown -->
        <div 
          v-if="isDropdownOpen"
          class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 overflow-hidden"
        >
          <div class="px-4 py-3 mb-2 border-b border-slate-50">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">目前帳號</p>
            <p class="text-sm font-black text-slate-900 mt-0.5">Admin User (admin_01)</p>
          </div>
          
          <NuxtLink to="/profile" class="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            個人資料
          </NuxtLink>

          <NuxtLink to="/finance/logs" class="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
            錢包日誌
          </NuxtLink>

          <div class="h-px bg-slate-100 my-1 mx-4"></div>

          <button @click="handleLogout" class="w-full flex items-center gap-3 px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition-all font-bold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            退出登入
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
