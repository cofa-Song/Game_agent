<script setup lang="ts">
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'

const menuItems = [
  { name: '控制台', icon: 'dashboard', path: '/' },
  { name: '代理列表', icon: 'users', path: '/agents' },
  { name: '個人資訊', icon: 'user', path: '/profile' },
  { name: '業績統計', icon: 'bar-chart', path: '#' },
  { name: '系統設定', icon: 'settings', path: '#' },
]

// --- 推廣碼連結 ---
const promoCode = ref('VIP888')
const promoLink = ref('')
const qrCodeDataUrl = ref('')
const copied = ref(false)

onMounted(async () => {
  promoLink.value = `https://example.com/register?ref=${promoCode.value}`
  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(promoLink.value, {
      width: 180,
      margin: 2,
      color: {
        dark: '#1e293b',  // slate-800
        light: '#ffffff',
      },
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
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800">
    <!-- Logo Section -->
    <div class="p-6 flex items-center gap-3">
      <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
        V2
      </div>
      <span class="text-lg font-bold text-white tracking-tight">代理管理系統</span>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 px-4 py-4 space-y-1">
      <NuxtLink 
        v-for="item in menuItems" 
        :key="item.name"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group hover:bg-slate-800 hover:text-white"
        active-class="bg-indigo-600 !text-white shadow-md shadow-indigo-600/20"
      >
        <span class="p-1 rounded bg-slate-800 group-hover:bg-slate-700 transition-colors">
          <svg v-if="item.icon === 'dashboard'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          <svg v-else-if="item.icon === 'users'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <svg v-else-if="item.icon === 'user'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <svg v-else-if="item.icon === 'bar-chart'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.17a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </span>
        <span class="font-medium">{{ item.name }}</span>
      </NuxtLink>
    </nav>

    <!-- Promo Code QR Section -->
    <div class="p-4 bg-slate-800/50 m-4 rounded-xl space-y-3">
      <div class="text-xs text-slate-500 uppercase font-bold tracking-wider">推廣碼連結</div>
      
      <!-- QR Code -->
      <div class="flex justify-center">
        <div 
          class="p-2 bg-white rounded-xl shadow-sm relative group cursor-pointer hover:shadow-md transition-all"
          @click="downloadQRCode"
          title="點擊下載 QrCode"
        >
          <img 
            v-if="qrCodeDataUrl" 
            :src="qrCodeDataUrl" 
            alt="推廣碼 QR Code"
            class="w-32 h-32 rounded-lg"
          >
          <div v-else class="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v.01"/></svg>
          </div>
          <!-- Download overlay -->
          <div class="absolute inset-0 bg-slate-900/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          </div>
        </div>
      </div>

      <!-- Link + Copy -->
      <div class="flex items-center gap-1.5 bg-slate-900/60 rounded-lg p-2 border border-slate-700/50">
        <p class="flex-1 text-[10px] text-slate-400 truncate font-mono">{{ promoLink }}</p>
        <button 
          @click="copyLink"
          class="shrink-0 p-1.5 rounded-md transition-all"
          :class="copied ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-slate-700 text-slate-400 hover:text-slate-200'"
          :title="copied ? '已複製！' : '複製連結'"
        >
          <!-- Check Icon (copied) -->
          <svg v-if="copied" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          <!-- Copy Icon -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Any side menu styles */
</style>

