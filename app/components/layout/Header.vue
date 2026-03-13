<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

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
  const crumbs = [{ name: '首頁', path: '/' }]
  
  if (path === '/') {
    crumbs.push({ name: breadcrumbMap['/'], path: '/' })
    return crumbs
  }

  const parts = path.split('/').filter(p => p !== '')
  let currentPath = ''
  
  parts.forEach((part, index) => {
    currentPath += `/${part}`
    const mappedName = breadcrumbMap[currentPath]
    
    // Special handling for paths that are under categories but URLs don't reflect it
    // e.g. /performance is under '數據中心' in SideMenu
    if (currentPath === '/performance' || currentPath === '/reports') {
        if (!crumbs.some(c => c.name === '數據中心')) {
            crumbs.push({ name: '數據中心', path: '#' }) // Placeholder or category path
        }
    }

    if (mappedName) {
      crumbs.push({ name: mappedName, path: currentPath })
    } else {
      crumbs.push({ name: part.charAt(0).toUpperCase() + part.slice(1), path: currentPath })
    }
  })
  
  return crumbs
})

const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value
}

const handleLogout = () => {
    console.log('Logging out...')
    navigateTo('/login')
}

const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
        isDropdownOpen.value = false
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
  <header class="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
    <!-- Left side: Breadcrumbs -->
    <nav class="flex items-center gap-2 overflow-hidden">
      <div v-for="(crumb, index) in breadcrumbs" :key="crumb.path" class="flex items-center">
        <!-- Separator -->
        <svg v-if="index > 0" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mx-2 text-slate-300 shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
        
        <NuxtLink 
          :to="crumb.path" 
          class="text-sm font-bold transition-colors shrink-0"
          :class="index === breadcrumbs.length - 1 ? 'text-slate-900 pointer-events-none' : 'text-slate-400 hover:text-indigo-600'"
        >
          {{ crumb.name }}
        </NuxtLink>
      </div>
    </nav>

    <!-- Right side (Balances & Profile Area) -->
    <div class="flex items-center gap-6">
      <!-- Global Balances Area ... (existing code remains the same) -->
      <div class="hidden md:flex items-center gap-4">
        <NuxtLink to="/wallet" class="flex flex-col items-end group transition-all">
          <span class="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-tight group-hover:text-indigo-400">推廣預算</span>
          <div class="flex items-center gap-1.5 cursor-pointer">
            <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span class="text-sm font-black text-slate-900 font-mono tracking-tight group-hover:text-emerald-600 transition-colors">
              ${{ formatNumber(globalPromotionBalance) }}
            </span>
          </div>
        </NuxtLink>
        <div class="h-8 w-px bg-slate-100 mx-2"></div>
        <NuxtLink to="/wallet" class="flex flex-col items-end group transition-all">
          <span class="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-tight group-hover:text-indigo-400">佣金餘額</span>
          <div class="flex items-center gap-1.5 cursor-pointer">
            <div class="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
            <span class="text-sm font-black text-slate-900 font-mono tracking-tight group-hover:text-indigo-600 transition-colors">
              ${{ formatNumber(globalCommissionBalance) }}
            </span>
          </div>
        </NuxtLink>
      </div>

      <div class="relative" ref="dropdownRef">
        <button 
          @click="toggleDropdown"
          class="flex items-center gap-3 p-1 rounded-full hover:bg-slate-50 transition-colors focus:outline-none"
        >
          <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
            A
          </div>
          <span class="text-sm font-semibold text-slate-700 hidden sm:block">Admin User</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400 transition-transform" :class="{ 'rotate-180': isDropdownOpen }"><path d="m6 9 6 6 6-6"/></svg>
        </button>

        <div v-if="isDropdownOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 transition-all">
          <div class="px-4 py-2 border-b border-slate-100">
            <p class="text-xs text-slate-400">登入為</p>
            <p class="text-sm font-medium text-slate-700">admin@example.com</p>
          </div>
          <NuxtLink to="/profile" class="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            個人資料
          </NuxtLink>
          <NuxtLink to="/finance/logs" class="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
            錢包日誌
          </NuxtLink>
          <div class="h-px bg-slate-100 my-1"></div>
          <button @click="handleLogout" class="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            登出
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
