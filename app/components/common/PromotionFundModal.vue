<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

const props = defineProps<{
  show: boolean
  mode: 'player' | 'agent'
  playerData: {
    uid: string
    account: string
  } | null
  promotionBalance: number
}>()

const emit = defineEmits(['close', 'submit'])

const title = ref('')
const content = ref('')
const amountValue = ref<number | null>(null)

// Conversion logic
const twdEquivalent = computed(() => {
  if (!amountValue.value) return 0
  return props.mode === 'agent' ? amountValue.value : amountValue.value / 100
})

const isOverBalance = computed(() => {
  return twdEquivalent.value > props.promotionBalance
})

const isValid = computed(() => {
  if (props.mode === 'agent') {
    return amountValue.value !== null && 
           amountValue.value > 0 && 
           !isOverBalance.value
  }
  return title.value.trim() !== '' && 
         content.value.trim() !== '' && 
         amountValue.value !== null && 
         amountValue.value > 0 && 
         !isOverBalance.value
})

const resetForm = () => {
  title.value = ''
  content.value = ''
  amountValue.value = null
}

watch(() => props.show, (newVal) => {
  if (newVal) resetForm()
})

useBodyScrollLock(() => props.show)

const handleSubmit = () => {
  if (!isValid.value) return
  emit('submit', {
    uid: props.playerData?.uid,
    title: title.value,
    content: content.value,
    amount: amountValue.value,
    twdAmount: twdEquivalent.value,
    type: props.mode === 'agent' ? 'TWD' : 'Silver'
  })
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="emit('close')"></div>

      <!-- Modal Content -->
      <div class="relative w-full max-w-md max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all border border-slate-100 flex flex-col">
        <!-- Header -->
        <div class="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{{ t('promotion_modal.title') }}</h3>
            <p v-if="playerData" class="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">
              {{ t('promotion_modal.label_target') }}: {{ playerData.uid }} ({{ playerData.account }})
            </p>
          </div>
          
          <!-- Promotion Balance Badge -->
          <div class="flex flex-col items-end">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{{ t('promotion_modal.label_balance') }}</span>
            <div class="flex items-center gap-1.5 text-indigo-600 font-black text-lg">
              <span class="text-sm font-medium">$</span>
              {{ promotionBalance.toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- Form body -->
        <div class="p-5 sm:p-6 space-y-5">
          <!-- Title -->
          <div v-if="mode === 'player'" class="space-y-2">
            <label class="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              {{ t('promotion_modal.label_msg_title') }}
            </label>
            <input 
              v-model="title"
              type="text" 
              :placeholder="t('promotion_modal.placeholder_title') as string"
              class="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 transition-all text-sm font-medium outline-none"
            >
          </div>

          <!-- Content -->
          <div v-if="mode === 'player'" class="space-y-2">
            <label class="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              {{ t('promotion_modal.label_msg_content') }}
            </label>
            <textarea 
              v-model="content"
              rows="3"
              :placeholder="t('promotion_modal.placeholder_content') as string"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 transition-all text-sm font-medium outline-none resize-none"
            ></textarea>
          </div>

          <!-- Amount -->
          <div class="space-y-2">
            <label class="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <div class="w-1.5 h-1.5 rounded-full" :class="mode === 'player' ? 'bg-amber-500' : 'bg-emerald-500'"></div>
              {{ mode === 'player' ? t('promotion_modal.label_amount_silver') : t('promotion_modal.label_amount_twd') }}
            </label>
            <div class="relative">
              <input 
                v-model.number="amountValue"
                type="number" 
                placeholder="0"
                class="w-full h-14 pl-12 pr-4 rounded-xl border-2 focus:ring-0 focus:border-amber-500 transition-all text-xl font-black outline-none"
                :class="isOverBalance ? 'border-rose-400 bg-rose-50' : 'border-slate-100 bg-slate-50/30'"
              >
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <div v-if="mode === 'player'" class="w-6 h-6 rounded-full bg-slate-300 shadow-[0_0_8px_rgba(203,213,225,0.5)]"></div>
                <div v-else class="text-emerald-500 font-bold text-xl">$</div>
              </div>
            </div>
            
            <!-- Exchange Tip & Calculation -->
            <div class="flex items-start justify-between mt-2">
              <p v-if="mode === 'player'" class="text-[11px] text-slate-400 font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                {{ t('promotion_modal.exchange_tip') }}
              </p>
              <p v-else class="text-[11px] text-slate-400 font-bold">
                {{ t('promotion_modal.agent_tip') }}
              </p>

              <div v-if="amountValue && mode === 'player'" class="text-right">
                <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-tighter">{{ t('promotion_modal.twd_equivalent') }}</span>
                <span :class="isOverBalance ? 'text-rose-600 font-black' : 'text-indigo-600 font-bold'">
                  ${{ twdEquivalent.toLocaleString() }}
                </span>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="isOverBalance" class="mt-3 p-3 bg-rose-100 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 animate-shake">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span class="text-xs font-black">{{ t('promotion_modal.error_insufficient') }}</span>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="p-5 sm:p-6 pt-2 flex gap-3">
          <button 
            @click="emit('close')"
            class="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all active:scale-95"
          >
            {{ t('promotion_modal.btn_cancel') }}
          </button>
          <button 
            @click="handleSubmit"
            :disabled="!isValid"
            class="flex-[2] h-12 rounded-xl font-black text-white shadow-xl transition-all active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale disabled:scale-100"
            :class="isValid ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20' : 'bg-slate-300 shadow-none'"
          >
            {{ t('promotion_modal.btn_confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative, .modal-leave-active .relative {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
}
.modal-enter-from .relative, .modal-leave-to .relative {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.2s ease-in-out 0s 2;
}

/* Hide arrows in number input */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
