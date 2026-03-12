<script setup lang="ts">
import { ref, computed } from 'vue'
import DateRangePicker from '~/components/common/DateRangePicker.vue'

// --- Types ---
type WalletType = 'promotion' | 'commission' | 'frozen'
type TxType = 'cpa' | 'revenue' | 'promo_dist' | 'withdraw_freeze' | 'audit_deduct' | 'reject_return'

interface TxLog {
  id: string
  time: string
  walletType: WalletType
  type: TxType
  before: number
  change: number
  after: number
  modifier: string
  reason: string
}

// --- Mock Data ---
const txLogs = ref<TxLog[]>([
  {
    id: 'TXN202603120001',
    time: '2026-03-12 14:30:05',
    walletType: 'frozen',
    type: 'audit_deduct',
    before: 25000,
    change: -20000,
    after: 5000,
    modifier: 'master_admin',
    reason: '提領銷帳：憑證 #WD-A26031201'
  },
  {
    id: 'TXN202603120002',
    time: '2026-03-12 10:15:00',
    walletType: 'frozen',
    type: 'withdraw_freeze',
    before: 5000,
    change: 20000,
    after: 25000,
    modifier: 'self',
    reason: '發起提領申請 #WD-A26031201'
  },
  {
    id: 'TXN202603110045',
    time: '2026-03-11 16:45:00',
    walletType: 'commission',
    type: 'reject_return',
    before: 75000,
    change: 45000,
    after: 120000,
    modifier: 'master_admin',
    reason: '提領駁回返還：#WD-A26031145 (資訊有誤)'
  },
  {
    id: 'TXN202603100088',
    time: '2026-03-10 11:20:00',
    walletType: 'commission',
    type: 'revenue',
    before: 72000,
    change: 3000,
    after: 75000,
    modifier: 'System',
    reason: '3月10日 儲值抽成結算'
  },
  {
    id: 'TXN202603090012',
    time: '2026-03-09 18:00:00',
    walletType: 'promotion',
    type: 'promo_dist',
    before: 5000,
    change: 5000,
    after: 10000,
    modifier: 'System',
    reason: '5月份開拓市場補貼'
  },
  {
    id: 'TXN202603090005',
    time: '2026-03-09 14:10:00',
    walletType: 'commission',
    type: 'cpa',
    before: 67000,
    change: 5000,
    after: 72000,
    modifier: 'System',
    reason: 'CPA 有效玩家達標獎勵'
  }
])

// --- Filters ---
const dateStart = ref('')
const dateEnd = ref('')
const filterWallet = ref<WalletType | 'all'>('all')
const filterType = ref<TxType | 'all'>('all')

const filteredLogs = computed(() => {
  let result = txLogs.value

  if (filterWallet.value !== 'all') {
    result = result.filter(log => log.walletType === filterWallet.value)
  }

  if (filterType.value !== 'all') {
    result = result.filter(log => log.type === filterType.value)
  }

  if (dateStart.value && dateEnd.value) {
    const start = new Date(dateStart.value).getTime()
    const end = new Date(dateEnd.value).getTime() + 86400000
    result = result.filter(log => {
      const logTime = new Date(log.time).getTime()
      return logTime >= start && logTime <= end
    })
  }

  return result.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
})

// --- Modal State ---
const isModalOpen = ref(false)
const selectedLog = ref<TxLog | null>(null)

const showDetails = (log: TxLog) => {
  selectedLog.value = log
  isModalOpen.value = true
}

// --- Helpers ---
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)
}

const getWalletLabel = (type: WalletType) => {
  switch (type) {
    case 'promotion': return { label: '推廣金', class: 'text-indigo-600 bg-indigo-50 border-indigo-100' }
    case 'commission': return { label: '佣金', class: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
    case 'frozen': return { label: '凍結佣金', class: 'text-amber-600 bg-amber-50 border-amber-100' }
  }
}

const getTypeLabel = (type: TxType) => {
  const configs: Record<TxType, { label: string, icon: string }> = {
    cpa: { label: 'CPA 撥入', icon: '💰' },
    revenue: { label: '儲值抽成', icon: '📈' },
    promo_dist: { label: '推廣金派發', icon: '🎁' },
    withdraw_freeze: { label: '提領凍結', icon: '🔒' },
    audit_deduct: { label: '銷帳扣減', icon: '💸' },
    reject_return: { label: '駁回退還', icon: '↩️' }
  }
  return configs[type] || { label: '未知', icon: '❓' }
}
</script>

<template>
  <div class="max-w-[1400px] mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">錢包異動日誌</h1>
        <p class="text-sm text-slate-500 mt-1">追蹤所有錢包帳戶的資金流向，包括獎項發放、提領異動與系統結算</p>
      </div>
    </div>

    <!-- Main Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[600px]">
      
      <!-- Filters -->
      <div class="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 relative">
        <div class="flex flex-wrap items-center gap-3">
          <!-- Date Filter -->
          <DateRangePicker 
            v-model:modelValueStart="dateStart" 
            v-model:modelValueEnd="dateEnd" 
          />

          <!-- Wallet Filter -->
          <select 
            v-model="filterWallet"
            class="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
          >
            <option value="all">所有錢包</option>
            <option value="promotion">推廣金</option>
            <option value="commission">佣金</option>
            <option value="frozen">凍結佣金</option>
          </select>

          <!-- Type Filter -->
          <select 
            v-model="filterType"
            class="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
          >
            <option value="all">所有交易類型</option>
            <option value="cpa">CPA 撥入</option>
            <option value="revenue">儲值抽成</option>
            <option value="promo_dist">推廣金派發</option>
            <option value="withdraw_freeze">提領凍結</option>
            <option value="audit_deduct">銷帳扣減</option>
            <option value="reject_return">駁回退還</option>
          </select>
        </div>

        <div class="text-xs text-slate-400 font-medium whitespace-nowrap">
          共 {{ filteredLogs.length }} 筆符合條件
        </div>
      </div>

      <!-- Table -->
      <div class="flex-1 overflow-x-auto">
        <table class="w-full text-sm text-left whitespace-nowrap">
          <thead class="text-xs text-slate-500 bg-slate-50/80 uppercase border-b border-slate-200">
            <tr>
              <th class="px-6 py-4 font-bold">交易流水號 / 時間</th>
              <th class="px-6 py-4 font-bold">目標錢包</th>
              <th class="px-6 py-4 font-bold">交易類型</th>
              <th class="px-6 py-4 font-bold text-right">變更前餘額</th>
              <th class="px-6 py-4 font-bold text-right">異動金額</th>
              <th class="px-6 py-4 font-bold text-right">變更後餘額</th>
              <th class="px-6 py-4 font-bold text-center">詳情</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="filteredLogs.length === 0">
              <td colspan="7" class="px-6 py-20 text-center text-slate-400">
                <div class="flex flex-col items-center justify-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-slate-200"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
                  <p class="text-sm font-medium">查無異動紀錄</p>
                </div>
              </td>
            </tr>
            <tr 
              v-for="log in filteredLogs" 
              :key="log.id"
              class="hover:bg-slate-50/50 transition-colors group cursor-pointer"
              @click="showDetails(log)"
            >
              <td class="px-6 py-4">
                <div class="flex flex-col gap-0.5">
                  <span class="font-mono text-[11px] font-bold text-slate-800">{{ log.id }}</span>
                  <span class="text-[10px] text-slate-400 font-medium">{{ log.time }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-2 py-0.5 rounded-full text-[10px] font-black border"
                  :class="getWalletLabel(log.walletType).class"
                >
                  {{ getWalletLabel(log.walletType).label }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ getTypeLabel(log.type).icon }}</span>
                  <span class="font-bold text-slate-700">{{ getTypeLabel(log.type).label }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <span class="font-mono text-slate-500">${{ formatCurrency(log.before) }}</span>
              </td>
              <td class="px-6 py-4 text-right">
                <span 
                  class="font-black font-mono text-base"
                  :class="log.change > 0 ? 'text-emerald-500' : 'text-rose-500'"
                >
                  {{ log.change > 0 ? '+' : '' }}{{ formatCurrency(log.change) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <span class="font-black font-mono text-slate-800">${{ formatCurrency(log.after) }}</span>
              </td>
              <td class="px-6 py-4 text-center">
                <button class="p-1 px-3 text-xs font-bold text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent">
                  檢視詳情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500 flex justify-between items-center">
        <span>顯示第 1 到 {{ filteredLogs.length }} 筆資料</span>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isModalOpen && selectedLog" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="isModalOpen = false"></div>
          <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden transform transition-all border border-slate-200">
            <!-- Header -->
            <div class="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 class="text-lg font-black text-slate-800">異動詳情</h3>
              <button @click="isModalOpen = false" class="p-2 text-slate-400 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-6">
              <!-- Summary -->
              <div class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div class="flex flex-col">
                  <span class="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">交易類型</span>
                  <span class="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <span class="text-xl">{{ getTypeLabel(selectedLog.type).icon }}</span>
                    {{ getTypeLabel(selectedLog.type).label }}
                  </span>
                </div>
                <div class="text-right flex flex-col">
                  <span class="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">目標錢包</span>
                  <span 
                    class="px-2 py-0.5 rounded-full text-[10px] font-black border self-end"
                    :class="getWalletLabel(selectedLog.walletType).class"
                  >
                    {{ getWalletLabel(selectedLog.walletType).label }}
                  </span>
                </div>
              </div>

              <!-- Value Comparison -->
              <div class="grid grid-cols-1 gap-3 relative">
                <div class="flex justify-between items-center px-4 py-3 bg-white border border-slate-100 rounded-xl">
                  <span class="text-xs font-bold text-slate-500">變更前</span>
                  <span class="font-mono font-bold text-slate-700">${{ formatCurrency(selectedLog.before) }}</span>
                </div>
                
                <div class="flex justify-between items-center px-4 py-4 bg-slate-900 rounded-xl shadow-lg ring-4 ring-indigo-500/10">
                  <span class="text-xs font-bold text-indigo-300">異動金額</span>
                  <span 
                    class="font-black font-mono text-xl"
                    :class="selectedLog.change > 0 ? 'text-emerald-400' : 'text-rose-400'"
                  >
                    {{ selectedLog.change > 0 ? '+' : '' }}{{ formatCurrency(selectedLog.change) }}
                  </span>
                </div>

                <div class="flex justify-between items-center px-4 py-3 bg-white border border-slate-100 rounded-xl">
                  <span class="text-xs font-bold text-slate-500">變更後</span>
                  <span class="font-mono font-black text-indigo-600">${{ formatCurrency(selectedLog.after) }}</span>
                </div>

                <!-- Decorator Icon -->
                <div class="absolute right-[-8px] top-1/2 -translate-y-1/2 p-2 bg-indigo-500 rounded-full text-white shadow-md border-4 border-white">
                  <svg v-if="selectedLog.change > 0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                </div>
              </div>

              <!-- Meta Info -->
              <div class="space-y-4 pt-2">
                <div class="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                  <span class="text-slate-500 font-medium">交易流水號</span>
                  <span class="font-mono font-bold text-slate-800">{{ selectedLog.id }}</span>
                </div>
                <div class="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                  <span class="text-slate-500 font-medium">變更時間</span>
                  <span class="font-bold text-slate-700">{{ selectedLog.time }}</span>
                </div>
                <div class="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                  <span class="text-slate-500 font-medium">操作人員</span>
                  <span class="flex items-center gap-1.5 font-bold text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {{ selectedLog.modifier }}
                  </span>
                </div>
                <div class="space-y-1.5">
                  <span class="text-xs font-bold text-slate-500">原因 / 備註</span>
                  <div class="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-sm text-slate-700 leading-relaxed italic">
                    "{{ selectedLog.reason }}"
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-slate-50 flex justify-center">
              <button 
                @click="isModalOpen = false"
                class="w-full py-3 bg-white border border-slate-200 rounded-xl font-black text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
              >
                關閉視窗
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .bg-white,
.fade-leave-active .bg-white {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-enter-from .bg-white,
.fade-leave-to .bg-white {
  transform: scale(0.9) translateY(20px);
}
</style>
