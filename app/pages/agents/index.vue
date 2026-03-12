<script setup lang="ts">
import { ref, computed } from 'vue'
import AgentModal from '~/components/common/AgentModal.vue'
import CpaModal from '~/components/common/CpaModal.vue'
import PromotionFundModal from '~/components/common/PromotionFundModal.vue'

// --- Interface & Data Models ---
interface AgentData {
  id: string; // 代理UID
  uid: string;
  account: string; // 登入帳號
  accountType: string; // 帳號 / 身份類型
  promoCode: string; // 推廣碼
  cpaMatrix: boolean; // CPA 矩陣 (Icon)
  depositCommission: number; // 儲值抽成(%)
  downlineAgents: number; // 下線代理總數
  directPlayers: number; // 直屬玩家總數
  realName: string; // 真實姓名
  phone: string; // 手機號碼
  contact: string; // 聯絡方式
  remark: string; // 備註
  createdAt: string; // 帳號建立日期
  riskAnomaly: boolean; // 風控異常
  status: 'normal' | 'frozen' | 'disabled'; // 帳號狀態
  is2faEnabled: boolean;
}

// --- Mock Data ---
const agents = ref<AgentData[]>([
  {
    id: '1',
    uid: 'AG-10001',
    account: 'master_agent',
    accountType: '總代理',
    promoCode: 'VIP888',
    cpaMatrix: true,
    depositCommission: 45,
    downlineAgents: 120,
    directPlayers: 5400,
    realName: '王大明',
    phone: '0912345678',
    contact: 'Line: @wang123',
    remark: 'VIP客戶來源重點',
    createdAt: '2025-01-15',
    riskAnomaly: false,
    status: 'normal',
    is2faEnabled: true
  },
  {
    id: '2',
    uid: 'AG-10024',
    account: 'agent_l1_lee',
    accountType: '一級代理',
    promoCode: 'WIN666',
    cpaMatrix: false,
    depositCommission: 30,
    downlineAgents: 15,
    directPlayers: 850,
    realName: '李小梅',
    phone: '0987654321',
    contact: 'TG: @lee_m',
    remark: '',
    createdAt: '2025-02-10',
    riskAnomaly: true,
    status: 'frozen',
    is2faEnabled: false
  },
  {
    id: '3',
    uid: 'AG-10055',
    account: 'assistant_chen',
    accountType: '助理帳號',
    promoCode: 'TEST00',
    cpaMatrix: false,
    depositCommission: 15,
    downlineAgents: 0,
    directPlayers: 42,
    realName: '陳建國',
    phone: '0933221100',
    contact: 'WeChat: chen_gg',
    remark: '多期未達標',
    createdAt: '2025-03-01',
    riskAnomaly: false,
    status: 'disabled',
    is2faEnabled: false
  },
  {
    id: '4',
    uid: 'AG-10088',
    account: 'agent_l1_chang',
    accountType: '一級代理',
    promoCode: 'RICH999',
    cpaMatrix: true,
    depositCommission: 35,
    downlineAgents: 42,
    directPlayers: 1200,
    realName: '張美麗',
    phone: '0955667788',
    contact: 'Line: beauty_c',
    remark: '社群流量大',
    createdAt: '2025-03-05',
    riskAnomaly: false,
    status: 'normal',
    is2faEnabled: true
  }
])

// --- Computed & Actions ---
const getStatusLabel = (status: string) => {
  switch(status) {
    case 'normal': return '正常'
    case 'frozen': return '凍結'
    case 'disabled': return '停用'
    default: return '未知'
  }
}

const getStatusColor = (status: string) => {
  switch(status) {
    case 'normal': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'frozen': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'disabled': return 'bg-rose-100 text-rose-700 border-rose-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const handleSearch = (filters: any) => {
  console.log('Search triggered with filters:', filters)
}

const handleReset = () => {
  console.log('Search reset')
}

// --- Modal State & Actions ---
const isModalShow = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const selectedAgent = ref<AgentData | null>(null)

const isCpaModalShow = ref(false)
const selectedCpaAgent = ref<any>(null)

const handleAddAgent = () => {
  modalMode.value = 'add'
  selectedAgent.value = null
  isModalShow.value = true
}

const handleEdit = (agent: AgentData) => {
  modalMode.value = 'edit'
  selectedAgent.value = { ...agent }
  isModalShow.value = true
}

const handleEditCpa = (agent: AgentData) => {
  const capMap: Record<string, number> = {
    '總代理': 1000,
    '一級代理': 500,
    '助理帳號': 300
  }
  
  selectedCpaAgent.value = {
    uid: agent.uid,
    account: agent.realName,
    level: agent.accountType,
    cpaLevel1: (agent as any).cpaLevel1 || 0,
    cpaLevel2: (agent as any).cpaLevel2 || 0,
    cpaLevel3: (agent as any).cpaLevel3 || 0,
    commissionRatio: (agent as any).commissionRatio || 0,
    capCpa: capMap[agent.accountType] || 500
  }
  isCpaModalShow.value = true
}

const handleSaveAgent = (formData: any) => {
  if (modalMode.value === 'add') {
    const newId = (agents.value.length + 1).toString()
    agents.value.unshift({
      ...formData,
      id: newId,
      cpaMatrix: true,
      depositCommission: formData.commissionRatio || 0,
      downlineAgents: 0,
      directPlayers: 0,
      createdAt: new Date().toISOString().split('T')[0],
      riskAnomaly: false
    })
  } else {
    const index = agents.value.findIndex(a => a.uid === formData.uid)
    if (index !== -1) {
      const currentAgent = agents.value[index]
      if (currentAgent) {
        agents.value[index] = { 
          ...currentAgent, 
          ...formData,
          depositCommission: formData.commissionRatio !== undefined ? formData.commissionRatio : currentAgent.depositCommission
        }
      }
    }
  }
}

const handleSaveCpa = (cpaData: any) => {
  const index = agents.value.findIndex(a => a.uid === cpaData.uid)
  if (index !== -1) {
    const agent = agents.value[index] as any
    agent.cpaLevel1 = cpaData.cpaLevel1
    agent.cpaLevel2 = cpaData.cpaLevel2
    agent.cpaLevel3 = cpaData.cpaLevel3
    agent.commissionRatio = cpaData.commissionRatio
    agent.depositCommission = cpaData.commissionRatio
  }
}

// --- Promotion Fund Modal Logic ---
const promotionBalance = ref(25000) // Mock agent promotion fund balance in TWD
const isPromotionModalShow = ref(false)
const selectedAgentForPromotion = ref<any>(null)

const handleOpenPromotion = (agent: AgentData) => {
  selectedAgentForPromotion.value = {
    uid: agent.uid,
    account: agent.realName
  }
  isPromotionModalShow.value = true
}

const handlePromotionSubmit = (data: any) => {
  console.log('Agent Promotion submitted:', data)
  promotionBalance.value -= data.twdAmount
  isPromotionModalShow.value = false
  alert(`成功派發 $${data.amount.toLocaleString()} 台幣給代理 ${data.uid}！`)
}

// --- Privacy / Desensitization Logic ---
const isMasked = ref(true)

const maskString = (str: string, type: 'name' | 'phone') => {
  if (!isMasked.value) return str
  if (!str) return ''
  
  if (type === 'name') {
    if (str.length <= 2) return str[0] + '*'
    return str[0] + '*'.repeat(str.length - 2) + str[str.length - 1]
  } else if (type === 'phone') {
    if (str.length < 7) return str
    return str.slice(0, 4) + '***' + str.slice(-3)
  }
  return str
}

const toggleMask = () => {
  isMasked.value = !isMasked.value
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">代理列表</h1>
        <p class="text-sm text-slate-500 mt-1">管理代理商與配置、CPA 設定與業績概覽</p>
      </div>
      <div class="flex items-center gap-4">
        <button 
          @click="handleAddAgent"
          class="group relative inline-flex items-center gap-2 px-8 py-3 bg-cyan-500 text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/30 hover:bg-cyan-600 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
        >
          <div class="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-30deg] -translate-x-full group-hover:animate-[shine_0.75s_ease-out]"></div>
          <div class="relative flex items-center gap-2">
            <div class="p-1 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </div>
            <span class="tracking-tight text-lg">新增代理</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Search Filters -->
    <CommonAgentSearchFilter @search="handleSearch" @reset="handleReset" />

    <!-- Data Table Card -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <div class="flex items-center gap-3">
          <h3 class="text-base font-semibold text-slate-800">搜尋結果</h3>
          <button 
            @click="toggleMask" 
            class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors tooltip-trigger"
            :title="isMasked ? '已脫敏 (點擊顯示資料)' : '顯示中 (點擊隱藏資料)'"
          >
            <svg v-if="isMasked" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88 3 3m6.12 11.12L3.12 20.88h17.76M21 21l-6.88-6.88M12 4.47a9 9 0 0 1 7.23 4.53m-1.2 5.07A9 9 0 0 1 4.77 12"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
        <div class="text-sm text-slate-500">共 {{ agents.length }} 筆資料</div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left whitespace-nowrap">
          <thead class="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
            <tr>
              <th scope="col" class="px-4 py-3 font-semibold">代理UID</th>
              <th scope="col" class="px-4 py-3 font-semibold">帳號 / 身份類型</th>
              <th scope="col" class="px-4 py-3 font-semibold">推廣碼</th>
              <th scope="col" class="px-4 py-3 font-semibold text-center">CPA 矩陣</th>
              <th scope="col" class="px-4 py-3 font-semibold text-right">儲值抽成</th>
              <th scope="col" class="px-4 py-3 font-semibold text-right">下線總數</th>
              <th scope="col" class="px-4 py-3 font-semibold text-right">玩家總數</th>
              <th scope="col" class="px-4 py-3 font-semibold">真實姓名</th>
              <th scope="col" class="px-4 py-3 font-semibold">手機號碼</th>
              <th scope="col" class="px-4 py-3 font-semibold text-center">風控</th>
              <th scope="col" class="px-4 py-3 font-semibold">狀態</th>
              <th scope="col" class="px-4 py-3 font-semibold text-center sticky right-0 bg-slate-50 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="agent in agents" :key="agent.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-4 py-3 font-medium text-slate-900">{{ agent.uid }}</td>
              <td class="px-4 py-3 text-slate-600">{{ agent.accountType }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 bg-slate-100 text-slate-700 rounded-md font-mono text-xs">{{ agent.promoCode }}</span>
              </td>
              <td class="px-4 py-3 text-center">
                <button 
                  @click="handleEditCpa(agent)"
                  class="p-2 rounded-xl transition-all hover:bg-slate-100 group/cpa tooltip-trigger"
                  :title="agent.cpaMatrix ? '編輯 CPA 配置' : '初始 CPA 配置'"
                >
                  <svg v-if="agent.cpaMatrix" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600 mx-auto transition-transform group-hover/cpa:scale-110"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                  <div v-else class="w-5 h-5 border-2 border-dashed border-slate-300 rounded-md mx-auto flex items-center justify-center group-hover/cpa:border-emerald-500 group-hover/cpa:bg-emerald-50 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300 group-hover/cpa:text-emerald-500"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </div>
                </button>
              </td>
              <td class="px-4 py-3 text-right text-slate-700 font-medium">{{ agent.depositCommission }}%</td>
              <td class="px-4 py-3 text-right text-slate-600">{{ agent.downlineAgents }}</td>
              <td class="px-4 py-3 text-right text-slate-600">{{ agent.directPlayers }}</td>
              <td class="px-4 py-3 text-slate-700">{{ maskString(agent.realName, 'name') }}</td>
              <td class="px-4 py-3 text-slate-600">{{ maskString(agent.phone, 'phone') }}</td>
              <td class="px-4 py-3 text-center">
                <svg v-if="agent.riskAnomaly" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-rose-500 mx-auto"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500 mx-auto"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
              </td>
              <td class="px-4 py-3">
                <span 
                  class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border"
                  :class="getStatusColor(agent.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="agent.status === 'normal' ? 'bg-emerald-500' : agent.status === 'frozen' ? 'bg-amber-500' : 'bg-rose-500'"></span>
                  {{ getStatusLabel(agent.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-center sticky right-0 bg-white shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] border-l border-slate-100 group-hover:bg-slate-50/80 transition-colors">
                <div class="flex items-center gap-2 justify-center">
                  <button 
                    @click="handleEdit(agent)"
                    class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title="編輯"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </button>
                  <button 
                    @click="handleOpenPromotion(agent)"
                    class="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                    title="派發推廣金"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H4v4"/><path d="M2 12h20"/><path d="m20 12 1 4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2l1-4"/><path d="M12 18v4"/><path d="m9 20 3 2 3-2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
        <div class="text-sm text-slate-500">
          顯示 1 到 {{ agents.length }} 筆，共 {{ agents.length }} 筆
        </div>
        <div class="flex items-center gap-1">
          <button class="px-3 py-1 text-sm border border-slate-200 rounded-md text-slate-400 cursor-not-allowed bg-white" disabled>上一頁</button>
          <button class="px-3 py-1 text-sm border border-indigo-600 bg-indigo-600 text-white rounded-md">1</button>
          <button class="px-3 py-1 text-sm border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100 bg-white">下一頁</button>
        </div>
      </div>
    </div>

    <!-- Agent Modal -->
    <AgentModal 
      :show="isModalShow"
      :mode="modalMode"
      :agent="selectedAgent"
      @close="isModalShow = false"
      @save="handleSaveAgent"
    />

    <!-- CPA Edit Modal -->
    <CpaModal 
      :show="isCpaModalShow"
      :agent-data="selectedCpaAgent"
      @close="isCpaModalShow = false"
      @save="handleSaveCpa"
    />

    <!-- Promotion Fund Modal -->
    <PromotionFundModal 
      :show="isPromotionModalShow"
      mode="agent"
      :player-data="selectedAgentForPromotion"
      :promotion-balance="promotionBalance"
      @close="isPromotionModalShow = false"
      @submit="handlePromotionSubmit"
    />
  </div>
</template>

<style scoped>
@keyframes shine {
  from { translate: -150% 0; }
  to { translate: 250% 0; }
}
</style>
