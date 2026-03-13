<script setup lang="ts">
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import { useRoute } from 'vue-router'

const route = useRoute()

// Define types for the menu
interface MenuItem {
  name: string
  icon: string
  path?: string
  isExpandable?: boolean
  children?: MenuItem[]
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

// Define the menu structure with support for nested items
const menuSections: MenuSection[] = [
  {
    title: '主要功能',
    items: [
      { name: '首頁', icon: 'dashboard', path: '/' }
    ]
  },
  {
    title: '管理中心',
    items: [
      { 
        name: '列表管理', 
        icon: 'users', 
        isExpandable: true,
        children: [
          { name: '代理列表', icon: 'users', path: '/agents' },
          { name: '直屬玩家', icon: 'users-list', path: '/agents/direct-players' }
        ]
      },
      { 
        name: '財務管理', 
        icon: 'wallet', 
        isExpandable: true,
        children: [
          { name: '佣金提領申請', icon: 'wallet', path: '/finance/withdrawal' },
          { name: '下線提領審核', icon: 'check-square', path: '/finance/audits' }
        ]
      },
      { 
        name: '數據中心', 
        icon: 'chart-pie', 
        isExpandable: true,
        children: [
          { name: '業績報表', icon: 'bar-chart', path: '/performance' },
          { name: '報表管理中心', icon: 'clipboard-list', path: '/reports' }
        ]
      }
    ]
  }
]

// Control expanded state
const expandedMenus = ref<string[]>(['列表管理', '財務管理', '數據中心']) // Default open

const toggleMenu = (name: string) => {
  if (expandedMenus.value.includes(name)) {
    expandedMenus.value = expandedMenus.value.filter(m => m !== name)
  } else {
    expandedMenus.value.push(name)
  }
}

const isExpanded = (name: string) => expandedMenus.value.includes(name)

// Check if any child of a menu is active
const isChildActive = (item: MenuItem) => {
  if (!item.children) return false
  return item.children.some((child: MenuItem) => route.path === child.path)
}

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
  <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 overflow-y-auto">
    <!-- Logo Section -->
    <div class="p-6 flex items-center gap-3 shrink-0">
      <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
        A
      </div>
      <span class="text-lg font-bold text-white tracking-tight">代理管理系統</span>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 px-4 py-4 space-y-4">
      <div v-for="section in menuSections" :key="section.title" class="space-y-1">
        <div v-for="item in section.items" :key="item.name">
            <!-- Expandable Item (First Level) -->
            <template v-if="item.isExpandable">
              <button 
                @click="toggleMenu(item.name)"
                class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group hover:bg-slate-800 hover:text-white"
                :class="{ 'text-white bg-slate-800/30': isChildActive(item) }"
              >
                <div class="flex items-center gap-3">
                  <span class="p-1 rounded bg-slate-800 group-hover:bg-slate-700 transition-colors">
                    <svg v-if="item.icon === 'users'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <svg v-else-if="item.icon === 'wallet'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a19 19 0 0 1-5 7.96V16a2 2 0 0 0-2-2"/></svg>
                    <svg v-else-if="item.icon === 'chart-pie'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                  </span>
                  <span class="font-bold text-sm tracking-tight">{{ item.name }}</span>
                </div>
                <!-- Expansion Arrow -->
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="3" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                  class="transition-transform duration-300 opacity-40 group-hover:opacity-100"
                  :class="{ 'rotate-180': isExpanded(item.name) }"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              <!-- Sub Items (Second Level) -->
              <div 
                v-show="isExpanded(item.name)" 
                class="mt-1 ml-4 border-l-2 border-slate-800 pl-2 space-y-1 overflow-hidden transition-all duration-300"
              >
                <NuxtLink 
                  v-for="child in item.children" 
                  :key="child.name"
                  :to="child.path"
                  class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group hover:bg-slate-800 hover:text-white"
                  active-class="!bg-indigo-600/10 !text-indigo-400 font-black"
                >
                  <span class="opacity-40 group-hover:opacity-100 shrink-0">
                    <svg v-if="child.icon === 'users'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    <svg v-else-if="child.icon === 'users-list'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M17 11l2 2 4-4"/></svg>
                    <svg v-else-if="child.icon === 'wallet'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3"/></svg>
                    <svg v-else-if="child.icon === 'check-square'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                    <svg v-else-if="child.icon === 'bar-chart'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
                    <svg v-else-if="child.icon === 'clipboard-list'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
                  </span>
                  <span class="text-xs tracking-tight">{{ child.name }}</span>
                </NuxtLink>
              </div>
            </template>

            <!-- Flat Item (First Level) -->
            <NuxtLink 
              v-else
              :to="item.path || '/'"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group hover:bg-slate-800 hover:text-white"
              active-class="bg-indigo-600 !text-white shadow-md shadow-indigo-600/20"
            >
              <span class="p-1 rounded bg-slate-800 group-hover:bg-slate-700 transition-colors">
                <svg v-if="item.icon === 'dashboard'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              </span>
              <span class="font-bold text-sm tracking-tight">{{ item.name }}</span>
            </NuxtLink>
          </div>
        </div>
    </nav>

    <!-- Promo Code QR Section -->
    <div class="px-4 py-6 bg-slate-800/30 shrink-0">
      <div class="bg-slate-800/50 p-4 rounded-2xl space-y-4">
        <div class="text-[10px] text-slate-500 uppercase font-black tracking-widest text-center">推廣碼連結</div>
        
        <!-- QR Code -->
        <div class="flex justify-center">
          <div 
            class="p-2 bg-white rounded-xl shadow-sm relative group cursor-pointer hover:shadow-xl transition-all"
            @click="downloadQRCode"
            title="點擊下載 QrCode"
          >
            <img 
              v-if="qrCodeDataUrl" 
              :src="qrCodeDataUrl" 
              alt="推廣碼 QR Code"
              class="w-28 h-28 rounded-lg"
            >
            <div v-else class="w-28 h-28 bg-slate-100 rounded-lg flex items-center justify-center">
              <span class="animate-pulse w-8 h-8 bg-slate-200 rounded-full"></span>
            </div>
            <!-- Download overlay -->
            <div class="absolute inset-0 bg-slate-900/60 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span class="text-[10px] text-white font-black mt-2 uppercase tracking-tighter">Download</span>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between text-[11px] font-black tracking-tight bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/50">
            <span class="text-slate-400">代碼:</span>
            <span class="text-white">{{ promoCode }}</span>
          </div>
          <button 
            @click="copyLink"
            class="w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
            :class="copied ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-95'"
          >
            <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            {{ copied ? '已複製連結' : '複製推廣連結' }}
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.router-link-active svg {
  color: #fff !important;
}
</style>
