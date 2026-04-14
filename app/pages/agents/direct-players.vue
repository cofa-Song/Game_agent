<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import PlayerSearchFilter from '~/components/common/PlayerSearchFilter.vue'
import PromotionFundModal from '~/components/common/PromotionFundModal.vue'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

// --- Interface & Data Models ---
interface PlayerData {
  id: string
  uid: string
  account: string
  name: string
  birthday: string
  phone: string
  registeredAt: string
  cumulativeDeposit: number
  cumulativeTurnover: number
  balance: {
    gold: number
    silver: number
    copper: number
  }
  accountStatus: 'normal' | 'locked' | 'frozen' | 'suspended'
  cumulativeCommission: number
  assessmentStatus: 'ongoing' | 'achieved' | 'expired'
  assessmentPeriodDays: number
  type: 'direct' | 'downline'
}

// --- Mock Data ---
const players = ref<PlayerData[]>([
  {
    id: '1',
    uid: 'P100852',
    account: 'player_john',
    name: '張小明',
    birthday: '1990-05-15',
    phone: '0912345678',
    registeredAt: '2026-03-01T10:00:00',
    cumulativeDeposit: 15000,
    cumulativeTurnover: 45000,
    balance: { gold: 1200, silver: 500, copper: 150 },
    accountStatus: 'normal',
    cumulativeCommission: 450,
    assessmentStatus: 'ongoing',
    assessmentPeriodDays: 30,
    type: 'direct'
  },
  {
    id: '2',
    uid: 'P100944',
    account: 'lucky_spinner',
    name: '李大衛',
    birthday: '1988-11-20',
    phone: '0988777321',
    registeredAt: '2026-02-15T14:30:00',
    cumulativeDeposit: 50000,
    cumulativeTurnover: 200000,
    balance: { gold: 8500, silver: 2100, copper: 0 },
    accountStatus: 'normal',
    cumulativeCommission: 1500,
    assessmentStatus: 'achieved',
    assessmentPeriodDays: 30,
    type: 'downline'
  },
  {
    id: '3',
    uid: 'P101023',
    account: 'whale_hunter88',
    name: '王小芬',
    birthday: '1995-02-14',
    phone: '0933111110',
    registeredAt: '2026-03-10T09:15:00',
    cumulativeDeposit: 2000,
    cumulativeTurnover: 3500,
    balance: { gold: 150, silver: 10, copper: 5 },
    accountStatus: 'locked',
    cumulativeCommission: 60,
    assessmentStatus: 'ongoing',
    assessmentPeriodDays: 30,
    type: 'direct'
  },
  {
    id: '4',
    uid: 'P100712',
    account: 'old_timer_99',
    name: '陳老二',
    birthday: '1970-08-08',
    phone: '0955666777',
    registeredAt: '2026-01-20T11:00:00',
    cumulativeDeposit: 1000,
    cumulativeTurnover: 1200,
    balance: { gold: 5, silver: 0, copper: 0 },
    accountStatus: 'suspended',
    cumulativeCommission: 30,
    assessmentStatus: 'expired',
    assessmentPeriodDays: 30,
    type: 'downline'
  }
])

// --- Countdown Logic ---
const currentTime = ref(new Date())
let timer: any = null

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const calculateCountdown = (registeredAt: string, periodDays: number) => {
  const regDate = new Date(registeredAt)
  const expiryDate = new Date(regDate.getTime() + periodDays * 24 * 60 * 60 * 1000)
  const diff = expiryDate.getTime() - currentTime.value.getTime()

  if (diff <= 0) return t('players.countdown_expired') as string

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  return t('players.countdown_format', { days, hours }) as string
}

// --- Privacy / Desensitization Logic ---
const isMasked = ref(true)

const maskString = (str: string, type: 'name' | 'phone' | 'birthday', playerType: 'direct' | 'downline' = 'direct') => {
  // Downline players are always masked
  if (playerType === 'downline') {
    if (!str) return ''
    if (type === 'name') {
      if (str.length <= 2) return str[0] + '*'
      return str[0] + '*'.repeat(str.length - 2) + str[str.length - 1]
    } else if (type === 'phone') {
      if (str.length < 7) return str
      return str.slice(0, 4) + '***' + str.slice(-3)
    } else if (type === 'birthday') {
      // Mask birthday for downline: YYYY-MM-DD -> ****-**-**
      return '****-**-**'
    }
  }

  // Direct players follow the isMasked toggle
  if (!isMasked.value) return str
  if (!str) return ''
  
  if (type === 'name') {
    if (str.length <= 2) return str[0] + '*'
    return str[0] + '*'.repeat(str.length - 2) + str[str.length - 1]
  } else if (type === 'phone') {
    if (str.length < 7) return str
    return str.slice(0, 4) + '***' + str.slice(-3)
  }
  return str
}

const toggleMask = () => {
  isMasked.value = !isMasked.value
}

// --- Helpers ---
const formatNumber = (num: number) => new Intl.NumberFormat().format(num)

const getAccountStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    normal: 'players.status_normal',
    locked: 'players.status_locked',
    frozen: 'players.status_frozen',
    suspended: 'players.status_suspended'
  }
  return t(map[status] || 'players.status_unknown') as string
}

const getAccountStatusClass = (status: string) => {
  switch(status) {
    case 'normal': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'locked': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'frozen': return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'suspended': return 'bg-rose-100 text-rose-700 border-rose-200'
    default: return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

const getAssessmentStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    ongoing: 'players.assessment_ongoing',
    achieved: 'players.assessment_achieved',
    expired: 'players.assessment_expired'
  }
  return t(map[status] || 'players.status_unknown') as string
}

const getAssessmentStatusClass = (status: string) => {
  switch(status) {
    case 'ongoing': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'achieved': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'expired': return 'bg-slate-100 text-slate-700 border-slate-200'
    default: return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

const getPlayerTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    direct: 'players.type_direct',
    downline: 'players.type_downline'
  }
  return t(map[type] || 'players.status_unknown') as string
}

const getPlayerTypeClass = (type: string) => {
  switch(type) {
    case 'direct': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
    case 'downline': return 'bg-orange-100 text-orange-700 border-orange-200'
    default: return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

// --- Promotion Fund Modal Logic ---
const promotionBalance = ref(15000)
const isPromotionModalShow = ref(false)
const selectedPlayerForPromotion = ref<any>(null)

const handleOpenPromotion = (player: PlayerData) => {
  selectedPlayerForPromotion.value = {
    uid: player.uid,
    account: player.account
  }
  isPromotionModalShow.value = true
}

const handlePromotionSubmit = (data: any) => {
  console.log('Promotion submitted:', data)
  promotionBalance.value -= data.twdAmount
  isPromotionModalShow.value = false
  alert(t('players.success_msg', { amount: formatNumber(data.amount), uid: data.uid }))
}

// --- Actions ---
const handleSearch = (filters: any) => {
  console.log('Search filters:', filters)
}

const handleReset = () => {
  console.log('Reset filters')
}
</script>

<template>
  <div class="space-y-4 sm:space-y-6 max-w-[1600px] mx-auto">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{{ t('players.title') }}</h1>
        <p v-if="t('players.subtitle')" class="text-xs sm:text-sm text-slate-500 mt-1">{{ t('players.subtitle') }}</p>
      </div>
    </div>

    <!-- Search Filters -->
    <PlayerSearchFilter @search="handleSearch" @reset="handleReset" />

    <!-- Data Table Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <!-- Table Header controls -->
      <div class="px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <div class="flex items-center gap-3">
          <h3 class="text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {{ t('players.search_results') }}
          </h3>
          <button 
            @click="toggleMask" 
            class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
            :title="isMasked ? t('players.tooltip_masked') as string : t('players.tooltip_unmasked') as string"
          >
            <svg v-if="isMasked" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88 3 3m6.12 11.12L3.12 20.88h17.76M21 21l-6.88-6.88M12 4.47a9 9 0 0 1 7.23 4.53m-1.2 5.07A9 9 0 0 1 4.77 12"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
        <div class="text-xs sm:text-sm text-slate-500">
          {{ t('players.total_count', { count: players.length }) }}
        </div>
      </div>
      
      <!-- Desktop Table -->
      <div class="hidden lg:block overflow-x-auto">
        <table class="w-full text-sm text-left whitespace-nowrap">
          <thead class="text-xs text-slate-500 bg-slate-50/50 uppercase border-b border-slate-200">
            <tr>
              <th scope="col" class="px-4 py-4 font-bold text-center">{{ t('players.col_uid_account') }}</th>
              <th scope="col" class="px-4 py-4 font-bold text-center">{{ t('players.col_type') }}</th>
              <th scope="col" class="px-4 py-4 font-bold">{{ t('players.col_name') }}</th>
              <th scope="col" class="px-4 py-4 font-bold">{{ t('players.col_phone') }}</th>
              <th scope="col" class="px-4 py-4 font-bold text-center">{{ t('players.col_birthday') }}</th>
              <th scope="col" class="px-4 py-4 font-bold">{{ t('players.col_registered') }}</th>
              <th scope="col" class="px-4 py-4 font-bold text-center">{{ t('players.col_assessment_status') }}</th>
              <th scope="col" class="px-4 py-4 font-bold text-center">{{ t('players.col_assessment_countdown') }}</th>
              <th scope="col" class="px-4 py-4 font-bold text-right">{{ t('players.col_deposit_turnover') }}</th>
              <th scope="col" class="px-4 py-4 font-bold text-right">{{ t('players.col_wallet_balance') }}</th>
              <th scope="col" class="px-4 py-4 font-bold text-right">{{ t('players.col_commission') }}</th>
              <th scope="col" class="px-4 py-4 font-bold text-center">{{ t('players.col_account_status') }}</th>
              <th scope="col" class="px-4 py-4 font-bold text-center sticky right-0 bg-slate-50/50 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] border-l border-slate-100">{{ t('players.col_actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="player in players" :key="player.id" class="hover:bg-slate-50/50 transition-colors group">
              <!-- UID / Account -->
              <td class="px-4 py-4 text-center">
                <div class="flex flex-col">
                  <span class="font-bold text-slate-900 tracking-tight">{{ player.uid }}</span>
                  <span class="text-xs text-slate-400 font-mono">{{ player.account }}</span>
                </div>
              </td>

              <td class="px-4 py-4 text-center">
                <span 
                  class="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold border whitespace-nowrap"
                  :class="getPlayerTypeClass(player.type)"
                >
                  {{ getPlayerTypeLabel(player.type) }}
                </span>
              </td>

              <!-- Player Name -->
              <td class="px-4 py-4 font-medium text-slate-700">
                {{ maskString(player.name, 'name', player.type) }}
              </td>

              <!-- Phone -->
              <td class="px-4 py-4 text-slate-600 font-medium">
                {{ maskString(player.phone, 'phone', player.type) }}
              </td>

              <!-- Birthday -->
              <td class="px-4 py-4 text-center text-slate-500 font-medium">
                {{ player.type === 'downline' ? '****-**-**' : player.birthday }}
              </td>

              <!-- Registration Time -->
              <td class="px-4 py-4">
                <div class="text-xs text-slate-500">
                  {{ player.registeredAt.split('T')[0] }}
                  <span class="block text-[10px] text-slate-400">{{ player.registeredAt.split('T')[1] }}</span>
                </div>
              </td>

              <!-- Assessment Status -->
              <td class="px-4 py-4 text-center">
                <span 
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border"
                  :class="getAssessmentStatusClass(player.assessmentStatus)"
                >
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" 
                    :class="player.assessmentStatus === 'ongoing' ? 'bg-blue-500' : player.assessmentStatus === 'achieved' ? 'bg-emerald-500' : 'bg-slate-400'"
                  ></span>
                  {{ getAssessmentStatusLabel(player.assessmentStatus) }}
                </span>
              </td>

              <!-- Assessment Countdown -->
              <td class="px-4 py-4 text-center">
                <div v-if="player.assessmentStatus === 'ongoing'" class="text-indigo-600 font-bold font-mono">
                  {{ calculateCountdown(player.registeredAt, player.assessmentPeriodDays) }}
                </div>
                <div v-else class="text-slate-400 text-xs">
                  -
                </div>
              </td>

              <!-- Cumulative Deposit / Turnover -->
              <td class="px-4 py-4 text-right">
                <div class="flex flex-col">
                  <span class="text-emerald-600 font-bold">${{ formatNumber(player.cumulativeDeposit) }}</span>
                  <span class="text-[10px] text-slate-400">{{ t('players.turnover_label') }}: ${{ formatNumber(player.cumulativeTurnover) }}</span>
                </div>
              </td>

              <!-- Wallet Balance (Split) -->
              <td class="px-4 py-4 text-right">
                <div class="flex items-center justify-end gap-2 text-xs font-bold">
                  <div class="flex items-center gap-1 text-amber-500" :title="t('players.coin_gold') as string">
                    <div class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
                    {{ formatNumber(player.balance.gold) }}
                  </div>
                  <div class="flex items-center gap-1 text-slate-400" :title="t('players.coin_silver') as string">
                    <div class="w-2.5 h-2.5 rounded-full bg-slate-300 shadow-[0_0_8px_rgba(203,213,225,0.5)]"></div>
                    {{ formatNumber(player.balance.silver) }}
                  </div>
                  <div class="flex items-center gap-1 text-orange-600" :title="t('players.coin_copper') as string">
                    <div class="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]"></div>
                    {{ formatNumber(player.balance.copper) }}
                  </div>
                </div>
              </td>

              <!-- Cumulative Commission -->
              <td class="px-4 py-4 text-right font-bold text-indigo-600">
                ${{ formatNumber(player.cumulativeCommission) }}
              </td>

              <!-- Account Status -->
              <td class="px-4 py-4 text-center">
                <span 
                  class="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-black border uppercase tracking-wider"
                  :class="getAccountStatusClass(player.accountStatus)"
                >
                  {{ getAccountStatusLabel(player.accountStatus) }}
                </span>
              </td>

              <!-- Action Column -->
              <td class="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-slate-50/50 transition-colors shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] border-l border-slate-100">
                <button 
                  @click="handleOpenPromotion(player)"
                  :disabled="player.type === 'downline'"
                  class="p-2.5 rounded-xl transition-all transform hover:scale-110 active:scale-95 group/btn"
                  :class="player.type === 'downline' ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50 grayscale' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'"
                  :title="player.type === 'downline' ? '' : t('players.tooltip_promotion') as string"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover/btn:rotate-12"><path d="M20 12V8H4v4"/><path d="M2 12h20"/><path d="M7 12V8"/><path d="M17 12V8"/><path d="M12 12V8"/><path d="m20 12 1 4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2l1-4"/><path d="M12 18v4"/><path d="m9 20 3 2 3-2"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card Layout -->
      <div class="lg:hidden divide-y divide-slate-100">
        <div v-for="player in players" :key="player.id" class="p-4 hover:bg-slate-50/80 transition-colors">
          <div class="flex items-start justify-between mb-3">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-slate-900 text-sm">{{ player.uid }}</span>
                <span 
                  class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap"
                  :class="getPlayerTypeClass(player.type)"
                >
                  {{ getPlayerTypeLabel(player.type) }}
                </span>
                <span 
                  class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border"
                  :class="getAssessmentStatusClass(player.assessmentStatus)"
                >
                  <span class="w-1 h-1 rounded-full mr-1 animate-pulse" 
                    :class="player.assessmentStatus === 'ongoing' ? 'bg-blue-500' : player.assessmentStatus === 'achieved' ? 'bg-emerald-500' : 'bg-slate-400'"
                  ></span>
                  {{ getAssessmentStatusLabel(player.assessmentStatus) }}
                </span>
              </div>
              <div class="text-xs text-slate-500">{{ maskString(player.name, 'name', player.type) }} · {{ maskString(player.phone, 'phone', player.type) }}</div>
              <div class="text-[10px] text-slate-400 mt-0.5 font-mono">{{ player.account }}</div>
            </div>
            <button 
              @click="handleOpenPromotion(player)"
              :disabled="player.type === 'downline'"
              class="p-2 rounded-xl transition-all"
              :class="player.type === 'downline' ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50 grayscale' : 'bg-indigo-50 text-indigo-600'"
              :title="player.type === 'downline' ? '' : t('players.tooltip_promotion') as string"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H4v4"/><path d="M2 12h20"/><path d="m20 12 1 4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2l1-4"/><path d="M12 18v4"/><path d="m9 20 3 2 3-2"/></svg>
            </button>
          </div>
          
          <!-- Assessment countdown for ongoing -->
          <div v-if="player.assessmentStatus === 'ongoing'" class="mb-3 px-3 py-1.5 bg-indigo-50 rounded-lg text-xs text-indigo-600 font-bold font-mono inline-block">
            ⏳ {{ calculateCountdown(player.registeredAt, player.assessmentPeriodDays) }}
          </div>

          <div class="flex items-center gap-4 pt-3 border-t border-slate-100">
            <div class="flex-1 text-center">
              <div class="text-[10px] text-slate-400 mb-0.5">{{ t('players.card_deposit') }}</div>
              <div class="text-sm font-bold text-emerald-600">${{ formatNumber(player.cumulativeDeposit) }}</div>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <div class="flex-1 text-center">
              <div class="text-[10px] text-slate-400 mb-0.5">{{ t('players.card_turnover') }}</div>
              <div class="text-sm font-bold text-slate-700">${{ formatNumber(player.cumulativeTurnover) }}</div>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <div class="flex-1 text-center">
              <div class="text-[10px] text-slate-400 mb-0.5">{{ t('players.card_commission') }}</div>
              <div class="text-sm font-bold text-indigo-600">${{ formatNumber(player.cumulativeCommission) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/30">
        <div class="text-xs text-slate-400 font-medium">
          {{ t('players.pagination_showing', { start: 1, end: players.length, total: players.length }) }}
        </div>
        <div class="flex items-center gap-1">
          <button class="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed bg-white" disabled>{{ t('players.pagination_prev') }}</button>
          <button class="px-3 py-1.5 text-xs font-bold border border-indigo-600 bg-indigo-600 text-white rounded-lg shadow-sm">1</button>
          <button class="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 bg-white transition-colors">{{ t('players.pagination_next') }}</button>
        </div>
      </div>
    </div>

    <!-- Promotion Fund Modal -->
    <PromotionFundModal 
      :show="isPromotionModalShow"
      mode="player"
      :player-data="selectedPlayerForPromotion"
      :promotion-balance="promotionBalance"
      @close="isPromotionModalShow = false"
      @submit="handlePromotionSubmit"
    />
  </div>
</template>

<style scoped>
/* Any specific page styles */
</style>
