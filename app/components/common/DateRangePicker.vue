<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValueStart: string
  modelValueEnd: string
}>()

const emit = defineEmits(['update:modelValueStart', 'update:modelValueEnd'])

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

// --- Calendar State ---
const currentMonth = ref(new Date())
const tempStart = ref<string | null>(props.modelValueStart || null)
const tempEnd = ref<string | null>(props.modelValueEnd || null)

// --- Display Logic ---
const displayValue = computed(() => {
  if (!props.modelValueStart && !props.modelValueEnd) return '選擇日期範圍'
  return `${props.modelValueStart} ~ ${props.modelValueEnd}`
})

// --- Calendar Logic ---
const daysInMonth = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  
  const days = []
  // Padding for first day
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, dateStr: '' })
  }
  // Actual days
  for (let d = 1; d <= lastDate; d++) {
    const date = new Date(year, month, d)
    const dateStr = date.toISOString().split('T')[0]
    days.push({ day: d, dateStr })
  }
  return days
})

const monthLabel = computed(() => {
  return `${currentMonth.value.getFullYear()}年 ${currentMonth.value.getMonth() + 1}月`
})

const nextMonth = () => currentMonth.value = new Date(currentMonth.value.setMonth(currentMonth.value.getMonth() + 1))
const prevMonth = () => currentMonth.value = new Date(currentMonth.value.setMonth(currentMonth.value.getMonth() - 1))

const selectDate = (dateStr: string) => {
  if (!tempStart.value || (tempStart.value && tempEnd.value)) {
    tempStart.value = dateStr
    tempEnd.value = null
  } else {
    if (dateStr < tempStart.value) {
      tempEnd.value = tempStart.value
      tempStart.value = dateStr
    } else {
      tempEnd.value = dateStr
    }
    // Apply changes
    emit('update:modelValueStart', tempStart.value)
    emit('update:modelValueEnd', tempEnd.value)
    isOpen.value = false
  }
}

const isSelected = (dateStr: string) => dateStr === tempStart.value || dateStr === tempEnd.value
const isInRange = (dateStr: string) => {
  if (!tempStart.value || !tempEnd.value) return false
  return dateStr > tempStart.value && dateStr < tempEnd.value
}

// --- Click Outside ---
const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>

<template>
  <div ref="containerRef" class="relative">
    <!-- Unified Display Field -->
    <div 
      @click="isOpen = !isOpen"
      :class="[
        'flex items-center bg-slate-50/50 border rounded-xl px-4 h-12 cursor-pointer transition-all duration-300 group',
        isOpen ? 'border-indigo-500 ring-4 ring-indigo-500/10 bg-white' : 'border-slate-200 hover:border-slate-300 hover:bg-white'
      ]"
    >
      <div class="flex-1 text-sm font-semibold truncate" :class="modelValueStart ? 'text-slate-700' : 'text-slate-400'">
        {{ displayValue }}
      </div>
      <div class="flex items-center gap-3 pl-4 border-l border-slate-200 ml-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="isOpen ? 'text-indigo-500' : 'text-slate-400'"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
      </div>
    </div>

    <!-- Calendar Popup -->
    <div 
      v-if="isOpen"
      class="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 w-80 animate-in fade-in zoom-in duration-200 origin-top"
    >
      <!-- Month Navigation -->
      <div class="flex items-center justify-between mb-4">
        <button type="button" @click="prevMonth" class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span class="text-sm font-bold text-slate-800">{{ monthLabel }}</span>
        <button type="button" @click="nextMonth" class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6 6-6"/></svg>
        </button>
      </div>

      <!-- Days Table -->
      <div class="grid grid-cols-7 gap-1">
        <div v-for="d in ['日', '一', '二', '三', '四', '五', '六']" :key="d" class="text-center text-[10px] font-black text-slate-400 py-1 uppercase tracking-wider">
          {{ d }}
        </div>
        <div 
          v-for="(date, idx) in daysInMonth" 
          :key="idx"
          @click="date.day ? selectDate(date.dateStr) : null"
          :class="[
            'relative text-center py-2 text-xs font-medium rounded-lg cursor-pointer transition-all duration-200',
            !date.day ? 'cursor-default opacity-0' : 'hover:bg-slate-50',
            isSelected(date.dateStr) ? 'bg-indigo-600 !text-white !font-black ring-2 ring-indigo-600 ring-offset-2 z-10' : '',
            isInRange(date.dateStr) ? 'bg-indigo-50 text-indigo-700 !rounded-none first:rounded-l-lg last:rounded-r-lg' : ''
          ]"
        >
          {{ date.day }}
          <!-- Range start/end indicators -->
          <div v-if="date.dateStr === tempStart && tempEnd" class="absolute inset-y-0 right-0 w-1/2 bg-indigo-50 -z-10"></div>
          <div v-if="date.dateStr === tempEnd" class="absolute inset-y-0 left-0 w-1/2 bg-indigo-50 -z-10"></div>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center px-1">
        <div class="text-[10px] text-slate-400 font-medium">點擊兩次以設定範圍</div>
        <button 
          v-if="tempStart && tempEnd"
          type="button" 
          @click="isOpen = false"
          class="text-xs font-bold text-indigo-600 hover:text-indigo-700"
        >
          查看結果
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: animate-in 0.2s ease-out;
}
@keyframes animate-in {
  from { opacity: 0; transform: scale(0.95) translateY(-10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
