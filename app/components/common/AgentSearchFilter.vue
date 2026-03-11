<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  initialAccount?: string
  initialStatus?: string
  initialStartDate?: string
  initialEndDate?: string
}>()

const emit = defineEmits(['search', 'reset'])

// --- Search Types (Single Select) ---
const searchType = ref('account') 
const searchTypeOptions = [
  { label: '帳號', value: 'account' },
  { label: 'UID', value: 'uid' },
  { label: '推廣碼', value: 'promo' }
]

const placeholderText = computed(() => {
  const active = searchTypeOptions.find(opt => opt.value === searchType.value)
  return active ? `輸入關鍵${active.label}...` : '搜尋關鍵字...'
})

// --- State ---
const account = ref(props.initialAccount || '')
const status = ref(props.initialStatus || 'all')
const startDate = ref(props.initialStartDate || '')
const endDate = ref(props.initialEndDate || '')

// --- Date Helpers ---
const formatDate = (date: Date) => date.toISOString().split('T')[0]

const setDateRange = (type: 'today' | 'yesterday' | 'week' | 'month') => {
  const now = new Date()
  let start = new Date()
  let end = new Date()

  switch (type) {
    case 'today':
      start = now
      end = now
      break
    case 'yesterday':
      start = new Date(new Date().setDate(now.getDate() - 1))
      end = start
      break
    case 'week':
      start = new Date(new Date().setDate(now.getDate() - 7))
      end = new Date()
      break
    case 'month':
      start = new Date(new Date().setMonth(now.getMonth() - 1))
      end = new Date()
      break
  }
  
  startDate.value = formatDate(start)!
  endDate.value = formatDate(end)!
}

const handleSearch = () => {
  emit('search', {
    type: searchType.value,
    keyword: account.value,
    status: status.value,
    startDate: startDate.value,
    endDate: endDate.value
  })
}

const handleReset = () => {
  searchType.value = 'account'
  account.value = ''
  status.value = 'all'
  startDate.value = ''
  endDate.value = ''
  emit('reset')
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible">
    <div class="p-6">
      <form @submit.prevent="handleSearch" class="space-y-6">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Column 1: Search Type & Input -->
          <div class="lg:col-span-4 space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                搜尋參數
              </label>
              <!-- Single Select Radio Group (Tabs style) -->
              <div class="flex p-0.5 bg-slate-100 rounded-lg">
                <button 
                  v-for="opt in searchTypeOptions" 
                  :key="opt.value"
                  type="button"
                  @click="searchType = opt.value"
                  :class="[
                    'px-3 py-1 text-[11px] font-bold rounded-md transition-all duration-200',
                    searchType === opt.value 
                      ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                      : 'text-slate-500 hover:text-slate-800'
                  ]"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <div class="relative group">
              <input 
                v-model="account"
                type="text" 
                class="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm bg-slate-50/50 group-hover:bg-white placeholder:text-slate-400"
                :placeholder="placeholderText"
              >
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
            </div>
          </div>

          <!-- Column 2: Status Selection -->
          <div class="lg:col-span-3 space-y-4">
            <label for="status" class="text-sm font-bold text-slate-800 flex items-center gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              帳號狀態
            </label>
            <div class="relative group">
              <select 
                id="status"
                v-model="status"
                class="w-full h-12 pl-4 pr-10 appearance-none rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm bg-slate-50/50 group-hover:bg-white cursor-pointer"
              >
                <option value="all">顯示全部 (All States)</option>
                <option value="normal">正常運作 (Normal)</option>
                <option value="frozen">帳號凍結 (Frozen)</option>
                <option value="disabled">永久停用 (Disabled)</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <!-- Column 3: Custom Date Range Picker -->
          <div class="lg:col-span-5 space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                創建日期
              </label>
              <div class="flex gap-1.5">
                <button 
                  v-for="btn in [{l:'今天', v:'today'}, {l:'昨天', v:'yesterday'}, {l:'本週', v:'week'}, {l:'本月', v:'month'}]" 
                  :key="btn.v"
                  type="button"
                  @click="setDateRange(btn.v as any)"
                  class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all transform active:scale-95"
                >
                  {{ btn.l }}
                </button>
              </div>
            </div>

            <!-- Unified Custom Date Range Picker Component -->
            <CommonDateRangePicker 
              v-model:modelValueStart="startDate" 
              v-model:modelValueEnd="endDate" 
            />
          </div>

        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-start gap-3 pt-2">
          <button 
            type="submit" 
            class="h-11 px-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xl shadow-indigo-600/20 transition-all text-sm font-black flex items-center gap-2 transform hover:-translate-y-0.5 active:scale-95 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:scale-110 transition-transform"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span>搜尋</span>
          </button>
          <button 
            type="button" 
            @click="handleReset" 
            class="h-11 px-6 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all text-sm font-bold border border-transparent active:scale-95"
          >
            清除條件
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* No specific styles needed here after refactor */
</style>
