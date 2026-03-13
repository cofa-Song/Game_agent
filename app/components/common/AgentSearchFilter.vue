<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

const props = defineProps<{
  initialAccount?: string
  initialStatus?: string
  initialStartDate?: string
  initialEndDate?: string
}>()

const emit = defineEmits(['search', 'reset'])

// --- Search Types (Single Select) ---
const searchType = ref('account') 
const searchTypeOptions = computed(() => [
  { label: t('agent_search.type_account'), value: 'account' },
  { label: t('agent_search.type_uid'), value: 'uid' },
  { label: t('agent_search.type_promo'), value: 'promo' }
])

const placeholderText = computed(() => {
  const active = searchTypeOptions.value.find(opt => opt.value === searchType.value)
  return active ? t('agent_search.placeholder', { type: active.label }) : t('agent_search.placeholder_default')
})

// --- State ---
const account = ref(props.initialAccount || '')
const status = ref(props.initialStatus || 'all')
const startDate = ref(props.initialStartDate || '')
const endDate = ref(props.initialEndDate || '')

// --- Date Helpers ---
const formatDate = (date: Date) => date.toISOString().split('T')[0]

const dateQuickButtons = computed(() => [
  { l: t('agent_search.today'), v: 'today' },
  { l: t('agent_search.yesterday'), v: 'yesterday' },
  { l: t('agent_search.this_week'), v: 'week' },
  { l: t('agent_search.this_month'), v: 'month' }
])

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
    <div class="p-4 sm:p-6">
      <form @submit.prevent="handleSearch" class="space-y-4 sm:space-y-6">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-start">
          
          <!-- Column 1: Search Type & Input -->
          <div class="lg:col-span-4 space-y-3 sm:space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                {{ t('agent_search.search_params') }}
              </label>
              <!-- Single Select Radio Group (Tabs style) -->
              <div class="flex p-0.5 bg-slate-100 rounded-lg">
                <button 
                  v-for="opt in searchTypeOptions" 
                  :key="opt.value"
                  type="button"
                  @click="searchType = opt.value"
                  :class="[
                    'px-2 sm:px-3 py-1 text-[11px] font-bold rounded-md transition-all duration-200',
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
                :placeholder="placeholderText as string"
              >
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
            </div>
          </div>

          <!-- Column 2: Status Selection -->
          <div class="lg:col-span-3 space-y-3 sm:space-y-4">
            <label for="status" class="text-sm font-bold text-slate-800 flex items-center gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              {{ t('agent_search.account_status') }}
            </label>
            <div class="relative group">
              <select 
                id="status"
                v-model="status"
                class="w-full h-12 pl-4 pr-10 appearance-none rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm bg-slate-50/50 group-hover:bg-white cursor-pointer"
              >
                <option value="all">{{ t('agent_search.status_all') }}</option>
                <option value="normal">{{ t('agent_search.status_normal') }}</option>
                <option value="frozen">{{ t('agent_search.status_frozen') }}</option>
                <option value="disabled">{{ t('agent_search.status_disabled') }}</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <!-- Column 3: Custom Date Range Picker -->
          <div class="lg:col-span-5 space-y-3 sm:space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                {{ t('agent_search.created_date') }}
              </label>
              <div class="flex gap-1.5 flex-wrap justify-end">
                <button 
                  v-for="btn in dateQuickButtons" 
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
            class="h-11 px-8 sm:px-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xl shadow-indigo-600/20 transition-all text-sm font-black flex items-center gap-2 transform hover:-translate-y-0.5 active:scale-95 group flex-1 sm:flex-none justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:scale-110 transition-transform"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span>{{ t('agent_search.btn_search') }}</span>
          </button>
          <button 
            type="button" 
            @click="handleReset" 
            class="h-11 px-6 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all text-sm font-bold border border-transparent active:scale-95"
          >
            {{ t('agent_search.btn_clear') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* No specific styles needed here after refactor */
</style>
