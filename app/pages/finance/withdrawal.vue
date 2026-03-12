<script setup lang="ts">
import { ref, computed } from 'vue'
import DateRangePicker from '~/components/common/DateRangePicker.vue'

// --- Data Models & Mock Data ---
interface WithdrawalRecord {
  id: string
  date: string // ISO date string
  amount: number
  method: 'bank' | 'usdt' | 'offline'
  accountInfo: string // Masked bank account, USDT address, or 'Offline'
  status: 'pending' | 'approved' | 'rejected'
}

// Global Balances (Mocking global state)
const availableCommission = ref(456800)
const frozenCommission = ref(25000)

// History Records
const records = ref<WithdrawalRecord[]>([
  {
    id: 'WD-260312001',
    date: '2026-03-12T10:15:00',
    amount: 50000,
    method: 'bank',
    accountInfo: '國泰世華銀行 (013) ****5678',
    status: 'pending'
  },
  {
    id: 'WD-260228045',
    date: '2026-02-28T14:30:00',
    amount: 120000,
    method: 'usdt',
    accountInfo: 'TRC20: Tx9P...R2mQ',
    status: 'approved'
  },
  {
    id: 'WD-260115089',
    date: '2026-01-15T09:00:00',
    amount: 30000,
    method: 'bank',
    accountInfo: '中國信託銀行 (822) ****1234',
    status: 'rejected'
  }
])

// --- Form State ---
const withdrawalAmount = ref<number | null>(null)
const selectedMethod = ref<'bank' | 'usdt' | 'offline'>('bank')

// Form validation and state
const isSubmitting = ref(false)
const showSuccessModal = ref(false)

// Dynamic Form Fields: Bank
const bankName = ref('')
const bankBranch = ref('')
const accountName = ref('')
const accountNumber = ref('')

// Dynamic Form Fields: USDT
const usdtNetwork = ref('TRC20')
const usdtAddress = ref('')

// --- Computed & Validation ---
const isOverBalance = computed(() => {
  if (!withdrawalAmount.value) return false
  return withdrawalAmount.value > availableCommission.value
})

const isFormValid = computed(() => {
  if (!withdrawalAmount.value || withdrawalAmount.value <= 0 || isOverBalance.value) return false

  if (selectedMethod.value === 'bank') {
    return bankName.value.trim() !== '' && 
           bankBranch.value.trim() !== '' && 
           accountName.value.trim() !== '' && 
           accountNumber.value.trim() !== ''
  } else if (selectedMethod.value === 'usdt') {
    return usdtAddress.value.trim() !== ''
  } else {
    // Offline method doesn't require extra inputs
    return true
  }
})

// --- Filters ---
const filterStatus = ref<'all' | 'pending' | 'approved' | 'rejected'>('all')
const dateStart = ref('')
const dateEnd = ref('')

const filteredRecords = computed(() => {
  let result = records.value

  if (filterStatus.value !== 'all') {
    result = result.filter(r => r.status === filterStatus.value)
  }

  if (dateStart.value && dateEnd.value) {
    const start = new Date(dateStart.value).getTime()
    // Add 24h to include the end date fully
    const end = new Date(dateEnd.value).getTime() + 86400000 
    
    result = result.filter(r => {
      const recordTime = new Date(r.date).getTime()
      return recordTime >= start && recordTime <= end
    })
  }

  // Sort by date descending
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// --- Actions ---
const handleWithdrawalRequest = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800))

  // Update Balances
  availableCommission.value -= withdrawalAmount.value!
  frozenCommission.value += withdrawalAmount.value!

  // Create new record
  let accountInfoStr = ''
  if (selectedMethod.value === 'bank') {
    const maskedAccount = accountNumber.value.slice(-4).padStart(accountNumber.value.length, '*')
    accountInfoStr = `${bankName.value} ${maskedAccount}`
  } else if (selectedMethod.value === 'usdt') {
    const maskedAddr = `${usdtAddress.value.slice(0, 4)}...${usdtAddress.value.slice(-4)}`
    accountInfoStr = `${usdtNetwork.value}: ${maskedAddr}`
  } else {
    accountInfoStr = '現場領取 / 線下對接'
  }

  const newRecord: WithdrawalRecord = {
    id: `WD-${new Date().toISOString().replace(/[-:T]/g, '').slice(2, 11)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    date: new Date().toISOString(),
    amount: withdrawalAmount.value!,
    method: selectedMethod.value,
    accountInfo: accountInfoStr,
    status: 'pending'
  }

  records.value.unshift(newRecord)

  // Reset Form
  withdrawalAmount.value = null
  bankName.value = ''
  bankBranch.value = ''
  accountName.value = ''
  accountNumber.value = ''
  usdtAddress.value = ''

  isSubmitting.value = false
  showSuccessModal.value = true
  
  // Auto close success modal
  setTimeout(() => {
    showSuccessModal.value = false
  }, 3000)
}

// --- Helpers ---
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US').format(val)
}

const getStatusConfig = (status: string) => {
  switch(status) {
    case 'pending': 
      return { label: '待審核', class: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500 animate-pulse' }
    case 'approved': 
      return { label: '已核發', class: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' }
    case 'rejected': 
      return { label: '已駁回', class: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500' }
    default: 
      return { label: '未知', class: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' }
  }
}

const getMethodConfig = (method: string) => {
  switch(method) {
    case 'bank': return { label: '銀行轉帳', icon: 'M3 21h18v-2H3v2zm6-4h12V7H9v10zm-6 0h4V7H3v10z' }
    case 'usdt': return { label: 'USDT (Tether)', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v3h-2zm0 4h2v7h-2z' }
    case 'offline': return { label: '線下提領', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 14v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' }
    default: return { label: '未知', icon: '' }
  }
}
</script>

<template>
  <div class="max-w-[1200px] mx-auto space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">佣金提領申請</h1>
        <p class="text-sm text-slate-500 mt-1">申請將您的佣金餘額提領至指定帳戶或錢包，並追蹤審核進度</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Left Column: Balances & Application Form -->
      <div class="lg:col-span-1 space-y-6">
        
        <!-- Balance Overview Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
          <!-- Decorative elements (subtle light accents) -->
          <div class="absolute top-0 right-0 p-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6 relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-5 7.96V16a2 2 0 0 0-2-2"/></svg>
            資產概況
          </h3>

          <div class="space-y-6 relative z-10">
            <!-- Available -->
            <div>
              <p class="text-xs text-slate-500 font-bold mb-1">可提領佣金餘額 (TWD)</p>
              <div class="flex items-baseline gap-1">
                <span class="text-2xl text-slate-400 font-medium">$</span>
                <span class="text-4xl font-black tabular-nums tracking-tight text-slate-800">{{ formatCurrency(availableCommission) }}</span>
              </div>
            </div>

            <!-- Divider -->
            <div class="h-px bg-slate-100 w-full rounded-full"></div>

            <!-- Frozen -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-600 font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                凍結中佣金
              </span>
              <span class="text-lg font-bold text-amber-500 tabular-nums">
                ${{ formatCurrency(frozenCommission) }}
              </span>
            </div>
            <p class="text-xs text-slate-500 leading-relaxed font-medium">
              * 已提交申請但尚未審核完畢的金額將暫時轉入凍結狀態。
            </p>
          </div>
        </div>

        <!-- Withdrawal Form Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
            發起提領
          </h3>

          <form @submit.prevent="handleWithdrawalRequest" class="space-y-6">
            <!-- Amount Input -->
            <div class="space-y-2">
              <label class="text-xs font-black text-slate-700 uppercase tracking-widest flex justify-between">
                <span>申請金額 (TWD) <span class="text-rose-500">*</span></span>
                <button type="button" @click="withdrawalAmount = availableCommission" class="text-indigo-600 hover:text-indigo-800 text-[10px]">全部提領</button>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span class="text-slate-400 font-bold text-lg">$</span>
                </div>
                <input 
                  v-model.number="withdrawalAmount"
                  type="number" 
                  min="100"
                  step="100"
                  placeholder="請輸入提領金額"
                  class="w-full h-12 pl-8 pr-4 rounded-xl border-2 focus:ring-0 focus:border-indigo-500 transition-all font-bold outline-none"
                  :class="isOverBalance ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50/50'"
                >
              </div>
              <!-- Balance Warning -->
              <p v-if="isOverBalance" class="text-[11px] text-rose-500 font-bold flex items-center gap-1 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                輸入金額超出可提領餘額
              </p>
            </div>

            <!-- Method Selection -->
            <div class="space-y-3">
              <label class="text-xs font-black text-slate-700 uppercase tracking-widest">
                提款方式 <span class="text-rose-500">*</span>
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button 
                  type="button"
                  @click="selectedMethod = 'bank'"
                  class="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all relative overflow-hidden group"
                  :class="selectedMethod === 'bank' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300'"
                >
                  <div v-if="selectedMethod === 'bank'" class="absolute right-2 top-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="selectedMethod === 'bank' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                  <span class="text-[12px] font-bold" :class="selectedMethod === 'bank' ? 'text-indigo-700' : 'text-slate-600'">銀行轉帳</span>
                </button>

                <button 
                  type="button"
                  @click="selectedMethod = 'usdt'"
                  class="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all relative overflow-hidden group"
                  :class="selectedMethod === 'usdt' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-slate-50/50 hover:border-emerald-300'"
                >
                  <div v-if="selectedMethod === 'usdt'" class="absolute right-2 top-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="selectedMethod === 'usdt' ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'"><circle cx="12" cy="12" r="10"/><path d="M8 11.5L12 8l4 3.5"/><path d="M12 8v8"/></svg>
                  <span class="text-[12px] font-bold" :class="selectedMethod === 'usdt' ? 'text-emerald-700' : 'text-slate-600'">USDT</span>
                </button>

                <button 
                  type="button"
                  @click="selectedMethod = 'offline'"
                  class="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all relative overflow-hidden group"
                  :class="selectedMethod === 'offline' ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200 bg-slate-50/50 hover:border-amber-300'"
                >
                  <div v-if="selectedMethod === 'offline'" class="absolute right-2 top-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="selectedMethod === 'offline' ? 'text-amber-600' : 'text-slate-400 group-hover:text-amber-500'"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  <span class="text-[12px] font-bold" :class="selectedMethod === 'offline' ? 'text-amber-700' : 'text-slate-600'">線下提領</span>
                </button>
              </div>
            </div>

            <!-- Dynamic Fields: Bank -->
            <div v-if="selectedMethod === 'bank'" class="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-600">銀行名稱</label>
                  <input v-model="bankName" type="text" placeholder="如: 國泰世華" class="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-indigo-500 bg-slate-50 outline-none text-sm transition-colors">
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-600">分行名稱</label>
                  <input v-model="bankBranch" type="text" placeholder="如: 營業部" class="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-indigo-500 bg-slate-50 outline-none text-sm transition-colors">
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-600">戶名</label>
                <input v-model="accountName" type="text" placeholder="帳戶持有者姓名" class="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-indigo-500 bg-slate-50 outline-none text-sm transition-colors">
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-600">銀行帳號</label>
                <input v-model="accountNumber" type="text" placeholder="請輸入完整帳號" class="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-indigo-500 bg-slate-50 outline-none text-sm transition-colors font-mono tracking-wider">
              </div>
            </div>

            <!-- Dynamic Fields: USDT -->
            <div v-if="selectedMethod === 'usdt'" class="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-600">公鏈網路</label>
                <select v-model="usdtNetwork" class="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-emerald-500 bg-slate-50 outline-none text-sm transition-colors font-bold">
                  <option value="TRC20">TRC20 (推薦, 手續費低)</option>
                  <option value="ERC20">ERC20</option>
                  <option value="BEP20">BEP20</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-600">錢包地址</label>
                <input v-model="usdtAddress" type="text" placeholder="請輸入 USDT 收款地址" class="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-emerald-500 bg-slate-50 outline-none text-sm transition-colors font-mono text-xs">
                <p class="text-[11px] text-amber-600 font-medium">請再三確認地址與網路相符，轉錯地址將無法追回。</p>
              </div>
            </div>

            <!-- Dynamic Fields: Offline -->
            <div v-if="selectedMethod === 'offline'" class="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <h4 class="text-sm font-bold text-amber-900 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                線下提領須知
              </h4>
              <p class="text-[11px] text-amber-700 leading-relaxed font-medium">
                選擇線下提領後，請於提交申請後主動聯繫您的直屬上級或客服人員，預約領取地點與時間。提領時請攜帶相關身分證明文件以供查驗。
              </p>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit"
              :disabled="!isFormValid || isSubmitting"
              class="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-white shadow-lg transition-all relative overflow-hidden"
              :class="!isFormValid || isSubmitting ? 'bg-slate-300 shadow-none cursor-not-allowed' : selectedMethod === 'bank' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30' : selectedMethod === 'usdt' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/30'"
            >
              <div v-if="isSubmitting" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <template v-else>
                <span>提交提領申請</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </template>
            </button>
          </form>
        </div>
      </div>

      <!-- Right Column: History Table -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
          
          <!-- History Header & Filters -->
          <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between gap-4 rounded-t-2xl relative">
            <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              提領紀錄
            </h3>

            <div class="flex items-center gap-2">
              <!-- Date Range Picker Component -->
              <div class="relative group">
                <DateRangePicker 
                  v-model:modelValueStart="dateStart" 
                  v-model:modelValueEnd="dateEnd" 
                />
              </div>

              <!-- Status Filter -->
              <div class="flex rounded-lg border border-slate-200 bg-slate-50/50 p-1">
                <button 
                  v-for="status in [{v:'all', l:'全部'}, {v:'pending', l:'待審核'}, {v:'approved', l:'已核發'}, {v:'rejected', l:'已駁回'}]"
                  :key="status.v"
                  @click="filterStatus = status.v as any"
                  class="px-3 py-1.5 text-xs font-bold rounded-md transition-colors"
                  :class="filterStatus === status.v ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'"
                >
                  {{ status.l }}
                </button>
              </div>
            </div>
          </div>

          <!-- Table Wrapper -->
          <div class="flex-1 overflow-x-auto">
            <table class="w-full text-sm text-left whitespace-nowrap">
              <thead class="text-xs text-slate-500 bg-slate-50/50 uppercase border-b border-slate-100">
                <tr>
                  <th scope="col" class="px-6 py-4 font-bold">申請時間</th>
                  <th scope="col" class="px-6 py-4 font-bold">申請單號</th>
                  <th scope="col" class="px-6 py-4 font-bold text-right">提領金額</th>
                  <th scope="col" class="px-6 py-4 font-bold">收款方式 / 資訊</th>
                  <th scope="col" class="px-6 py-4 font-bold text-center">狀態</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-if="filteredRecords.length === 0">
                  <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      <p class="text-sm">沒有找到符合條件的申請紀錄</p>
                    </div>
                  </td>
                </tr>
                <tr 
                  v-for="record in filteredRecords" 
                  :key="record.id" 
                  class="hover:bg-slate-50/50 transition-colors group"
                >
                  <!-- Application Time -->
                  <td class="px-6 py-4">
                    <div class="text-xs text-slate-500 font-medium">
                      {{ record.date?.split('T')[0] || '' }}
                      <span class="block text-[10px] text-slate-400">{{ record.date?.split('T')[1]?.substring(0,5) || '' }}</span>
                    </div>
                  </td>
                  
                  <!-- Withdraw ID -->
                  <td class="px-6 py-4">
                    <span class="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{{ record.id }}</span>
                  </td>
                  
                  <!-- Amount -->
                  <td class="px-6 py-4 text-right">
                    <span class="font-black text-slate-700 tracking-tight text-base">$ {{ formatCurrency(record.amount) }}</span>
                  </td>
                  
                  <!-- Method/Details -->
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <svg v-if="record.method === 'bank'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                        <svg v-else-if="record.method === 'usdt'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><circle cx="12" cy="12" r="10"/><path d="M8 11.5L12 8l4 3.5"/><path d="M12 8v8"/></svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        {{ getMethodConfig(record.method).label }}
                      </span>
                      <span class="text-[11px] text-slate-500 font-mono mt-0.5">{{ record.accountInfo }}</span>
                    </div>
                  </td>
                  
                  <!-- Status -->
                  <td class="px-6 py-4 text-center">
                    <span 
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border"
                      :class="getStatusConfig(record.status).class"
                    >
                      <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="getStatusConfig(record.status).dot"></span>
                      {{ getStatusConfig(record.status).label }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Mock -->
          <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-xs text-slate-500">
            <span>顯示 {{ filteredRecords.length }} 筆資料</span>
            <!-- pagination placeholder -->
          </div>

        </div>
      </div>
    </div>

    <!-- Success Toast/Modal -->
    <Transition name="fade">
      <div v-if="showSuccessModal" class="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50">
        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <div>
          <h4 class="font-bold">提領申請已送出</h4>
          <p class="text-xs text-emerald-100">已進入待審核狀態，將扣除相應可用餘額</p>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
