<script setup lang="ts">
import { ref, watch } from 'vue'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'

const props = defineProps<{
  show: boolean;
}>()

const emit = defineEmits(['close', 'success'])

const otp = ref(['', '', '', '', '', ''])
const secretKey = ref('JBSW Y3DP EHPK 3PXP') // Mock secret key
const otpInputs = ref<HTMLInputElement[]>([])

watch(() => props.show, (isShown) => {
  if (isShown) {
    otp.value = ['', '', '', '', '', '']
  }
})

useBodyScrollLock(() => props.show)

function handleInput(index: number, e: Event) {
  const target = e.target as HTMLInputElement
  const val = target.value

  if (val && index < 5) {
    otpInputs.value[index + 1]?.focus()
  }
}

function handleKeydown(index: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !otp.value[index] && index > 0) {
    otpInputs.value[index - 1]?.focus()
  }
}

function handleClose() {
  emit('close')
}

function handleSubmit() {
  const code = otp.value.join('')
  if (code.length < 6) {
    alert('請輸入完整的 6 位數驗證碼')
    return
  }
  // In a real app, verify OTP with backend
  console.log('Verifying 2FA OTP:', code)
  emit('success')
  handleClose()
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        @click="handleClose"
      ></div>

      <!-- Modal Content -->
      <div class="relative w-full max-w-md max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all border border-slate-200 flex flex-col">
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h3 class="text-xl font-bold text-slate-900">綁定 2FA 雙重驗證</h3>
            <p class="text-sm text-slate-500 mt-1">增強帳號安全性，防止未經授權的存取</p>
          </div>
          <button 
            @click="handleClose"
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <!-- Form Body -->
        <div class="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
          <!-- Step 1: Scan QR -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 text-indigo-600">
              <span class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold">1</span>
              <h4 class="font-bold text-sm">掃描二維碼</h4>
            </div>
            <div class="flex flex-col items-center gap-4">
              <div class="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                <!-- Use a placeholder or the generated image if available -->
                <div class="w-40 h-40 bg-slate-100 rounded-lg flex items-center justify-center border border-dashed border-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v.01"/></svg>
                </div>
              </div>
              <p class="text-xs text-slate-500 text-center px-4">
                請使用 Google Authenticator 或其他 2FA 應用程式掃描上方二維碼。
              </p>
            </div>
          </div>

          <!-- Step 2: Secret Key -->
          <div class="space-y-3">
            <div class="flex items-center gap-2 text-indigo-600">
              <span class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold">2</span>
              <h4 class="font-bold text-sm">或手動輸入金鑰</h4>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span class="text-sm font-mono font-bold text-slate-700 tracking-wider">{{ secretKey }}</span>
              <button class="text-indigo-600 hover:text-indigo-700 font-bold text-xs">複製</button>
            </div>
          </div>

          <!-- Step 3: Verification Code -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 text-indigo-600">
              <span class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold">3</span>
              <h4 class="font-bold text-sm">輸入 6 位數驗證碼</h4>
            </div>
            <div class="flex justify-between gap-2">
              <input 
                v-for="(n, i) in 6" 
                :key="i"
                ref="otpInputs"
                v-model="otp[i]"
                type="text"
                maxlength="1"
                class="w-full h-12 text-center text-lg font-bold text-indigo-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                @input="handleInput(i, $event)"
                @keydown="handleKeydown(i, $event)"
              >
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
          <button 
            type="button"
            @click="handleClose"
            class="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
          >
            取消
          </button>
          <button 
            @click="handleSubmit"
            class="px-10 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transform transition-all hover:-translate-y-0.5 active:scale-95"
          >
            確認綁定
          </button>
        </div>
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
</style>
