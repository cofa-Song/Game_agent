<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean;
}>()

const emit = defineEmits(['close', 'save'])

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const showPasswords = ref({
  current: false,
  new: false,
  confirm: false
})

watch(() => props.show, (isShown) => {
  if (isShown) {
    form.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    showPasswords.value = {
      current: false,
      new: false,
      confirm: false
    }
  }
})

function handleClose() {
  emit('close')
}

function handleSubmit() {
  if (form.value.newPassword !== form.value.confirmPassword) {
    alert('新密碼與確認密瑪不符')
    return
  }
  emit('save', { ...form.value })
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
      <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all border border-slate-200 flex flex-col">
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h3 class="text-xl font-bold text-slate-900">修改登入密碼</h3>
            <p class="text-sm text-slate-500 mt-1">為了您的帳號安全，請定期更換密碼</p>
          </div>
          <button 
            @click="handleClose"
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <!-- Form Body -->
        <div class="p-8 space-y-6">
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <!-- Current Password -->
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span class="w-1 h-3 bg-amber-500 rounded-full"></span>
                當前密碼
              </label>
              <div class="relative">
                <input 
                  v-model="form.currentPassword"
                  :type="showPasswords.current ? 'text' : 'password'"
                  required
                  placeholder="請輸入目前使用的密碼"
                  class="w-full h-11 pl-4 pr-11 rounded-xl border border-slate-200 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 bg-slate-50/50 transition-all text-sm outline-none"
                >
                <button 
                  type="button"
                  @click="showPasswords.current = !showPasswords.current"
                  class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg v-if="showPasswords.current" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88 3.62 3.62"/><path d="M2 2l20 20"/><path d="M10.37 5.22a8.92 8.92 0 0 1 11.13 5.4 9.1 9.1 0 0 1-1.38 3.7"/><path d="M5.89 5.89a9.04 9.04 0 0 0-3.39 4.72 9 9 0 0 0 8.01 10.55 9 9 0 0 0 6.13-2.31"/><path d="m14.12 14.12-1.77-1.77"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            <!-- New Password -->
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span class="w-1 h-3 bg-indigo-500 rounded-full"></span>
                新密碼
              </label>
              <div class="relative">
                <input 
                  v-model="form.newPassword"
                  :type="showPasswords.new ? 'text' : 'password'"
                  required
                  placeholder="請輸入新密碼"
                  class="w-full h-11 pl-4 pr-11 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 transition-all text-sm outline-none"
                >
                <button 
                  type="button"
                  @click="showPasswords.new = !showPasswords.new"
                  class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg v-if="showPasswords.new" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88 3.62 3.62"/><path d="M2 2l20 20"/><path d="M10.37 5.22a8.92 8.92 0 0 1 11.13 5.4 9.1 9.1 0 0 1-1.38 3.7"/><path d="M5.89 5.89a9.04 9.04 0 0 0-3.39 4.72 9 9 0 0 0 8.01 10.55 9 9 0 0 0 6.13-2.31"/><path d="m14.12 14.12-1.77-1.77"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span class="w-1 h-3 bg-indigo-500 rounded-full"></span>
                確認新密碼
              </label>
              <div class="relative">
                <input 
                  v-model="form.confirmPassword"
                  :type="showPasswords.confirm ? 'text' : 'password'"
                  required
                  placeholder="請再次輸入新密碼"
                  class="w-full h-11 pl-4 pr-11 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 transition-all text-sm outline-none"
                >
                <button 
                  type="button"
                  @click="showPasswords.confirm = !showPasswords.confirm"
                  class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg v-if="showPasswords.confirm" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88 3.62 3.62"/><path d="M2 2l20 20"/><path d="M10.37 5.22a8.92 8.92 0 0 1 11.13 5.4 9.1 9.1 0 0 1-1.38 3.7"/><path d="M5.89 5.89a9.04 9.04 0 0 0-3.39 4.72 9 9 0 0 0 8.01 10.55 9 9 0 0 0 6.13-2.31"/><path d="m14.12 14.12-1.77-1.77"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
          </form>
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
            確認修改
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
