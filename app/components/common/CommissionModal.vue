<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

// ── Props ──────────────────────────────────────────────
interface CommissionTarget {
  uid: string
  account: string
  realName: string
  currentRate: number // 目前已設定的分配率（0~100）
}

const props = defineProps<{
  show: boolean
  target: CommissionTarget | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: { uid: string; allocationRate: number }): void
}>()

// ── State ──────────────────────────────────────────────
const rateInput = ref<number>(0)
const isHistoryShow = ref(false)

// 當 target 變動時，同步輸入框
watch(() => props.target, (t) => {
  rateInput.value = t?.currentRate ?? 0
  isHistoryShow.value = false
}, { immediate: true })

// ── Validation ─────────────────────────────────────────
const isValid = computed(() =>
  rateInput.value >= 0 && rateInput.value <= 100
)

const validationMsg = computed(() => {
  if (rateInput.value < 0) return '分配率不可低於 0%'
  if (rateInput.value > 100) return '分配率不可超過 100%'
  return ''
})

// ── Preview ────────────────────────────────────────────
// 資訊隔離：前端只顯示相對百分比，不暴露 rPlatform 或 absoluteRate
// 以「可分配資源 = 100%」來試算比例給使用者看
const previewRetained = computed(() =>
  Math.round((100 - rateInput.value) * 100) / 100
)
const previewGiven = computed(() => rateInput.value)

// ── Handlers ───────────────────────────────────────────
function handleSave() {
  if (!isValid.value || !props.target) return
  emit('save', { uid: props.target.uid, allocationRate: rateInput.value })
  emit('close')
}

function handleClose() {
  isHistoryShow.value = false
  emit('close')
}

useBodyScrollLock(() => props.show)

// ── Mock history ───────────────────────────────────────
const historyRecords = ref([
  { date: '2026-06-15 10:22:00', operator: 'master_agent', from: 70, to: 80, reason: '業績優秀調升' },
  { date: '2026-03-01 09:00:00', operator: 'master_agent', from: 0, to: 70, reason: '初始配置' },
])
</script>

<template>
  <Transition name="fade">
    <div v-if="show && target" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="handleClose"></div>

      <!-- Modal -->
      <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden transform transition-all">

        <!-- Header -->
        <div class="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-600 text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div class="relative z-10">
            <h3 class="text-lg font-bold">儲值抽成配置</h3>
            <div class="flex items-center gap-3 mt-1 text-violet-100 text-xs flex-wrap">
              <span class="font-bold">{{ target.account }}</span>
              <span class="opacity-60">|</span>
              <span class="font-mono">{{ target.uid }}</span>
            </div>
          </div>
          <button @click="handleClose" class="relative z-10 p-2 text-violet-100 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 sm:p-8 overflow-y-auto custom-scrollbar space-y-6">

          <!-- 資訊隔離提示 -->
          <div class="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
            <div class="p-1.5 bg-amber-100 rounded-lg text-amber-600 shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div>
              <p class="text-xs font-bold text-amber-800">資訊安全隔離模式</p>
              <p class="text-[11px] text-amber-700 mt-0.5">此介面僅顯示您的相對分配資源（上限恆為 100%）。實際平台原始成數受系統保護，不予顯示。</p>
            </div>
          </div>

          <!-- 可分配上限 -->
          <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span class="text-sm font-bold text-slate-600">可分配資源上限</span>
            <span class="text-xl font-black text-slate-900">100.00%</span>
          </div>

          <!-- 分配率輸入 -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-slate-700">下線分配率 (%)</label>
              <div class="relative w-28">
                <input
                  v-model.number="rateInput"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0.00"
                  class="w-full py-2 pl-3 pr-8 bg-white border rounded-xl text-violet-600 font-black text-sm shadow-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-center"
                  :class="isValid ? 'border-slate-200' : 'border-rose-400 bg-rose-50'"
                >
                <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>

            <!-- Slider -->
            <input
              v-model.number="rateInput"
              type="range"
              min="0"
              max="100"
              step="0.01"
              class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
            >

            <!-- 錯誤訊息 -->
            <p v-if="!isValid" class="text-xs font-bold text-rose-500 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
              {{ validationMsg }}
            </p>
          </div>

          <!-- 預覽拆分 -->
          <div class="rounded-2xl border border-slate-200 overflow-hidden">
            <div class="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">分配預覽</div>
            <div class="divide-y divide-slate-100">
              <div class="flex items-center justify-between px-4 py-3.5">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-violet-500"></div>
                  <span class="text-sm font-bold text-slate-700">撥發給 {{ target.account }}</span>
                </div>
                <span class="text-lg font-black text-violet-600">{{ previewGiven.toFixed(2) }}%</span>
              </div>
              <div class="flex items-center justify-between px-4 py-3.5 bg-slate-50/50">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span class="text-sm font-bold text-slate-600">我的留存</span>
                </div>
                <span class="text-lg font-black text-emerald-600">{{ previewRetained.toFixed(2) }}%</span>
              </div>
            </div>
          </div>

          <!-- 邊界說明 -->
          <div class="text-[11px] text-slate-400 font-medium space-y-1 leading-relaxed">
            <p>· 設定為 <strong>100%</strong>（平級撥發）時，您在此線路的留存利潤將為 0，系統正常執行，不報錯。</p>
            <p>· 代理轉線後，此分配率將自動重置為 <strong>0%</strong>，須重新配置。</p>
            <p>· 變更立即生效，不溯及既往（生效時間點前的儲值記錄維持舊值）。</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <button
            @click="isHistoryShow = true"
            class="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
            變更紀錄
          </button>

          <div class="flex items-center gap-3">
            <button
              @click="handleClose"
              class="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
            >取消</button>
            <button
              @click="handleSave"
              :disabled="!isValid"
              class="px-6 py-2.5 text-sm font-bold rounded-xl shadow-lg transition-all"
              :class="isValid
                ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/20 hover:-translate-y-0.5 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'"
            >
              <span class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                儲存配置
              </span>
            </button>
          </div>
        </div>

        <!-- History Slide-over -->
        <Transition name="slide">
          <div v-if="isHistoryShow" class="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col">
            <div class="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h4 class="text-base font-bold text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-violet-500"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                儲值抽成變更紀錄
              </h4>
              <button @click="isHistoryShow = false" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div class="flex-1 p-6 sm:p-8 overflow-y-auto custom-scrollbar space-y-5">
              <div v-for="(rec, i) in historyRecords" :key="i" class="relative pl-7 pb-5 border-l-2 border-violet-100 last:border-0 last:pb-0">
                <div class="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-violet-500 shadow-sm"></div>
                <div class="text-[11px] font-bold text-slate-400 mb-1.5 font-mono">{{ rec.date }}</div>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black text-slate-700">
                      {{ rec.from }}% → <span class="text-violet-600">{{ rec.to }}%</span>
                    </span>
                    <span class="text-[10px] text-slate-400 font-medium">操作人：{{ rec.operator }}</span>
                  </div>
                  <p class="text-xs text-slate-500">{{ rec.reason }}</p>
                </div>
              </div>
            </div>
            <div class="px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/30 shrink-0">
              <button @click="isHistoryShow = false" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-xl transition-all">
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
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-active .relative, .fade-leave-active .relative { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.fade-enter-from .relative { transform: scale(0.95); opacity: 0; }
.fade-leave-to .relative { transform: scale(0.98); opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-enter-from { transform: translateX(100%); opacity: 0; }
.slide-leave-to { transform: translateX(100%); opacity: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>
