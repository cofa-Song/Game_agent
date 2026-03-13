<script setup lang="ts">
import { ref, watch } from 'vue'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'

interface ProfileData {
  name: string;
  phoneNumber: string;
  contactInfo: string;
}

const props = defineProps<{
  show: boolean;
  initialData: ProfileData;
}>()

const emit = defineEmits(['close', 'save'])

const form = ref<ProfileData>({
  name: '',
  phoneNumber: '',
  contactInfo: ''
})

watch(() => props.show, (isShown) => {
  if (isShown) {
    form.value = { ...props.initialData }
  }
})

useBodyScrollLock(() => props.show)

function handleClose() {
  emit('close')
}

function handleSubmit() {
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
      <div class="relative w-full max-w-lg max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all border border-slate-200 flex flex-col">
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h3 class="text-xl font-bold text-slate-900">編輯個人資料</h3>
            <p class="text-sm text-slate-500 mt-1">更新您的名稱、手機號碼與聯絡方式</p>
          </div>
          <button 
            @click="handleClose"
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <!-- Form Body -->
        <div class="p-8 space-y-6 overflow-y-auto">
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <!-- Name -->
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span class="w-1 h-3 bg-indigo-500 rounded-full"></span>
                代理名稱
              </label>
              <input 
                v-model="form.name"
                type="text"
                required
                placeholder="請輸入名稱"
                class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 transition-all text-sm outline-none"
              >
            </div>

            <!-- Phone -->
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span class="w-1 h-3 bg-indigo-500 rounded-full"></span>
                手機號碼
              </label>
              <input 
                v-model="form.phoneNumber"
                type="tel"
                required
                placeholder="例如: 0912-345-678"
                class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 transition-all text-sm outline-none"
              >
            </div>

            <!-- Contact -->
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span class="w-1 h-3 bg-indigo-500 rounded-full"></span>
                聯絡方式
              </label>
              <input 
                v-model="form.contactInfo"
                type="text"
                placeholder="例如: Line: @wang123"
                class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 transition-all text-sm outline-none"
              >
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
            確認儲存
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
