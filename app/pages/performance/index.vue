<script setup lang="ts">
import { ref } from 'vue'
import PerformanceSearchFilter from '~/components/common/PerformanceSearchFilter.vue'

// --- Interface & Data Models ---
interface PerformanceData {
  id: string
  uid: string
  account: string
  name: string
  identity: 'agent' | 'player'
  cumulativeDeposit: number
  cumulativeTurnover: number
  cumulativeCommission: number
  downlineCount: number
  accountStatus: 'normal' | 'locked' | 'frozen' | 'suspended'
}

// --- Mock Data ---
const performanceRecords = ref<PerformanceData[]>([
  {
    id: '1',
    uid: 'P100852',
    account: 'player_john',
    name: '張小明',
    identity: 'player',
    cumulativeDeposit: 15000,
    cumulativeTurnover: 45000,
    cumulativeCommission: 450,
    downlineCount: 0,
    accountStatus: 'normal'
  },
  {
    id: '2',
    uid: 'A50021',
    account: 'agent_pro',
    name: '李大衛',
    identity: 'agent',
    cumulativeDeposit: 500000,
    cumulativeTurnover: 2000000,
    cumulativeCommission: 15000,
    downlineCount: 12,
    accountStatus: 'normal'
  },
  {
    id: '3',
    uid: 'P101023',
    account: 'whale_hunter88',
    name: '王小芬',
    identity: 'player',
    cumulativeDeposit: 2000,
    cumulativeTurnover: 3500,
    cumulativeCommission: 60,
    downlineCount: 0,
    accountStatus: 'locked'
  },
  {
    id: '4',
    uid: 'A50033',
    account: 'global_partner',
    name: '陳老二',
    identity: 'agent',
    cumulativeDeposit: 100000,
    cumulativeTurnover: 500000,
    cumulativeCommission: 3000,
    downlineCount: 5,
    accountStatus: 'normal'
  }
])

// --- Privacy / Desensitization Logic ---
const isMasked = ref(true)

const maskString = (str: string) => {
  if (!isMasked.value) return str
  if (!str) return ''
  if (str.length <= 2) return str[0] + '*'
  return str[0] + '*'.repeat(str.length - 2) + str[str.length - 1]
}

const toggleMask = () => {
  isMasked.value = !isMasked.value
}

// --- Helpers ---
const formatNumber = (num: number) => new Intl.NumberFormat().format(num)

const getIdentityLabel = (identity: string) => {
  return identity === 'agent' ? '代理' : '直屬玩家'
}

const getIdentityClass = (identity: string) => {
  return identity === 'agent' 
    ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
}

const getAccountStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    normal: '正常',
    locked: '鎖定',
    frozen: '凍結',
    suspended: '停權'
  }
  return map[status] || '未知'
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

// --- Actions ---
const handleSearch = (filters: any) => {
  console.log('Performance Search filters:', filters)
}

const handleReset = () => {
  console.log('Reset filters')
}
</script>

<template>
  <div class="space-y-6 max-w-[1600px] mx-auto">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">業績報表</h1>
        <p class="text-sm text-slate-500 mt-1">分析代理與直屬玩家的儲值、流水及佣金貢獻</p>
      </div>
    </div>

    <!-- Specialized Search Filters -->
    <PerformanceSearchFilter @search="handleSearch" @reset="handleReset" />

    <!-- Data Table Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <!-- Table Header controls -->
      <div class="px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <div class="flex items-center gap-3">
          <h3 class="text-base font-semibold text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
            報表數據
          </h3>
          <button 
            @click="toggleMask" 
            class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors tooltip-trigger"
            :title="isMasked ? '已脫敏 (點擊顯示資料)' : '顯示中 (點擊隱藏資料)'"
          >
            <svg v-if="isMasked" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88 3 3m6.12 11.12L3.12 20.88h17.76M21 21l-6.88-6.88M12 4.47a9 9 0 0 1 7.23 4.53m-1.2 5.07A9 9 0 0 1 4.77 12"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
        <div class="text-sm text-slate-500">
          <span>共 {{ performanceRecords.length }} 筆資料</span>
        </div>
      </div>
      
      <!-- Table wrapper -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left whitespace-nowrap">
          <thead class="text-xs text-slate-500 bg-slate-50/50 uppercase border-b border-slate-200">
            <tr>
              <th scope="col" class="px-6 py-4 font-bold text-center">UID / 帳號</th>
              <th scope="col" class="px-6 py-4 font-bold">用戶名稱</th>
              <th scope="col" class="px-6 py-4 font-bold text-center">身分</th>
              <th scope="col" class="px-6 py-4 font-bold text-right">累計儲值</th>
              <th scope="col" class="px-6 py-4 font-bold text-right">累計流水</th>
              <th scope="col" class="px-6 py-4 font-bold text-right">貢獻佣金</th>
              <th scope="col" class="px-6 py-4 font-bold text-center">下線人數</th>
              <th scope="col" class="px-6 py-4 font-bold text-center">帳號狀態</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="record in performanceRecords" :key="record.id" class="hover:bg-slate-50/50 transition-colors group">
              <!-- UID / Account -->
              <td class="px-6 py-4 text-center">
                <div class="flex flex-col">
                  <span class="font-bold text-slate-900 tracking-tight">{{ record.uid }}</span>
                  <span class="text-xs text-slate-400 font-mono">{{ record.account }}</span>
                </div>
              </td>

              <!-- Name -->
              <td class="px-6 py-4 font-medium text-slate-700">
                {{ maskString(record.name) }}
              </td>

              <!-- Identity -->
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-2.5 py-1 rounded-lg text-xs font-bold border"
                  :class="getIdentityClass(record.identity)"
                >
                  {{ getIdentityLabel(record.identity) }}
                </span>
              </td>

              <!-- Cumulative Deposit -->
              <td class="px-6 py-4 text-right font-bold text-emerald-600">
                ${{ formatNumber(record.cumulativeDeposit) }}
              </td>

              <!-- Cumulative Turnover -->
              <td class="px-6 py-4 text-right font-medium text-slate-600">
                ${{ formatNumber(record.cumulativeTurnover) }}
              </td>

              <!-- Cumulative Commission -->
              <td class="px-6 py-4 text-right font-black text-indigo-600">
                ${{ formatNumber(record.cumulativeCommission) }}
              </td>

              <!-- Downline Count -->
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <span class="text-sm font-bold text-slate-700">{{ record.downlineCount }}</span>
                  <span class="text-[10px] text-slate-400 uppercase font-bold">People</span>
                </div>
              </td>

              <!-- Account Status -->
              <td class="px-6 py-4 text-center">
                <span 
                  class="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-black border uppercase tracking-wider"
                  :class="getAccountStatusClass(record.accountStatus)"
                >
                  {{ getAccountStatusLabel(record.accountStatus) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (Mock) -->
      <div class="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/30">
        <div class="text-xs text-slate-400 font-medium">
          顯示 1 到 {{ performanceRecords.length }} 筆，共 {{ performanceRecords.length }} 筆
        </div>
        <div class="flex items-center gap-1">
          <button class="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed bg-white" disabled>上一頁</button>
          <button class="px-3 py-1.5 text-xs font-bold border border-indigo-600 bg-indigo-600 text-white rounded-lg shadow-sm">1</button>
          <button class="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 bg-white transition-colors">下一頁</button>
        </div>
      </div>
    </div>
  </div>
</template>
