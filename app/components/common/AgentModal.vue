<script setup lang="ts">
import { ref, watch } from 'vue'

interface AgentData {
  id?: string;
  uid: string;
  accountType: string;
  promoCode: string;
  account: string;
  password?: string;
  realName: string;
  phone: string;
  contact: string;
  remark: string;
  status: 'normal' | 'frozen' | 'disabled';
  cpaLevel1?: number;
  cpaLevel2?: number;
  cpaLevel3?: number;
  commissionRatio?: number;
  is2faEnabled: boolean;
}

const props = defineProps<{
  show: boolean;
  agent?: AgentData | null;
  mode: 'add' | 'edit';
}>()

const emit = defineEmits(['close', 'save'])

const form = ref<AgentData>({
  uid: '',
  accountType: '一級代理',
  promoCode: '',
  account: '',
  password: '',
  realName: '',
  phone: '',
  contact: '',
  remark: '',
  status: 'normal',
  cpaLevel1: 0,
  cpaLevel2: 0,
  cpaLevel3: 0,
  commissionRatio: 0,
  is2faEnabled: false
})

const accountTypeOptions = [
  '總代理',
  '一級代理',
  '助理帳號'
]

watch(() => props.agent, (newAgent) => {
  if (newAgent && props.mode === 'edit') {
    form.value = { ...newAgent }
  } else {
    resetForm()
  }
}, { immediate: true })

function generateUID() {
  return 'AG-' + Math.floor(10000 + Math.random() * 90000).toString()
}

function resetForm() {
  form.value = {
    uid: generateUID(),
    accountType: '一級代理',
    promoCode: '',
    account: '',
    password: '',
    realName: '',
    phone: '',
    contact: '',
    remark: '',
    status: 'normal',
    cpaLevel1: 0,
    cpaLevel2: 0,
    cpaLevel3: 0,
    commissionRatio: 0,
    is2faEnabled: false
  }
}

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
      <div class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all border border-slate-200 flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h3 class="text-xl font-bold text-slate-900">
              {{ mode === 'add' ? '新增代理帳號' : '編輯代理資訊' }}
            </h3>
            <p class="text-sm text-slate-500 mt-1">
              {{ mode === 'add' ? '請填寫下方資訊以建立新的代理帳號' : '修改現有代理的配置與聯絡資料' }}
            </p>
          </div>
          <button 
            @click="handleClose"
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <!-- Form Body -->
        <div class="overflow-y-auto max-h-[70vh] custom-scrollbar">
          <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
          <!-- Account & Password -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span class="w-1 h-3 bg-indigo-500 rounded-full"></span>
                登入帳號 <span class="text-rose-500">*</span>
              </label>
              <input 
                v-model="form.account"
                type="text"
                required
                placeholder="請輸入帳號"
                class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 transition-all text-sm outline-none"
              >
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span class="w-1 h-3 bg-indigo-500 rounded-full"></span>
                登入密碼 <span v-if="mode === 'add'" class="text-rose-500">*</span>
              </label>
              <input 
                v-model="form.password"
                type="password"
                :required="mode === 'add'"
                :placeholder="mode === 'add' ? '請輸入密碼' : '留空則不修改'"
                class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 transition-all text-sm outline-none"
              >
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Account Type -->
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span class="w-1 h-3 bg-indigo-500 rounded-full"></span>
                帳號類型 <span v-if="mode === 'edit'" class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-auto">不可修改</span>
              </label>
              <select 
                v-model="form.accountType"
                required
                :disabled="mode === 'edit'"
                class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 disabled:bg-slate-50 disabled:text-slate-900 disabled:font-bold transition-all text-sm outline-none appearance-none"
              >
                <option v-for="opt in accountTypeOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <!-- UID -->
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span class="w-1 h-3 bg-indigo-500 rounded-full"></span>
                代理 UID (系統生成)
              </label>
              <input 
                v-model="form.uid"
                type="text"
                required
                disabled
                placeholder="AG-XXXXX"
                class="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono transition-all text-sm outline-none"
              >
            </div>

            <!-- Promo Code -->
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span class="w-1 h-3 bg-indigo-500 rounded-full"></span>
                推廣碼
              </label>
              <input 
                v-model="form.promoCode"
                type="text"
                required
                placeholder="例如: VIP888"
                class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 transition-all text-sm outline-none"
              >
            </div>

            <!-- Real Name -->
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span class="w-1 h-3 bg-indigo-500 rounded-full"></span>
                真實姓名
              </label>
              <input 
                v-model="form.realName"
                type="text"
                required
                placeholder="輸入完整姓名"
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
                v-model="form.phone"
                type="tel"
                required
                placeholder="例如: 0912345678"
                class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 transition-all text-sm outline-none"
              >
            </div>

              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span class="w-1 h-3 bg-indigo-500 rounded-full"></span>
                  聯絡方式
                </label>
                <input 
                  v-model="form.contact"
                  type="text"
                  placeholder="例如: Line: @wang123"
                  class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 transition-all text-sm outline-none"
                >
              </div>

              <!-- 2FA Toggle -->
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span class="w-1 h-3 bg-indigo-500 rounded-full"></span>
                  2FA 雙重驗證
                </label>
                <div 
                  @click="form.is2faEnabled = !form.is2faEnabled"
                  class="relative inline-flex h-11 w-24 shrink-0 cursor-pointer items-center rounded-xl transition-colors duration-300 focus:outline-none border-2 p-1"
                  :class="form.is2faEnabled ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-100 border-slate-200'"
                >
                  <span 
                    class="pointer-events-none inline-block h-8 w-11 transform rounded-lg bg-white shadow-lg ring-0 transition-transform duration-300 flex items-center justify-center"
                    :class="form.is2faEnabled ? 'translate-x-10' : 'translate-x-0'"
                  >
                    <span class="text-[10px] font-black" :class="form.is2faEnabled ? 'text-indigo-600' : 'text-slate-400'">
                      {{ form.is2faEnabled ? 'ON' : 'OFF' }}
                    </span>
                  </span>
                  <div class="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                    <span class="text-[8px] font-black text-indigo-100 opacity-60" v-if="form.is2faEnabled">ACTIVE</span>
                    <span class="text-[8px] font-black text-slate-400 ml-auto" v-else>DISABLED</span>
                  </div>
                </div>
              </div>
            </div>

          <!-- CPA & Commission Configuration Section -->
          <div v-if="mode === 'add'" class="pt-6 border-t border-slate-100">
            <div class="flex items-center gap-2 mb-6 text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <h4 class="font-bold">CPA 與抽成配置</h4>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- CPA Levels -->
              <div v-for="l in [1, 2, 3]" :key="l" class="space-y-2">
                <label class="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                  CPA 級距 {{ l }}
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">$</span>
                  <input 
                    v-model.number="form['cpaLevel' + l as keyof AgentData]"
                    type="number"
                    placeholder="單價"
                    class="w-full h-10 pl-6 pr-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 transition-all text-sm outline-none"
                  >
                </div>
              </div>
            </div>

            <!-- Commission Ratio -->
            <div class="mt-6 p-4 bg-slate-50 rounded-2xl space-y-4">
              <div class="flex items-center justify-between">
                <label class="text-sm font-bold text-slate-700">下線儲值抽成分配率 (%)</label>
                <div class="relative w-20">
                  <input 
                    v-model.number="form.commissionRatio"
                    type="number"
                    min="0"
                    max="100"
                    class="w-full py-1.5 pl-3 pr-6 bg-white border border-slate-200 rounded-lg text-indigo-600 font-bold text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-center"
                  >
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">%</span>
                </div>
              </div>
              <input 
                v-model.number="form.commissionRatio"
                type="range"
                min="0"
                max="100"
                class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              >
              <p class="text-[10px] text-slate-400 font-medium">
                * 設定給下線的抽成比例，100% 代表平級撥發。
              </p>
            </div>
          </div>

          <!-- Status Section (Only for Edit Mode) -->
          <div v-if="mode === 'edit'" class="pt-6 border-t border-slate-100">
            <div class="flex items-center gap-2 mb-6 text-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
              <h4 class="font-bold">帳號狀態管理</h4>
            </div>

            <div class="flex gap-4">
              <button 
                v-for="s in (['normal', 'frozen', 'disabled'] as const)" 
                :key="s"
                type="button"
                @click="form.status = s"
                class="flex-1 py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 group"
                :class="form.status === s ? {
                  'border-emerald-500 bg-emerald-50': s === 'normal',
                  'border-amber-500 bg-amber-50': s === 'frozen',
                  'border-rose-500 bg-rose-50': s === 'disabled'
                } : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'"
              >
                <div class="w-2 h-2 rounded-full" :class="{
                  'bg-emerald-500': s === 'normal',
                  'bg-amber-500': s === 'frozen',
                  'bg-rose-500': s === 'disabled'
                }"></div>
                <span class="text-xs font-bold" :class="form.status === s ? {
                  'text-emerald-700': s === 'normal',
                  'text-amber-700': s === 'frozen',
                  'text-rose-700': s === 'disabled'
                } : 'text-slate-500'">
                  {{ s === 'normal' ? '正常運作' : s === 'frozen' ? '暫時凍結' : '強制停用' }}
                </span>
              </button>
            </div>
          </div>

          <!-- Remark -->
          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
              <span class="w-1 h-3 bg-indigo-500 rounded-full"></span>
              備註
            </label>
            <textarea 
              v-model="form.remark"
              rows="3"
              placeholder="輸入任何相關備註..."
              class="w-full p-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 transition-all text-sm outline-none resize-none"
            ></textarea>
          </div>
          </form>
        </div>

        <!-- Sticky Footer -->
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
            確認{{ mode === 'add' ? '新增' : '儲存' }}
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
