<script setup lang="ts">
import ProfileEditModal from '~/components/common/ProfileEditModal.vue'
import PasswordUpdateModal from '~/components/common/PasswordUpdateModal.vue'
import TwoFactorAuthModal from '~/components/common/TwoFactorAuthModal.vue'
/**
 * 個人資訊頁面 (Profile Page)
 * 顯示當前登入代理的基本資訊、CPA 獎勵級距、有效玩家門檻與儲值抽成。
 */

// --- Mock Data: 當前登入代理的個人資訊 ---
const profileData = ref({
  uid: 'AG-10001',
  account: 'master_agent',
  name: '王大明',
  promoCode: 'VIP888',
  accountType: '總代理',
  superior: null as string | null, // null = 總代理，顯示「系統平台」
  totalPlayers: 1250,
  totalDownlines: 48,
  phoneNumber: '0912-345-678',
  contactInfo: 'Line: @wang123',
  is2FAEnabled: false,
})

// --- Modal States ---
const isEditModalOpen = ref(false)
const isPasswordModalOpen = ref(false)
const is2FAModalOpen = ref(false)

// --- Handlers ---
function handleSaveProfile(data: any) {
  profileData.value.name = data.name
  profileData.value.phoneNumber = data.phoneNumber
  profileData.value.contactInfo = data.contactInfo
  // In a real app, you would call an API here
  console.log('Saving profile:', data)
}

function handleUpdatePassword(data: any) {
  // In a real app, you would call an API here
  console.log('Updating password:', data)
  alert('密碼已成功修改！')
}

function handleToggle2FA() {
  if (!profileData.value.is2FAEnabled) {
    // If turning ON, open binding modal
    is2FAModalOpen.value = true
  } else {
    // If turning OFF, could add a confirmation or just turn off
    if (confirm('確定要關閉 2FA 雙重驗證嗎？這將降低您的帳號安全性。')) {
      profileData.value.is2FAEnabled = false
    }
  }
}

function handle2FASuccess() {
  profileData.value.is2FAEnabled = true
  alert('2FA 雙重驗證已成功綁定！')
}

// --- 有效玩家判定門檻 ---
const playerCriteria = [
  { icon: 'phone', label: '完成手機號驗證', value: '必須完成' },
  { icon: 'dollar', label: '累計首儲', value: '≥ $1,000' },
  { icon: 'activity', label: '全局流水', value: '≥ $3,000' },
  { icon: 'clock', label: '考核時效', value: '註冊後 30 天內完成' },
]

// --- CPA 獎勵級距 ---
const cpaRewardTiers = ref([
  {
    range: '01 - 50 人',
    price: 600,
    status: 'active',       // 'active' | 'locked' | 'inactive'
    statusLabel: '當前適用',
    progress: '已達成 45 人，還差 5 人',
    current: 45,
    target: 50,
  },
  {
    range: '51 - 100 人',
    price: 900,
    status: 'locked',
    statusLabel: '未鎖定',
    progress: '--',
    current: 0,
    target: 100,
  },
  {
    range: '101 人以上',
    price: 1200,
    status: 'inactive',
    statusLabel: '未達標',
    progress: '--',
    current: 0,
    target: null,
  },
])

// --- 儲值抽成權限 ---
const commissionRate = ref(60) // %
</script>

<template>
  <div class="space-y-8">

    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">個人資訊</h1>
      <p class="text-sm text-slate-500 mt-1">查看您的帳號資料、CPA 獎勵配置與抽成權限</p>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- Section 1: 基本資訊 -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <!-- Section Header -->
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h2 class="text-base font-bold text-slate-800">基本資訊</h2>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-4">
          <!-- 2FA Switch -->
          <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-bold text-slate-500">開啟 2FA</span>
            <button 
              @click="handleToggle2FA"
              class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="profileData.is2FAEnabled ? 'bg-indigo-600' : 'bg-slate-200'"
            >
              <span 
                class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="profileData.is2FAEnabled ? 'translate-x-4' : 'translate-x-0'"
              />
            </button>
          </div>

          <!-- Edit & Password -->
          <div class="flex items-center gap-2">
            <button 
              @click="isEditModalOpen = true"
              class="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              編輯資料
            </button>
            <button 
              @click="isPasswordModalOpen = true"
              class="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              修改密碼
            </button>
          </div>
        </div>
      </div>

      <!-- Info Grid -->
      <div class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- UID -->
        <div class="space-y-1">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">代理 UID</span>
          <p class="text-base font-bold text-slate-900 font-mono">{{ profileData.uid }}</p>
        </div>
        <!-- 帳號 -->
        <div class="space-y-1">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">登入帳號</span>
          <p class="text-base font-bold text-slate-900">{{ profileData.account }}</p>
        </div>
        <!-- 名稱 -->
        <div class="space-y-1">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">代理名稱</span>
          <p class="text-base font-bold text-slate-900">{{ profileData.name }}</p>
        </div>
        <!-- 推廣碼 -->
        <div class="space-y-1">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">推廣碼</span>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700 font-bold text-sm font-mono">{{ profileData.promoCode }}</span>
          </div>
        </div>
        <!-- 帳號類型 -->
        <div class="space-y-1">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">帳號類型</span>
          <div>
            <span class="px-3 py-1 rounded-full text-xs font-bold"
              :class="{
                'bg-amber-50 text-amber-700 border border-amber-200': profileData.accountType === '總代理',
                'bg-sky-50 text-sky-700 border border-sky-200': profileData.accountType === '一級代理',
                'bg-slate-100 text-slate-600 border border-slate-200': profileData.accountType === '助理帳號'
              }"
            >{{ profileData.accountType }}</span>
          </div>
        </div>
        <!-- 直接上級 -->
        <div class="space-y-1">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">直接上級</span>
          <p class="text-base font-bold"
            :class="profileData.superior ? 'text-slate-900' : 'text-emerald-600'"
          >
            {{ profileData.superior || '系統平台' }}
          </p>
        </div>
        <!-- 玩家總數 -->
        <div class="space-y-1">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">玩家總數</span>
          <p class="text-base font-bold text-slate-900">{{ profileData.totalPlayers.toLocaleString() }}</p>
        </div>
        <!-- 下線總數 -->
        <div class="space-y-1">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">下線總數</span>
          <p class="text-base font-bold text-slate-900">{{ profileData.totalDownlines.toLocaleString() }}</p>
        </div>
        <!-- 手機號碼 -->
        <div class="space-y-1">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">手機號碼</span>
          <p class="text-base font-bold text-slate-900">{{ profileData.phoneNumber }}</p>
        </div>
        <!-- 聯絡方式 -->
        <div class="space-y-1">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">聯絡方式</span>
          <p class="text-base font-bold text-slate-900">{{ profileData.contactInfo }}</p>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- Section 2: 有效玩家判定門檻 -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div class="p-2 bg-emerald-50 rounded-xl text-emerald-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        <h2 class="text-base font-bold text-slate-800">有效玩家判定門檻</h2>
        <span class="ml-auto text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">所有條件皆須滿足</span>
      </div>

      <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div 
          v-for="(c, i) in playerCriteria" :key="i"
          class="flex items-start gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all"
        >
          <div class="shrink-0 w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-sm">
            <!-- Phone -->
            <svg v-if="c.icon === 'phone'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            <!-- Dollar -->
            <svg v-else-if="c.icon === 'dollar'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <!-- Activity -->
            <svg v-else-if="c.icon === 'activity'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>
            <!-- Clock -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-bold text-slate-700">{{ c.label }}</p>
            <p class="text-xs text-slate-500 mt-0.5 font-medium">{{ c.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- Section 3: CPA 獎勵級距 -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div class="p-2 bg-amber-50 rounded-xl text-amber-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>
        </div>
        <h2 class="text-base font-bold text-slate-800">CPA 獎勵級距</h2>
        <span class="ml-auto text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">當月累積 · 唯一達標制</span>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50/80 text-left">
              <th class="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">達標人數級距 (當月累積)</th>
              <th class="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">CPA 單價 (每人)</th>
              <th class="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">狀態</th>
              <th class="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">距離下一級距進度</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="(tier, i) in cpaRewardTiers" :key="i"
              class="transition-colors"
              :class="tier.status === 'active' ? 'bg-emerald-50/40' : 'hover:bg-slate-50/50'"
            >
              <td class="px-6 py-4">
                <span class="text-sm font-bold text-slate-800">{{ tier.range }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-lg font-black text-slate-900">${{ tier.price.toLocaleString() }}</span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  :class="{
                    'bg-emerald-100 text-emerald-700': tier.status === 'active',
                    'bg-slate-100 text-slate-500': tier.status === 'locked',
                    'bg-slate-50 text-slate-400': tier.status === 'inactive'
                  }"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="{
                    'bg-emerald-500': tier.status === 'active',
                    'bg-slate-400': tier.status === 'locked',
                    'bg-slate-300': tier.status === 'inactive'
                  }"></span>
                  {{ tier.statusLabel }}
                </span>
              </td>
              <td class="px-6 py-4">
                <!-- Active tier shows progress bar -->
                <div v-if="tier.status === 'active' && tier.target" class="space-y-1.5">
                  <p class="text-xs font-bold text-emerald-700">{{ tier.progress }}</p>
                  <div class="w-full max-w-[180px] h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      :style="{ width: (tier.current / tier.target * 100) + '%' }"
                    ></div>
                  </div>
                </div>
                <span v-else class="text-sm text-slate-400">--</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- Section 4: 儲值抽成權限 -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div class="p-2 bg-violet-50 rounded-xl text-violet-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
        </div>
        <h2 class="text-base font-bold text-slate-800">儲值抽成權限</h2>
      </div>

      <div class="p-6">
        <div class="flex items-center gap-6 p-6 bg-violet-50/50 rounded-2xl border border-violet-100/50">
          <!-- Percentage Display -->
          <div class="shrink-0 w-24 h-24 rounded-2xl bg-white border-2 border-violet-200 flex flex-col items-center justify-center shadow-sm">
            <span class="text-3xl font-black text-violet-600">{{ commissionRate }}</span>
            <span class="text-xs font-bold text-violet-400 -mt-1">%</span>
          </div>
          <!-- Description -->
          <div class="min-w-0">
            <p class="text-base font-bold text-slate-800">您的抽成比例</p>
            <p class="text-sm text-slate-500 mt-1 leading-relaxed">
              此為平台分配給您的儲值抽成資源百分比。您可將此比例的部分或全部分配給您的直屬下線代理。
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ProfileEditModal 
      :show="isEditModalOpen" 
      :initial-data="{
        name: profileData.name,
        phoneNumber: profileData.phoneNumber,
        contactInfo: profileData.contactInfo
      }"
      @close="isEditModalOpen = false"
      @save="handleSaveProfile"
    />

    <PasswordUpdateModal 
      :show="isPasswordModalOpen" 
      @close="isPasswordModalOpen = false"
      @save="handleUpdatePassword"
    />

    <TwoFactorAuthModal
      :show="is2FAModalOpen"
      @close="is2FAModalOpen = false"
      @success="handle2FASuccess"
    />

  </div>
</template>

<style scoped>
/* Profile page specific styles */
</style>
