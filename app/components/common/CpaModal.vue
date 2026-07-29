<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

interface CpaData {
  uid: string;
  account: string;
  level: string;
  depth?: number;
  baseCpa: number; // Platform-configured base CPA price (Cbase)
}

const props = defineProps<{
  show: boolean;
  agentData: CpaData | null;
}>()

const emit = defineEmits(['close'])

const isHistoryShow = ref(false)

// Mock history data (platform admin actions only)
const historyRecords = ref([
  { date: '2026-03-10 14:30:22', admin: 'Platform_Admin', action: '調整基礎單價', details: 'Cbase: $800 → $1,000' },
  { date: '2026-01-05 09:12:05', admin: 'System', action: '初始配置', details: 'Cbase: $1,000' },
])

const handleClose = () => {
  isHistoryShow.value = false
  emit('close')
}

useBodyScrollLock(() => props.show)

// Fixed bottom-up distribution rules depending on agent's own level (L0 vs L1+)
const distRules = computed(() => {
  const base = props.agentData?.baseCpa ?? 0
  const isL0 = props.agentData?.depth === 0

  if (isL0) {
    return [
      { key: 'dist_a0', ratio: 100, amount: Math.floor(base * 1.0) },
      { key: 'dist_a1', ratio: 50, amount: Math.floor(base * 0.5) },
      { key: 'dist_a2', ratio: 25, amount: Math.floor(base * 0.25) },
      { key: 'dist_a3', ratio: 0,  amount: 0 },
    ]
  } else {
    return [
      { key: 'dist_a0', ratio: 50, amount: Math.floor(base * 0.5) },
      { key: 'dist_a1', ratio: 25, amount: Math.floor(base * 0.25) },
      { key: 'dist_a2', ratio: 25, amount: Math.floor(base * 0.25) },
      { key: 'dist_a3', ratio: 0,  amount: 0 },
    ]
  }
})

const formatAmount = (n: number) => new Intl.NumberFormat().format(n)
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
        <div class="px-5 sm:px-8 py-4 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div class="relative z-10">
            <h3 class="text-lg sm:text-xl font-bold">{{ t('cpa_modal.title') }}</h3>
            <div class="flex items-center gap-2 sm:gap-4 mt-1 text-emerald-50 text-xs flex-wrap">
              <span class="font-bold">{{ t('cpa_modal.label_target') }}：{{ agentData.account }}</span>
              <span class="opacity-70 hidden sm:inline">|</span>
              <span class="font-mono">ID: {{ agentData.uid }}</span>
              <span class="px-2 py-0.5 bg-white/20 rounded-full font-bold">{{ agentData.level }}</span>
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
        <div class="p-5 sm:p-8 overflow-y-auto custom-scrollbar space-y-6">

          <!-- Mechanism Badge -->
          <div class="flex items-center gap-3 p-3 bg-teal-50 border border-teal-100 rounded-2xl">
            <div class="p-2 bg-teal-100 rounded-xl text-teal-600 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>
            </div>
            <div>
              <p class="text-sm font-bold text-teal-800">{{ t('cpa_modal.mechanism_title') }}</p>
              <p class="text-xs text-teal-600 mt-0.5">SAL-302 · 固定比例 · 系統自動結算</p>
            </div>
            <span class="ml-auto px-2.5 py-1 bg-teal-100 text-teal-700 text-[10px] font-black rounded-full uppercase tracking-wide">AUTO</span>
          </div>

          <!-- Base CPA Price -->
          <div class="space-y-3">
            <div class="flex items-center gap-2 text-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-600"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <h4 class="font-bold text-sm">{{ t('cpa_modal.base_cpa_label') }}</h4>
            </div>
            <div class="flex items-center gap-4 p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div class="flex-1">
                <span class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  ${{ formatAmount(agentData.baseCpa) }}
                </span>
                <span class="text-sm font-bold text-slate-400 ml-1">TWD</span>
              </div>
              <div class="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span class="text-[11px] font-bold">{{ t('cpa_modal.readonly_note').split('，')[0] }}</span>
              </div>
            </div>
          </div>

          <!-- Distribution Rules Table -->
          <div class="space-y-3">
            <div class="flex items-center gap-2 text-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
              <h4 class="font-bold text-sm">{{ t('cpa_modal.dist_rule_title') }}</h4>
            </div>

            <div class="rounded-2xl border border-slate-200 overflow-hidden">
              <!-- Table header -->
              <div class="grid grid-cols-4 bg-slate-50 border-b border-slate-200 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-2.5">
                <span>傭金來源層級</span>
                <span class="text-center">比例</span>
                <span class="col-span-2 text-right pr-1">{{ t('cpa_modal.example_title') }}（Cbase={{ formatAmount(agentData.baseCpa) }}）</span>
              </div>

              <!-- Rows -->
              <div
                v-for="(rule, idx) in distRules"
                :key="rule.key"
                class="grid grid-cols-4 items-center px-4 py-3.5 border-b border-slate-100 last:border-0 transition-colors"
                :class="rule.ratio > 0 ? 'bg-white hover:bg-emerald-50/30' : 'bg-slate-50/60'"
              >
                <!-- Level label -->
                <div class="flex items-center gap-2">
                  <div
                    class="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                    :class="{
                      'bg-indigo-100 text-indigo-700': idx === 0,
                      'bg-sky-100 text-sky-700': idx === 1,
                      'bg-violet-100 text-violet-700': idx === 2,
                      'bg-slate-100 text-slate-400': idx === 3
                    }"
                  >A{{ idx }}</div>
                  <span class="text-xs font-bold text-slate-700">{{ t(`cpa_modal.dist_a${idx === 3 ? '3' : idx}`) }}</span>
                </div>

                <!-- Ratio bar -->
                <div class="text-center">
                  <span
                    class="text-sm font-black"
                    :class="rule.ratio > 0 ? 'text-slate-800' : 'text-slate-300'"
                  >{{ rule.ratio }}%</span>
                </div>

                <!-- Bar + Amount -->
                <div class="col-span-2 flex items-center gap-3 justify-end">
                  <div class="flex-1 max-w-[100px] sm:max-w-[140px] h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      :class="{
                        'bg-indigo-500': idx === 0,
                        'bg-sky-400': idx === 1,
                        'bg-violet-400': idx === 2,
                        'bg-slate-200': idx === 3
                      }"
                      :style="{ width: rule.ratio + '%' }"
                    ></div>
                  </div>
                  <span
                    class="text-sm font-black tabular-nums w-20 text-right"
                    :class="rule.ratio > 0 ? 'text-emerald-700' : 'text-slate-300'"
                  >
                    {{ rule.ratio > 0 ? `$${formatAmount(rule.amount)}` : '–' }}
                  </span>
                </div>
              </div>

              <!-- Total -->
              <div class="grid grid-cols-4 items-center px-4 py-3 bg-emerald-50 border-t-2 border-emerald-200">
                <span class="text-xs font-black text-emerald-800 col-span-2">總發放 (Total)</span>
                <div></div>
                <span class="text-sm font-black text-emerald-700 text-right pr-1">
                  ${{ formatAmount(agentData.baseCpa) }}
                </span>
              </div>
            </div>

            <!-- Note -->
            <p class="text-[11px] text-slate-400 font-medium leading-relaxed">
              {{ t('cpa_modal.example_note') }}
            </p>
          </div>

          <!-- Edge Case Note -->
          <div class="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl space-y-2">
            <div class="flex items-center gap-2 text-amber-700 font-bold text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              邊界規則說明
            </div>
            <ul class="text-[11px] text-amber-700/80 space-y-1 font-medium list-disc pl-4">
              <li>若玩家直屬總代理，A0 獨得 100%（1,000 元），無 A1/A2</li>
              <li>若中間代理帳號被停用，其份額將<strong>截留至平台</strong>，不遞補給上級</li>
              <li>考核時效內未達標的玩家，永久失去觸發 CPA 資格</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 sm:px-8 py-4 sm:py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <button
            @click="isHistoryShow = true"
            class="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
            {{ t('cpa_modal.history_btn') }}
          </button>

          <button
            @click="handleClose"
            class="px-6 sm:px-10 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-800/20 transform transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            <span>{{ t('cpa_modal.btn_close') }}</span>
          </button>
        </div>

        <!-- History Sidebar (Slide-over within modal) -->
        <Transition name="slide">
          <div v-if="isHistoryShow" class="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col">
            <div class="px-5 sm:px-8 py-4 sm:py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h4 class="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                {{ t('cpa_modal.history_title') }}
              </h4>
              <button
                @click="isHistoryShow = false"
                class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div class="flex-1 p-5 sm:p-8 overflow-y-auto custom-scrollbar space-y-6">
              <div v-for="(record, idx) in historyRecords" :key="idx" class="relative pl-8 pb-6 border-l-2 border-indigo-100 last:border-0 last:pb-0">
                <div class="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-indigo-500 shadow-sm"></div>
                <div class="text-xs font-bold text-slate-400 mb-1 font-mono">{{ record.date }}</div>
                <div class="p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">{{ record.action }}</span>
                    <span class="text-xs text-slate-500 font-medium">{{ t('cpa_modal.history_operator') }}: {{ record.admin }}</span>
                  </div>
                  <p class="text-sm text-slate-600 leading-relaxed font-mono">{{ record.details }}</p>
                </div>
              </div>
            </div>

            <div class="px-5 sm:px-8 py-4 sm:py-6 border-t border-slate-100 flex items-center justify-center bg-slate-50/30">
              <button
                @click="isHistoryShow = false"
                class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-xl transition-all"
              >
                {{ t('cpa_modal.history_close') }}
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

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
</style>
