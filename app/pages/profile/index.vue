<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '~/composables/useI18n'
import ProfileEditModal from '~/components/common/ProfileEditModal.vue'
import PasswordUpdateModal from '~/components/common/PasswordUpdateModal.vue'
import TwoFactorAuthModal from '~/components/common/TwoFactorAuthModal.vue'

const { t } = useI18n()

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
  accountType: 'master', // 'master' | 'level1' | 'assistant'
  superior: null as string | null,
  totalPlayers: 1250,
  totalDownlines: 48,
  phoneNumber: '0912-345-678',
  contactInfo: 'Line: @wang123',
  is2FAEnabled: false,
})

// --- Computed: Account type label ---
const accountTypeLabel = computed(() => {
  const map: Record<string, string> = {
    master: t('profile.type_master'),
    level1: t('profile.type_level1'),
    assistant: t('profile.type_assistant'),
  }
  return map[profileData.value.accountType] || profileData.value.accountType
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
  console.log('Saving profile:', data)
}

function handleUpdatePassword(data: any) {
  console.log('Updating password:', data)
  alert(t('profile.password_changed'))
}

function handleToggle2FA() {
  if (!profileData.value.is2FAEnabled) {
    is2FAModalOpen.value = true
  } else {
    if (confirm(t('profile.confirm_disable_2fa'))) {
      profileData.value.is2FAEnabled = false
    }
  }
}

function handle2FASuccess() {
  profileData.value.is2FAEnabled = true
  alert(t('profile.2fa_bound'))
}

// --- 有效玩家判定門檻 (computed for i18n reactivity) ---
const playerCriteria = computed(() => [
  { icon: 'phone', label: t('profile.criteria_phone'), value: t('profile.criteria_phone_val') },
  { icon: 'dollar', label: t('profile.criteria_deposit'), value: t('profile.criteria_deposit_val') },
  { icon: 'activity', label: t('profile.criteria_turnover'), value: t('profile.criteria_turnover_val') },
  { icon: 'clock', label: t('profile.criteria_time'), value: t('profile.criteria_time_val') },
])

// --- CPA 獎勵級距 (computed for i18n reactivity) ---
const cpaRewardTiers = computed(() => [
  {
    range: t('profile.cpa_range_1'),
    price: 600,
    status: 'active',
    statusLabel: t('profile.cpa_active'),
    progress: t('profile.cpa_progress_1'),
    current: 45,
    target: 50,
  },
  {
    range: t('profile.cpa_range_2'),
    price: 900,
    status: 'inactive',
    statusLabel: t('profile.cpa_inactive'),
    progress: '--',
    current: 0,
    target: 100,
  },
  {
    range: t('profile.cpa_range_3'),
    price: 1200,
    status: 'inactive',
    statusLabel: t('profile.cpa_inactive'),
    progress: '--',
    current: 0,
    target: null,
  },
])

// --- 儲值抽成權限 ---
const commissionRate = ref(60) // %
</script>

<template>
  <div class="space-y-6 md:space-y-8">

    <!-- Page Header -->
    <div>
      <h1 class="text-xl md:text-2xl font-bold tracking-tight text-slate-900">{{ t('profile.title') }}</h1>
      <p class="text-xs md:text-sm text-slate-500 mt-1">{{ t('profile.subtitle') }}</p>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- Section 1: 基本資訊 -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <!-- Section Header -->
      <div class="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h2 class="text-sm md:text-base font-bold text-slate-800">{{ t('profile.basic_info') }}</h2>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 sm:gap-4 flex-wrap">
          <!-- 2FA Switch -->
          <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-[10px] sm:text-xs font-bold text-slate-500 whitespace-nowrap">{{ t('profile.enable_2fa') }}</span>
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
              class="px-3 sm:px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-[10px] sm:text-xs font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              {{ t('profile.edit_profile') }}
            </button>
            <button 
              @click="isPasswordModalOpen = true"
              class="px-3 sm:px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-[10px] sm:text-xs font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              {{ t('profile.change_password') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Info Grid -->
      <div class="p-4 md:p-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <!-- UID -->
        <div class="space-y-1">
          <span class="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ t('profile.uid') }}</span>
          <p class="text-sm md:text-base font-bold text-slate-900 font-mono">{{ profileData.uid }}</p>
        </div>
        <!-- 帳號 -->
        <div class="space-y-1">
          <span class="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ t('profile.account') }}</span>
          <p class="text-sm md:text-base font-bold text-slate-900 break-all">{{ profileData.account }}</p>
        </div>
        <!-- 名稱 -->
        <div class="space-y-1">
          <span class="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ t('profile.agent_name') }}</span>
          <p class="text-sm md:text-base font-bold text-slate-900">{{ profileData.name }}</p>
        </div>
        <!-- 推廣碼 -->
        <div class="space-y-1">
          <span class="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ t('profile.promo_code') }}</span>
          <div class="flex items-center gap-2">
            <span class="px-2 sm:px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700 font-bold text-xs sm:text-sm font-mono">{{ profileData.promoCode }}</span>
          </div>
        </div>
        <!-- 帳號類型 -->
        <div class="space-y-1">
          <span class="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ t('profile.account_type') }}</span>
          <div>
            <span class="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold"
              :class="{
                'bg-amber-50 text-amber-700 border border-amber-200': profileData.accountType === 'master',
                'bg-sky-50 text-sky-700 border border-sky-200': profileData.accountType === 'level1',
                'bg-slate-100 text-slate-600 border border-slate-200': profileData.accountType === 'assistant'
              }"
            >{{ accountTypeLabel }}</span>
          </div>
        </div>
        <!-- 直接上級 -->
        <div class="space-y-1">
          <span class="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ t('profile.superior') }}</span>
          <p class="text-sm md:text-base font-bold"
            :class="profileData.superior ? 'text-slate-900' : 'text-emerald-600'"
          >
            {{ profileData.superior || t('profile.system_platform') }}
          </p>
        </div>
        <!-- 玩家總數 -->
        <div class="space-y-1">
          <span class="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ t('profile.total_players') }}</span>
          <p class="text-sm md:text-base font-bold text-slate-900">{{ profileData.totalPlayers.toLocaleString() }}</p>
        </div>
        <!-- 下線總數 -->
        <div class="space-y-1">
          <span class="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ t('profile.total_downlines') }}</span>
          <p class="text-sm md:text-base font-bold text-slate-900">{{ profileData.totalDownlines.toLocaleString() }}</p>
        </div>
        <!-- 手機號碼 -->
        <div class="space-y-1">
          <span class="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ t('profile.phone') }}</span>
          <p class="text-sm md:text-base font-bold text-slate-900">{{ profileData.phoneNumber }}</p>
        </div>
        <!-- 聯絡方式 -->
        <div class="space-y-1 col-span-2 sm:col-span-1">
          <span class="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ t('profile.contact') }}</span>
          <p class="text-sm md:text-base font-bold text-slate-900">{{ profileData.contactInfo }}</p>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- Section 2: 有效玩家判定門檻 -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex items-center gap-3">
        <div class="p-2 bg-emerald-50 rounded-xl text-emerald-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        <h2 class="text-sm md:text-base font-bold text-slate-800">{{ t('profile.criteria_title') }}</h2>
        <span class="ml-auto text-[9px] md:text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full whitespace-nowrap">{{ t('profile.criteria_note') }}</span>
      </div>

      <div class="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <div 
          v-for="(c, i) in playerCriteria" :key="i"
          class="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-slate-50/70 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all"
        >
          <div class="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-sm">
            <!-- Phone -->
            <svg v-if="c.icon === 'phone'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            <!-- Dollar -->
            <svg v-else-if="c.icon === 'dollar'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <!-- Activity -->
            <svg v-else-if="c.icon === 'activity'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>
            <!-- Clock -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <div class="min-w-0">
            <p class="text-xs md:text-sm font-bold text-slate-700">{{ c.label }}</p>
            <p class="text-[10px] md:text-xs text-slate-500 mt-0.5 font-medium">{{ c.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- Section 3: CPA 獎勵級距 -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex items-center gap-3">
        <div class="p-2 bg-amber-50 rounded-xl text-amber-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>
        </div>
        <h2 class="text-sm md:text-base font-bold text-slate-800">{{ t('profile.cpa_title') }}</h2>
        <span class="ml-auto text-[9px] md:text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full whitespace-nowrap">{{ t('profile.cpa_note') }}</span>
      </div>

      <!-- Desktop Table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50/80 text-left">
              <th class="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ t('profile.cpa_col_range') }}</th>
              <th class="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ t('profile.cpa_col_price') }}</th>
              <th class="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ t('profile.cpa_col_status') }}</th>
              <th class="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ t('profile.cpa_col_progress') }}</th>
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
                    'bg-slate-50 text-slate-400': tier.status === 'inactive'
                  }"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="{
                    'bg-emerald-500': tier.status === 'active',
                    'bg-slate-300': tier.status === 'inactive'
                  }"></span>
                  {{ tier.statusLabel }}
                </span>
              </td>
              <td class="px-6 py-4">
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

      <!-- Mobile Card Layout for CPA Tiers -->
      <div class="md:hidden p-4 space-y-3">
        <div 
          v-for="(tier, i) in cpaRewardTiers" :key="'m'+i"
          class="p-4 rounded-xl border transition-colors"
          :class="tier.status === 'active' ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50/50 border-slate-100'"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-bold text-slate-800">{{ tier.range }}</span>
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              :class="{
                'bg-emerald-100 text-emerald-700': tier.status === 'active',
                'bg-slate-100 text-slate-400': tier.status === 'inactive'
              }"
            >
              <span class="w-1 h-1 rounded-full" :class="{
                'bg-emerald-500': tier.status === 'active',
                'bg-slate-300': tier.status === 'inactive'
              }"></span>
              {{ tier.statusLabel }}
            </span>
          </div>
          <div class="text-lg font-black text-slate-900 mb-1">${{ tier.price.toLocaleString() }} <span class="text-[10px] font-bold text-slate-400">/ {{ t('profile.cpa_col_price') }}</span></div>
          <div v-if="tier.status === 'active' && tier.target" class="space-y-1.5 mt-2">
            <p class="text-[10px] font-bold text-emerald-700">{{ tier.progress }}</p>
            <div class="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden">
              <div 
                class="h-full bg-emerald-500 rounded-full transition-all duration-500"
                :style="{ width: (tier.current / tier.target * 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- Section 4: 儲值抽成權限 -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex items-center gap-3">
        <div class="p-2 bg-violet-50 rounded-xl text-violet-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
        </div>
        <h2 class="text-sm md:text-base font-bold text-slate-800">{{ t('profile.commission_title') }}</h2>
      </div>

      <div class="p-4 md:p-6">
        <div class="flex flex-col sm:flex-row items-center gap-4 md:gap-6 p-4 md:p-6 bg-violet-50/50 rounded-2xl border border-violet-100/50">
          <!-- Percentage Display -->
          <div class="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white border-2 border-violet-200 flex flex-col items-center justify-center shadow-sm">
            <span class="text-2xl md:text-3xl font-black text-violet-600">{{ commissionRate }}</span>
            <span class="text-xs font-bold text-violet-400 -mt-1">%</span>
          </div>
          <!-- Description -->
          <div class="min-w-0 text-center sm:text-left">
            <p class="text-sm md:text-base font-bold text-slate-800">{{ t('profile.commission_rate_label') }}</p>
            <p class="text-xs md:text-sm text-slate-500 mt-1 leading-relaxed">
              {{ t('profile.commission_desc') }}
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
