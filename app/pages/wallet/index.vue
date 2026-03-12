<script setup lang="ts">
import { ref, computed } from 'vue'

// --- Mock Wallet Balances ---
const promoBalance = ref(150000)
const commissionBalance = ref({
  totalActive: 456800, // Available to withdraw
  cpaTotal: 300000,
  depositTotal: 156800,
  frozen: 12500 // SAL-503/504 pending
})

// --- Mock Transactions (Last 10) ---
// Types: 佣金入帳-CPA獎金 (cpa_income), 佣金入帳-儲值抽成 (deposit_income), 上級派發 (superior_incoming), 提領支出 (withdrawal), 銷帳扣減 (clearance_deduct)
const recentTransactions = ref([
  { id: 'TXN-1001', date: '2026-03-12 10:15', type: 'cpa_income', typeLabel: '佣金入帳-CPA獎金', amount: 600, balance: 456800, remark: 'UID: PL-59281', walletType: 'commission', walletLabel: '佣金錢包' },
  { id: 'TXN-1002', date: '2026-03-11 16:30', type: 'deposit_income', typeLabel: '佣金入帳-儲值抽成', amount: 350, balance: 456200, remark: '來源: Agent-03' , walletType: 'commission', walletLabel: '佣金錢包' },
  { id: 'TXN-1003', date: '2026-03-10 09:00', type: 'withdrawal', typeLabel: '提領支出', amount: -50000, balance: 455850, remark: '銀行轉帳' , walletType: 'commission', walletLabel: '佣金錢包' },
  { id: 'TXN-1004', date: '2026-03-09 14:20', type: 'superior_incoming', typeLabel: '上級派發', amount: 20000, balance: 505850, remark: '推廣活動補助' , walletType: 'promo', walletLabel: '推廣金錢包' },
  { id: 'TXN-1005', date: '2026-03-08 19:45', type: 'clearance_deduct', typeLabel: '銷帳扣減', amount: -12500, balance: 485850, remark: '審核通過扣減' , walletType: 'commission', walletLabel: '佣金錢包' },
  { id: 'TXN-1006', date: '2026-03-08 11:10', type: 'cpa_income', typeLabel: '佣金入帳-CPA獎金', amount: 600, balance: 498350, remark: 'UID: PL-91283' , walletType: 'commission', walletLabel: '佣金錢包' },
  { id: 'TXN-1007', date: '2026-03-07 15:55', type: 'deposit_income', typeLabel: '佣金入帳-儲值抽成', amount: 1200, balance: 497750, remark: '來源: Agent-01' , walletType: 'commission', walletLabel: '佣金錢包' },
  { id: 'TXN-1008', date: '2026-03-06 08:30', type: 'cpa_income', typeLabel: '佣金入帳-CPA獎金', amount: 600, balance: 496550, remark: 'UID: PL-33821' , walletType: 'commission', walletLabel: '佣金錢包' },
  { id: 'TXN-1009', date: '2026-03-05 17:15', type: 'withdrawal', typeLabel: '提領支出', amount: -30000, balance: 495950, remark: 'USDT 提領' , walletType: 'commission', walletLabel: '佣金錢包' },
  { id: 'TXN-1010', date: '2026-03-04 10:00', type: 'superior_incoming', typeLabel: '上級派發', amount: 50000, balance: 525950, remark: '新月度預算' , walletType: 'promo', walletLabel: '推廣金錢包' },
])

// Utility function to format currency
const formatCurr = (val: number) => {
  return new Intl.NumberFormat('en-US').format(val)
}

// Icon mapping based on transaction type
const getTxnIcon = (type: string) => {
  switch (type) {
    case 'cpa_income': return { i: 'target', color: 'text-emerald-500', bg: 'bg-emerald-50' }
    case 'deposit_income': return { i: 'trending-up', color: 'text-indigo-500', bg: 'bg-indigo-50' }
    case 'superior_incoming': return { i: 'download', color: 'text-sky-500', bg: 'bg-sky-50' }
    case 'withdrawal': return { i: 'upload', color: 'text-rose-500', bg: 'bg-rose-50' }
    case 'clearance_deduct': return { i: 'x-circle', color: 'text-amber-500', bg: 'bg-amber-50' }
    default: return { i: 'circle', color: 'text-slate-500', bg: 'bg-slate-50' }
  }
}
</script>

<template>
  <div class="space-y-8">
    
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">錢包概覽</h1>
      <p class="text-sm text-slate-500 mt-1">查看推廣金與佣金餘額，以及近期收支明細</p>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- Section A: Wallet Cards -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- Card 1: Promo Wallet -->
      <div class="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
        <!-- Decorative bg -->
        <div class="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div class="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-900/30 rounded-full blur-2xl"></div>
        
        <div class="relative z-10 flex items-center justify-between">
          <div class="flex items-center gap-2 text-indigo-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>
            <span class="font-bold tracking-wide">推廣金錢包</span>
          </div>
          <button class="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm" title="派發紅包">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>

        <div class="relative z-10 space-y-1">
          <p class="text-indigo-200 text-sm font-medium">可用餘額 (TWD)</p>
          <p class="text-4xl font-black tracking-tight tabular-nums">
            <span class="text-2xl text-indigo-300 mr-1">$</span>{{ formatCurr(promoBalance) }}
          </p>
        </div>
      </div>

      <!-- Card 2: Commission Wallet -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between min-h-[220px]">
        
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2 text-slate-700">
            <div class="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <span class="font-bold tracking-wide text-lg">佣金錢包</span>
          </div>
          <NuxtLink 
            to="/finance/withdrawal"
            class="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-colors"
          >
            申請提領
          </NuxtLink>
        </div>

        <div class="mb-5 space-y-1">
          <p class="text-slate-500 text-sm font-medium">可提領累計收益</p>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl text-slate-400 font-bold">$</span>
            <span class="text-3xl font-black text-slate-900 tabular-nums">{{ formatCurr(commissionBalance.totalActive) }}</span>
          </div>
        </div>

        <!-- Breakdown & Frozen -->
        <div class="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
          <div>
            <p class="text-[10px] text-slate-400 font-bold uppercase mb-0.5">CPA 獎金</p>
            <p class="text-sm font-bold text-slate-700">${{ formatCurr(commissionBalance.cpaTotal) }}</p>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 font-bold uppercase mb-0.5">儲值抽成</p>
            <p class="text-sm font-bold text-slate-700">${{ formatCurr(commissionBalance.depositTotal) }}</p>
          </div>
          <div class="pl-3 border-l-2 border-amber-100">
            <p class="text-[10px] text-amber-600 font-bold uppercase mb-0.5 flex items-center gap-1">
              凍結中
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </p>
            <p class="text-sm font-bold text-amber-700">${{ formatCurr(commissionBalance.frozen) }}</p>
          </div>
        </div>

      </div>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- Section B: Recent Transactions -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <h2 class="text-base font-bold text-slate-800">近期收支列表 <span class="text-xs font-normal text-slate-400 ml-1">(顯示近 10 筆)</span></h2>
        </div>
        <NuxtLink 
          to="/finance/logs"
          class="text-sm font-bold text-indigo-600 hover:text-indigo-700"
        >
          查看完整明細 &rarr;
        </NuxtLink>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left border-b border-slate-100">
              <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">異動時間</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">變動錢包</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">交易類型</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">變動金額</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">異動後餘額</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="tx in recentTransactions" :key="tx.id" class="hover:bg-slate-50/50 transition-colors group">
              
              <!-- Date & ID -->
              <td class="px-6 py-4 whitespace-nowrap">
                <p class="text-sm font-bold text-slate-700">{{ tx.date.split(' ')[0] }} <span class="text-slate-400 font-medium ml-1">{{ tx.date.split(' ')[1] }}</span></p>
                <p class="text-[10px] text-slate-400 font-mono mt-0.5">{{ tx.id }}</p>
              </td>

              <!-- Wallet Type -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider"
                  :class="tx.walletType === 'commission' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'"
                >
                  {{ tx.walletLabel }}
                </span>
              </td>

              <!-- Type -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" :class="getTxnIcon(tx.type).bg">
                    <!-- Target for CPA -->
                    <svg v-if="getTxnIcon(tx.type).i === 'target'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" class="text-emerald-600" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    <!-- Trending up for Deposit -->
                    <svg v-else-if="getTxnIcon(tx.type).i === 'trending-up'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" class="text-indigo-600" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                    <!-- Download for Superior In -->
                    <svg v-else-if="getTxnIcon(tx.type).i === 'download'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" class="text-sky-600" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    <!-- Upload for Withdrawal -->
                    <svg v-else-if="getTxnIcon(tx.type).i === 'upload'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" class="text-rose-600" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    <!-- X for Clearance deduct -->
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" class="text-amber-600" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800">{{ tx.typeLabel }}</p>
                    <p class="text-[11px] text-slate-500 mt-0.5 max-w-[200px] truncate" :title="tx.remark">{{ tx.remark }}</p>
                  </div>
                </div>
              </td>

              <!-- Amount -->
              <td class="px-6 py-4 text-right whitespace-nowrap">
                <span 
                  class="font-black font-mono text-base"
                  :class="tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'"
                >
                  {{ tx.amount > 0 ? '+' : '' }}{{ formatCurr(tx.amount) }}
                </span>
                <p class="text-[10px] text-slate-400 mt-0.5 font-medium group-hover:text-slate-500 transition-colors">TWD</p>
              </td>

              <!-- Balance -->
              <td class="px-6 py-4 text-right whitespace-nowrap">
                <span class="font-bold font-mono text-slate-700 text-sm">
                  {{ formatCurr(tx.balance) }}
                </span>
              </td>

            </tr>
          </tbody>
        </table>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
/* Wallet page styles */
</style>
