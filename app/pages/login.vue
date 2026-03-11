<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const username = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    alert('請輸入帳號和密碼')
    return
  }

  isLoading.value = true
  // Simulate API call
  setTimeout(() => {
    isLoading.value = false
    console.log('Login success')
    navigateTo('/agents')
  }, 1000)
}

const handleQuickLogin = () => {
  isLoading.value = true
  // Simulate developer login bypass
  setTimeout(() => {
    isLoading.value = false
    console.log('Developer Quick Login success')
    // We could set a session/store value here for "Developer" role
    navigateTo('/agents')
  }, 800)
}
</script>

<template>
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <!-- Logo/Brand -->
    <div class="flex justify-center mb-6">
      <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-indigo-600/30">
        V2
      </div>
    </div>
    <h2 class="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
      代理管理系統
    </h2>
    <p class="mt-2 text-center text-sm text-slate-600">
      請登入您的帳號以繼續
    </p>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
      <form class="space-y-6" @submit.prevent="handleLogin">
        <div>
          <label for="username" class="block text-sm font-medium text-slate-700">
            帳號
          </label>
          <div class="mt-1 relative">
            <input 
              id="username" 
              v-model="username"
              type="text" 
              required 
              class="appearance-none block w-full px-3 py-2.5 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
              placeholder="請輸入帳號"
            >
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-slate-700">
            密碼
          </label>
          <div class="mt-1 relative">
            <input 
              id="password" 
              v-model="password"
              type="password" 
              required 
              class="appearance-none block w-full px-3 py-2.5 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
              placeholder="請輸入密碼"
            >
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded-md">
            <label for="remember-me" class="ml-2 block text-sm text-slate-600">
              記住我
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">
              忘記密碼?
            </a>
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? '登入中...' : '立即登入' }}
          </button>
        </div>
      </form>

      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-100"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-slate-400 font-medium">版本 v2.0.0</span>
          </div>
        </div>

        <!-- Quick Login Action -->
        <div class="mt-6 flex flex-col items-center">
          <button 
            type="button"
            @click="handleQuickLogin"
            class="group relative w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-dashed border-cyan-200 bg-cyan-50/30 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-300 group overflow-hidden"
          >
            <!-- Animation Pulse -->
            <div class="absolute inset-0 bg-cyan-400/5 animate-pulse"></div>
            
            <div class="relative flex items-center gap-2 font-bold text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:rotate-12 transition-transform"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
              開發者快速登入 (Developer Bypass)
            </div>
          </button>
          <p class="mt-3 text-[10px] text-slate-400 font-medium">
            * 此功能僅供開發測試環境使用，快速進入後權限為：<span class="text-cyan-600 font-bold uppercase">Developer</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Any login specific styles */
</style>
