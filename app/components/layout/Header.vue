<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value
}

const handleLogout = () => {
    // Perform logout logic (e.g., clearing tokens)
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
</script>

<template>
  <header class="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
    <!-- Left side (Empty for now or breadcrumbs) -->
    <div class="flex items-center gap-2">
      <span class="text-sm font-medium text-slate-500">首頁 / 代理管理</span>
    </div>

    <!-- Right side (Profile Area) -->
    <div class="flex items-center gap-4">
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

        <!-- Dropdown Menu -->
        <div 
          v-if="isDropdownOpen"
          class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 transition-all"
        >
          <div class="px-4 py-2 border-b border-slate-100">
            <p class="text-xs text-slate-400">登入為</p>
            <p class="text-sm font-medium text-slate-700">admin@example.com</p>
          </div>
          <button class="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            個人資料
          </button>
          <button class="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.17a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            設定
          </button>
          <div class="h-px bg-slate-100 my-1"></div>
          <button 
            @click="handleLogout"
            class="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            登出
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Any header styles */
</style>
