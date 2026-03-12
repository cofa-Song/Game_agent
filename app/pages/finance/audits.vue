<script setup lang="ts">
import { ref, computed } from 'vue'
import DateRangePicker from '~/components/common/DateRangePicker.vue'

// --- Data Models & Mock Data ---
interface DownlineAgent {
  uid: string
  name: string
  // For simulation purposes, tracking their wallet state
  availableCommission: number
  frozenCommission: number
}

interface AuditRecord {
  id: string
  date: string // ISO date string
  agent: DownlineAgent
  amount: number
  method: 'bank' | 'usdt' | 'offline'
  accountInfo: string
  status: 'pending' | 'approved' | 'rejected'
  reason?: string // Approve remark or Reject reason
}

// Mock Agents
const agentA: DownlineAgent = { uid: 'AG-201', name: '王大明', availableCommission: 5000, frozenCommission: 20000 }
const agentB: DownlineAgent = { uid: 'AG-205', name: '李阿姨', availableCommission: 120000, frozenCommission: 45000 }
const agentC: DownlineAgent = { uid: 'AG-312', name: '張小弟', availableCommission: 0, frozenCommission: 5000 }

// Mock Records
const records = ref<AuditRecord[]>([
  {
    id: 'WD-A26031201',
    date: '2026-03-12T09:30:00',
    agent: agentA,
    amount: 20000,
    method: 'bank',
    accountInfo: '國泰世華 (013) ****9912',
    status: 'pending'
  },
  {
    id: 'WD-A26031145',
    date: '2026-03-11T16:45:00',
    agent: agentB,
    amount: 45000,
    method: 'offline',
    accountInfo: '現場領取 / 線下對接',
    status: 'pending'
  },
  {
    id: 'WD-A26031088',
    date: '2026-03-10T11:20:00',
    agent: agentC,
    amount: 5000,
    method: 'usdt',
    accountInfo: 'TRC20: Tx9P...R2mQ',
    status: 'rejected',
    reason: '地址格式錯誤，請重新確認'
  },
    {
    id: 'WD-A26030912',
    date: '2026-03-09T14:10:00',
    agent: agentA,
    amount: 15000,
    method: 'bank',
    accountInfo: '國泰世華 (013) ****9912',
    status: 'approved',
    reason: '已轉帳，交易序號: #12345678'
  }
])

// --- Filters ---
const filterStatus = ref<'all' | 'pending' | 'approved' | 'rejected'>('pending')
const dateStart = ref('')
const dateEnd = ref('')

const filteredRecords = computed(() => {
  let result = records.value

  if (filterStatus.value !== 'all') {
    result = result.filter(r => r.status === filterStatus.value)
  }

  // Basic date filtering
  if (dateStart.value && dateEnd.value) {
    const start = new Date(dateStart.value).getTime()
    const end = new Date(dateEnd.value).getTime() + 86400000 
    
    result = result.filter(r => {
      const recordTime = new Date(r.date).getTime()
      return recordTime >= start && recordTime <= end
    })
  }

  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// --- Modal State & Actions ---
const isModalOpen = ref(false)
const modalAction = ref<'approve' | 'reject'>('approve')
const selectedRecord = ref<AuditRecord | null>(null)
const inputReason = ref('')
const isSubmitting = ref(false)

const openModal = (record: AuditRecord, action: 'approve' | 'reject') => {
  selectedRecord.value = record
  modalAction.value = action
  inputReason.value = ''
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedRecord.value = null
  inputReason.value = ''
}

const submitAudit = async () => {
  if (!selectedRecord.value) return
  if (modalAction.value === 'reject' && !inputReason.value.trim()) {
      alert('請輸入駁回原因')
      return
  }

  isSubmitting.value = true
  
  // Simulate API Delay
  await new Promise(resolve => setTimeout(resolve, 600))

  const recordId = selectedRecord.value.id
  const index = records.value.findIndex(r => r.id === recordId)
  
  if (index !== -1) {
    const r = records.value[index]
    if (r) {
      if (modalAction.value === 'approve') {
         r.status = 'approved'
         r.reason = inputReason.value || '已完成匯款'
         // Accounting: Deduct from frozen
         if (r.agent) r.agent.frozenCommission -= r.amount
      } else {
         r.status = 'rejected'
         r.reason = inputReason.value
         // Accounting: Return from frozen to available
         if (r.agent) {
           r.agent.frozenCommission -= r.amount
           r.agent.availableCommission += r.amount
         }
      }
      
      // Trigger reactivity
      records.value[index] = { ...r }
    }
  }

  isSubmitting.value = false
  closeModal()
}

// --- Helpers ---
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US').format(val)
}

const getStatusConfig = (status: string) => {
  switch(status) {
    case 'pending': return { label: '待審核', class: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500 animate-pulse' }
    case 'approved': return { label: '已核發', class: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' }
    case 'rejected': return { label: '已駁回', class: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500' }
    default: return { label: '未知', class: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' }
  }
}

const getMethodConfig = (method: string) => {
  switch(method) {
    case 'bank': return { label: '銀行轉帳' }
    case 'usdt': return { label: 'USDT (Tether)' }
    case 'offline': return { label: '線下提領' }
    default: return { label: '未知' }
  }
}
</script>

<template>
  <div class="max-w-[1400px] mx-auto space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">下線提領審核</h1>
        <p class="text-sm text-slate-500 mt-1">處理直屬下線代理商提交的佣金提領申請，執行給付銷帳或駁回操作</p>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[600px]">
      
      <!-- Filters Header -->
      <div class="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 relative">
        <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          審核清單
        </h3>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Date Range Picker Component -->
          <div class="relative group hidden sm:block">
            <DateRangePicker 
              v-model:modelValueStart="dateStart" 
              v-model:modelValueEnd="dateEnd" 
            />
          </div>

          <!-- Status Filter -->
          <div class="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
            <button 
              v-for="status in [{v:'all', l:'全部'}, {v:'pending', l:'待處理'}, {v:'approved', l:'已核發'}, {v:'rejected', l:'已駁回'}]"
              :key="status.v"
              @click="filterStatus = status.v as any"
              class="px-4 py-1.5 text-xs font-bold rounded-md transition-all shadow-sm"
              :class="filterStatus === status.v ? 'bg-white text-indigo-700 border border-slate-200/50 scale-105' : 'text-slate-500 hover:text-slate-700 border border-transparent'"
            >
              {{ status.l }}
              <span v-if="status.v === 'pending'" class="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] leading-none">
                {{ records.filter(r => r.status === 'pending').length }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="flex-1 overflow-x-auto">
        <table class="w-full text-sm text-left whitespace-nowrap">
          <thead class="text-xs text-slate-500 bg-slate-50/80 uppercase border-b border-slate-200">
            <tr>
              <th scope="col" class="px-6 py-4 font-bold">申請時間 / 單號</th>
              <th scope="col" class="px-6 py-4 font-bold">代理商 (下線)</th>
              <th scope="col" class="px-6 py-4 font-bold text-right">提領金額</th>
              <th scope="col" class="px-6 py-4 font-bold">提領方式 / 帳戶資訊</th>
              <th scope="col" class="px-6 py-4 font-bold text-center">狀態</th>
              <th scope="col" class="px-6 py-4 font-bold text-center sticky right-0 bg-slate-50 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] border-l border-slate-100">管理操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="filteredRecords.length === 0">
              <td colspan="6" class="px-6 py-20 text-center text-slate-400">
                <div class="flex flex-col items-center justify-center gap-3">
                  <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                  </div>
                  <p class="text-sm font-medium">目前沒有符合條件的申請紀錄</p>
                </div>
              </td>
            </tr>
            <tr 
              v-for="record in filteredRecords" 
              :key="record.id" 
              class="hover:bg-indigo-50/30 transition-colors group"
            >
              <!-- Time / ID -->
              <td class="px-6 py-4">
                <div class="flex flex-col gap-1">
                  <div class="text-xs text-slate-800 font-bold">
                    {{ record.date?.split('T')[0] || '' }} <span v-if="record.date?.includes('T')" class="text-slate-400 font-normal ml-1">{{ record.date.split('T')[1].substring(0,5) }}</span>
                  </div>
                  <span class="font-mono text-[11px] text-indigo-500 bg-indigo-50 self-start px-1.5 py-0.5 rounded">{{ record.id }}</span>
                </div>
              </td>
              
              <!-- Agent Info -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase border border-slate-200">
                    {{ record.agent.name.substring(0, 1) }}
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold text-slate-700">{{ record.agent.name }}</span>
                    <span class="text-[10px] text-slate-500 font-mono">UID: {{ record.agent.uid }}</span>
                  </div>
                </div>
              </td>
              
              <!-- Amount -->
              <td class="px-6 py-4 text-right">
                <div class="flex flex-col items-end">
                  <span class="font-black text-rose-600 tracking-tight text-base flex items-center gap-1">
                    <span class="text-xs font-bold text-rose-400">$</span>{{ formatCurrency(record.amount) }}
                  </span>
                  <!-- Show a mock remaining frozen balance -->
                  <span class="text-[10px] text-slate-400" title="該代理當前凍結中總額">
                    (凍結餘額: ${{ formatCurrency(record.agent.frozenCommission) }})
                  </span>
                </div>
              </td>
              
              <!-- Method/Details -->
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-slate-700 mb-0.5">
                    {{ getMethodConfig(record.method).label }}
                  </span>
                  <span class="text-[11px] text-slate-500 font-mono p-1 bg-slate-50 rounded border border-slate-100">{{ record.accountInfo }}</span>
                </div>
              </td>
              
              <!-- Status & Reason -->
              <td class="px-6 py-4 text-center">
                <div class="flex flex-col items-center gap-1.5">
                  <span 
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm"
                    :class="getStatusConfig(record.status).class"
                  >
                    <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="getStatusConfig(record.status).dot"></span>
                    {{ getStatusConfig(record.status).label }}
                  </span>
                  <span v-if="record.reason" class="text-[10px] text-slate-400 max-w-[120px] truncate" :title="record.reason">
                    備註: {{ record.reason }}
                  </span>
                </div>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-center sticky right-0 bg-white shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] border-l border-slate-100 group-hover:bg-indigo-50/50 transition-colors">
                <div v-if="record.status === 'pending'" class="flex items-center justify-center gap-2">
                  <button 
                    @click="openModal(record, 'approve')"
                    class="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 shadow-sm shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    確認給付
                  </button>
                  <button 
                    @click="openModal(record, 'reject')"
                    class="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-50 hover:border-rose-300 transition-all active:scale-95 flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    駁回
                  </button>
                </div>
                <div v-else class="text-xs text-slate-400 italic">
                  -- 審核完畢 --
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Placeholder -->
      <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-xs text-slate-500 mt-auto">
        <span>顯示第 1 到 {{ filteredRecords.length }} 筆資料，共 {{ filteredRecords.length }} 筆</span>
      </div>
    </div>

    <!-- Action Modal (Approve / Reject) -->
    <Transition name="fade">
      <div v-if="isModalOpen && selectedRecord" class="fixed inset-0 z-50 flex items-center justify-center px-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeModal"></div>
        
        <!-- Modal Content -->
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden" @click.stop>
          <!-- Header -->
          <div 
            class="px-6 py-4 border-b flex items-center justify-between"
            :class="modalAction === 'approve' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'"
          >
            <h3 class="text-lg font-bold flex items-center gap-2" :class="modalAction === 'approve' ? 'text-emerald-800' : 'text-rose-800'">
              <span v-if="modalAction === 'approve'" class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
              <span v-else class="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </span>
              {{ modalAction === 'approve' ? '確認給付 (銷帳)' : '駁回提領申請' }}
            </h3>
            <button @click="closeModal" class="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-6">
            
            <!-- Context Info -->
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">代理商</span>
                <span class="font-bold text-slate-800">{{ selectedRecord?.agent.name }} ({{ selectedRecord?.agent.uid }})</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">提領金額</span>
                <span class="font-black text-rose-600">${{ selectedRecord ? formatCurrency(selectedRecord.amount) : '0' }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">提領方式</span>
                <span class="font-medium text-slate-700">{{ selectedRecord ? getMethodConfig(selectedRecord.method).label : '' }}</span>
              </div>
              <div class="pt-2 mt-2 border-t border-slate-200">
                <p class="text-xs text-slate-500 font-medium">
                  <template v-if="modalAction === 'approve'">
                    執行給付後，將扣除該代理帳戶 <span class="text-slate-700 font-bold">凍結中佣金 ${{ selectedRecord ? formatCurrency(selectedRecord.amount) : '0' }}</span>，並寫入錢包異動日誌以供核對。
                  </template>
                  <template v-else>
                    駁回此申請後，<span class="text-slate-700 font-bold">預扣餘額 ${{ selectedRecord ? formatCurrency(selectedRecord.amount) : '0' }} 將返還至該代理的「可用佣金」錢包</span>，且會發送通知。
                  </template>
                </p>
              </div>
            </div>

            <!-- Input Field -->
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 flex justify-between">
                <span>{{ modalAction === 'approve' ? '給付註記 / 交易序號' : '駁回原因' }}</span>
                <span v-if="modalAction === 'reject'" class="text-rose-500 text-xs">* 必填</span>
              </label>
              <textarea 
                v-model="inputReason"
                rows="3"
                class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none transition-all resize-none text-sm"
                :class="modalAction === 'approve' ? 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500' : 'border-slate-200 focus:border-rose-500 focus:ring-rose-500'"
                :placeholder="modalAction === 'approve' ? '選填（如：已匯款至國泰帳戶，交易序號 #987654）' : '必填（如：收款帳戶名稱不符，請重新確認並提交）'"
              ></textarea>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button 
              @click="closeModal" 
              class="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-colors"
            >
              取消
            </button>
            <button 
              @click="submitAudit"
              :disabled="isSubmitting || (modalAction === 'reject' && !inputReason.trim())"
              class="px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2"
              :class="isSubmitting || (modalAction === 'reject' && !inputReason.trim()) ? 'bg-slate-300 shadow-none cursor-not-allowed' : modalAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30'"
            >
              <div v-if="isSubmitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{{ modalAction === 'approve' ? '確認核發' : '確認駁回' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .bg-white,
.fade-leave-active .bg-white {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-enter-from .bg-white,
.fade-leave-to .bg-white {
  transform: scale(0.95);
}
</style>
