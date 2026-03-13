<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'

interface CpaData {
  uid: string;
  account: string;
  level: string;
  cpaLevel1: number;
  cpaLevel2: number;
  cpaLevel3: number;
  commissionRatio: number;
  capCpa: number; // The limit from superior
}

const props = defineProps<{
  show: boolean;
  agentData: CpaData | null;
}>()

const emit = defineEmits(['close', 'save'])

const form = ref({
  cpaLevel1: 0,
  cpaLevel2: 0,
  cpaLevel3: 0,
  commissionRatio: 0
})

const isHistoryShow = ref(false)

// Mock history data
const historyRecords = ref([
  { date: '2025-03-10 14:30:22', admin: 'Admin_Super', action: '調整單價', details: '級距1: $100 -> $120' },
  { date: '2025-03-05 09:12:05', admin: 'System', action: '初始配置', details: '級距1: $100, 級距2: $150, 級距3: $200' },
  { date: '2025-02-28 16:45:00', admin: 'Manager_Wang', action: '調整抽成', details: '抽成分配: 40% -> 45%' }
])

watch(() => props.agentData, (newData) => {
  if (newData) {
    form.value = {
      cpaLevel1: newData.cpaLevel1 || 0,
      cpaLevel2: newData.cpaLevel2 || 0,
      cpaLevel3: newData.cpaLevel3 || 0,
      commissionRatio: newData.commissionRatio || 0
    }
  }
}, { immediate: true })

const isCpaValid = computed(() => {
  if (!props.agentData) return true
  const cap = props.agentData.capCpa
  return form.value.cpaLevel1 <= cap &&
         form.value.cpaLevel2 <= cap &&
         form.value.cpaLevel3 <= cap
})

const handleClose = () => {
  emit('close')
}

useBodyScrollLock(() => props.show)

const handleSubmit = () => {
  if (!isCpaValid.value) return
  emit('save', { ...form.value, uid: props.agentData?.uid })
  handleClose()
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show && agentData" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        @click="handleClose"
      ></div>

      <!-- Modal Content -->
      <div class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all border border-slate-200 flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div class="relative z-10">
            <h3 class="text-xl font-bold">CPA 級距配置</h3>
            <div class="flex items-center gap-4 mt-1 text-emerald-50 text-xs">
              <span class="font-bold">目標：{{ agentData.account }}</span>
              <span class="opacity-70">|</span>
              <span class="font-mono">ID: {{ agentData.uid }}</span>
              <span class="px-2 py-0.5 bg-white/20 rounded-full font-bold ml-2">{{ agentData.level }}</span>
            </div>
          </div>
          <button 
            @click="handleClose"
            class="relative z-10 p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-8 overflow-y-auto max-h-[70vh] space-y-8 custom-scrollbar">
          <!-- CPA Reward Matrix -->
          <div class="space-y-6">
            <div class="flex items-center gap-2 text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <h4 class="font-bold">CPA 級距單價 ($)</h4>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div v-for="l in [1, 2, 3]" :key="l" class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-[11px] font-bold text-slate-500 uppercase">級距 {{ l }}</label>
                  <span class="text-[10px] text-slate-400 font-bold">上限：${{ agentData.capCpa }}</span>
                </div>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">$</span>
                  <input 
                    v-model.number="form['cpaLevel' + l as keyof typeof form]"
                    type="number"
                    class="w-full h-11 pl-6 pr-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/50 transition-all text-sm outline-none font-bold"
                    :class="{'border-rose-500 focus:ring-rose-500/10': form['cpaLevel' + l as keyof typeof form] > agentData.capCpa}"
                  >
                </div>
                <!-- Validation Error -->
                <p v-if="form['cpaLevel' + l as keyof typeof form] > agentData.capCpa" class="text-[10px] text-rose-500 font-bold">
                  不得超過上限 ${{ agentData.capCpa }}
                </p>
              </div>
            </div>
          </div>

          <!-- Commission Allocation -->
          <div class="space-y-6 pt-8 border-t border-slate-100">
            <div class="flex items-center gap-2 text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
              <h4 class="font-bold">儲值抽成分配率 (%)</h4>
            </div>

            <div class="p-6 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl space-y-6">
              <div class="flex items-center justify-between">
                <label class="text-sm font-bold text-slate-700">分配給下線比例</label>
                <div class="flex items-center gap-2">
                  <input 
                    v-model.number="form.commissionRatio"
                    type="number"
                    min="0"
                    max="100"
                    class="w-16 h-8 text-center bg-white border border-indigo-200 rounded-lg text-indigo-600 font-bold text-sm outline-none"
                  >
                  <span class="text-indigo-600 font-black">%</span>
                </div>
              </div>

              <div class="space-y-3">
                <input 
                  v-model.number="form.commissionRatio"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                >
                <div class="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100% (最高)</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Footer -->
        <div class="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <button 
            @click="isHistoryShow = true"
            class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
            變更紀錄
          </button>
          
          <div class="flex items-center gap-3">
            <button 
              @click="handleClose"
              class="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200"
            >
              取消
            </button>
            <button 
              @click="handleSubmit"
              :disabled="!isCpaValid"
              class="px-10 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/20 transform transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
            >
              <span>儲存配置</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </button>
          </div>
        </div>

        <!-- History Sidebar (Slide-over within modal) -->
        <Transition name="slide">
          <div v-if="isHistoryShow" class="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col">
            <div class="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h4 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                CPA 變更紀錄
              </h4>
              <button 
                @click="isHistoryShow = false"
                class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div class="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-6">
              <div v-for="(record, idx) in historyRecords" :key="idx" class="relative pl-8 pb-6 border-l-2 border-indigo-100 last:border-0 last:pb-0">
                <div class="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-indigo-500 shadow-sm"></div>
                <div class="text-xs font-bold text-slate-400 mb-1 font-mono">{{ record.date }}</div>
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">{{ record.action }}</span>
                    <span class="text-xs text-slate-500 font-medium">操作人: {{ record.admin }}</span>
                  </div>
                  <p class="text-sm text-slate-600 leading-relaxed">{{ record.details }}</p>
                </div>
              </div>
            </div>
            
            <div class="px-8 py-6 border-t border-slate-100 flex items-center justify-center bg-slate-50/30">
              <button 
                @click="isHistoryShow = false" 
                class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-xl transition-all"
              >
                關閉紀錄
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
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

.fade-enter-active .relative,
.fade-leave-active .relative {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-enter-from .relative {
  transform: scale(0.95);
  opacity: 0;
}

.fade-leave-to .relative {
  transform: scale(0.98);
  opacity: 0;
}

/* History Slide Transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 18px;
  width: 18px;
  border-radius: 50%;
  background: white;
  border: 2px solid #6366f1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  margin-top: -8.2px;
}

input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
