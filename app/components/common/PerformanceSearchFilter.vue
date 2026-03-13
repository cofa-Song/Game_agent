<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  initialPlayerKeyword?: string
  initialAgentKeyword?: string
  initialStartDate?: string
  initialEndDate?: string
}>()

const emit = defineEmits(['search', 'reset'])

// --- Search Types ---
const playerSearchType = ref('account')
const agentSearchType = ref('account')
const searchTypeOptions = [
  { label: '帳號', value: 'account' },
  { label: 'UID', value: 'uid' }
]

// --- Helpers ---
const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getYesterdayStr = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return formatDate(d)
}

const yesterdayStr = getYesterdayStr()

// --- State ---
const playerKeyword = ref(props.initialPlayerKeyword || '')
const agentKeyword = ref(props.initialAgentKeyword || '')
const startDate = ref(props.initialStartDate || yesterdayStr)
const endDate = ref(props.initialEndDate || yesterdayStr)

// --- Computed ---
const playerPlaceholder = computed(() => {
  const active = searchTypeOptions.find(opt => opt.value === playerSearchType.value)
  return active ? `搜尋直屬玩家${active.label}...` : '搜尋玩家...'
})

const agentPlaceholder = computed(() => {
  const active = searchTypeOptions.find(opt => opt.value === agentSearchType.value)
  return active ? `搜尋代理${active.label}...` : '搜尋代理...'
})

// --- Actions ---
const handleSearch = () => {
  emit('search', {
    playerSearchType: playerSearchType.value,
    playerKeyword: playerKeyword.value,
    agentSearchType: agentSearchType.value,
    agentKeyword: agentKeyword.value,
    startDate: startDate.value,
    endDate: endDate.value
  })
}

const handleReset = () => {
  playerSearchType.value = 'account'
  playerKeyword.value = ''
  agentSearchType.value = 'account'
  agentKeyword.value = ''
  startDate.value = ''
  endDate.value = ''
  emit('reset')
}

const setDateRange = (type: 'today' | 'yesterday' | 'week' | 'month') => {
  const now = new Date()
  let start = new Date()
  let end = new Date()
  const formatDate = (date: Date) => date.toISOString().split('T')[0] || ''

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
      end = now
      break
    case 'month':
      start = new Date(new Date().setMonth(now.getMonth() - 1))
      end = now
      break
  }
  
  startDate.value = formatDate(start)
  endDate.value = formatDate(end)
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible">
    <div class="p-6">
      <form @submit.prevent="handleSearch" class="space-y-6">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Column 1: Direct Player Search -->
          <div class="lg:col-span-3 space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                直屬玩家
              </label>
              <div class="flex p-0.5 bg-slate-100 rounded-lg">
                <button 
                  v-for="opt in searchTypeOptions" 
                  :key="opt.value"
                  type="button"
                  @click="playerSearchType = opt.value"
                  :class="[
                    'px-2.5 py-0.5 text-[10px] font-bold rounded-md transition-all duration-200',
                    playerSearchType === opt.value 
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
                v-model="playerKeyword"
                type="text" 
                class="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm bg-slate-50/50 group-hover:bg-white placeholder:text-slate-400"
                :placeholder="playerPlaceholder"
              >
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
            </div>
          </div>

          <!-- Column 2: Agent Account Search -->
          <div class="lg:col-span-3 space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                代理帳號
              </label>
              <div class="flex p-0.5 bg-slate-100 rounded-lg">
                <button 
                  v-for="opt in searchTypeOptions" 
                  :key="opt.value"
                  type="button"
                  @click="agentSearchType = opt.value"
                  :class="[
                    'px-2.5 py-0.5 text-[10px] font-bold rounded-md transition-all duration-200',
                    agentSearchType === opt.value 
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
                v-model="agentKeyword"
                type="text" 
                class="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm bg-slate-50/50 group-hover:bg-white placeholder:text-slate-400"
                :placeholder="agentPlaceholder"
              >
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
            </div>
          </div>

          <!-- Column 3: Registration Date Range -->
          <div class="lg:col-span-6 space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                結算日期
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

            <CommonDateRangePicker 
              v-model:modelValueStart="startDate" 
              v-model:modelValueEnd="endDate" 
            />
          </div>

        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between pt-2">
          <div class="flex items-center gap-3">
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

          <!-- Generate Report Button (Cyan theme) -->
          <button 
            type="button"
            class="group relative inline-flex items-center gap-2 px-8 py-2.5 bg-cyan-500 text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/30 hover:bg-cyan-600 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          >
            <div class="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-30deg] -translate-x-full group-hover:animate-[shine_0.75s_ease-out]"></div>
            <div class="relative flex items-center gap-2">
              <div class="p-1 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h8"/><path d="M8 17h8"/><path d="M10 9H8"/></svg>
              </div>
              <span class="tracking-tight text-base">生成報表</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@keyframes shine {
  100% {
    transform: translateX(200%) skewX(-30deg);
  }
}
</style>

