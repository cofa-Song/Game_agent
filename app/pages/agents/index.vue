<script setup lang="ts">
import { ref, computed } from 'vue'
import AgentModal from '~/components/common/AgentModal.vue'
import CpaModal from '~/components/common/CpaModal.vue'
import CommissionModal from '~/components/common/CommissionModal.vue'
import PromotionFundModal from '~/components/common/PromotionFundModal.vue'
import { useI18n } from '~/composables/useI18n'
import {
  type AgentNode,
  buildTree,
  type TreeNode,
  getDepthLabel,
  computeCpaDistribution,
  getAncestors
} from '~/composables/useAgentTree'

const { t } = useI18n()

// ─────────────────────────────────────────────
// 資料模型
// ─────────────────────────────────────────────
interface AgentData extends AgentNode {
  id: string
  promoCode: string
  cpaEnabled: boolean
  baseCpa: number
  depositCommission: number      // 顯示用：上級給我的分配率
  downlineAgents: number
  directPlayers: number
  phone: string
  contact: string
  remark: string
  createdAt: string
  riskAnomaly: boolean
  commissionAllocationRate: number
}

// ─────────────────────────────────────────────
// Mock Data：6 層代理展示無限層架構
// ─────────────────────────────────────────────
const agents = ref<AgentData[]>([
  // 層 0：總代理（根節點）
  {
    id: '1', uid: 'AG-10001', parentUid: null, depth: 0,
    account: 'master_agent', accountType: '總代理', promoCode: 'VIP888',
    realName: '王大明', phone: '0912345678', contact: 'Line: @wang123',
    remark: 'VIP客戶來源重點', createdAt: '2025-01-15',
    cpaEnabled: true, baseCpa: 1200,
    depositCommission: 100, commissionAllocationRate: 100,
    downlineAgents: 120, directPlayers: 5400,
    riskAnomaly: false, status: 'normal', is2faEnabled: true
  },
  // 層 1：一級代理
  {
    id: '2', uid: 'AG-10024', parentUid: 'AG-10001', depth: 1,
    account: 'agent_l1_lee', accountType: '一級代理', promoCode: 'WIN666',
    realName: '李小梅', phone: '0987654321', contact: 'TG: @lee_m',
    remark: '', createdAt: '2025-02-10',
    cpaEnabled: true, baseCpa: 1200,
    depositCommission: 80, commissionAllocationRate: 80,
    downlineAgents: 15, directPlayers: 850,
    riskAnomaly: true, status: 'frozen', is2faEnabled: false
  },
  {
    id: '4', uid: 'AG-10088', parentUid: 'AG-10001', depth: 1,
    account: 'agent_l1_chang', accountType: '一級代理', promoCode: 'RICH999',
    realName: '張美麗', phone: '0955667788', contact: 'Line: beauty_c',
    remark: '社群流量大', createdAt: '2025-03-05',
    cpaEnabled: true, baseCpa: 1200,
    depositCommission: 75, commissionAllocationRate: 75,
    downlineAgents: 42, directPlayers: 1200,
    riskAnomaly: false, status: 'normal', is2faEnabled: true
  },
  // 層 2：二級代理
  {
    id: '5', uid: 'AG-10102', parentUid: 'AG-10024', depth: 2,
    account: 'agent_l2_wu', accountType: '二級代理', promoCode: 'WU520',
    realName: '吳俊賢', phone: '0933112233', contact: 'WeChat: wu_jx',
    remark: '', createdAt: '2025-04-01',
    cpaEnabled: true, baseCpa: 1200,
    depositCommission: 50, commissionAllocationRate: 50,
    downlineAgents: 8, directPlayers: 320,
    riskAnomaly: false, status: 'normal', is2faEnabled: false
  },
  {
    id: '6', uid: 'AG-10115', parentUid: 'AG-10088', depth: 2,
    account: 'agent_l2_lin', accountType: '二級代理', promoCode: 'LIN777',
    realName: '林雅婷', phone: '0966554433', contact: 'Line: @lin_ya',
    remark: '直播主帶量', createdAt: '2025-04-15',
    cpaEnabled: true, baseCpa: 1200,
    depositCommission: 60, commissionAllocationRate: 60,
    downlineAgents: 12, directPlayers: 580,
    riskAnomaly: false, status: 'normal', is2faEnabled: true
  },
  // 層 3：三級代理
  {
    id: '7', uid: 'AG-10233', parentUid: 'AG-10102', depth: 3,
    account: 'agent_l3_chen', accountType: '三級代理', promoCode: 'CHEN3',
    realName: '陳建國', phone: '0933221100', contact: 'WeChat: chen_gg',
    remark: '多期未達標', createdAt: '2025-05-01',
    cpaEnabled: true, baseCpa: 1200,
    depositCommission: 40, commissionAllocationRate: 40,
    downlineAgents: 3, directPlayers: 95,
    riskAnomaly: false, status: 'disabled', is2faEnabled: false
  },
  {
    id: '8', uid: 'AG-10244', parentUid: 'AG-10115', depth: 3,
    account: 'agent_l3_huang', accountType: '三級代理', promoCode: 'HUG100',
    realName: '黃偉志', phone: '0911223344', contact: 'TG: @hug100',
    remark: '', createdAt: '2025-05-10',
    cpaEnabled: true, baseCpa: 1200,
    depositCommission: 45, commissionAllocationRate: 45,
    downlineAgents: 5, directPlayers: 210,
    riskAnomaly: false, status: 'normal', is2faEnabled: false
  },
  // 層 4：四級代理
  {
    id: '9', uid: 'AG-10355', parentUid: 'AG-10244', depth: 4,
    account: 'agent_l4_su', accountType: '四級代理', promoCode: 'SU4TH',
    realName: '蘇怡君', phone: '0977889900', contact: 'Line: @su_j',
    remark: '', createdAt: '2025-06-01',
    cpaEnabled: true, baseCpa: 1200,
    depositCommission: 30, commissionAllocationRate: 30,
    downlineAgents: 1, directPlayers: 48,
    riskAnomaly: false, status: 'normal', is2faEnabled: false
  },
  // 層 5：五級代理（展示無限層）
  {
    id: '10', uid: 'AG-10466', parentUid: 'AG-10355', depth: 5,
    account: 'agent_l5_tsai', accountType: '五級代理', promoCode: 'TSA5L',
    realName: '蔡明哲', phone: '0955001122', contact: 'WeChat: tsai_mz',
    remark: '最新加入', createdAt: '2025-07-15',
    cpaEnabled: true, baseCpa: 1200,
    depositCommission: 20, commissionAllocationRate: 20,
    downlineAgents: 0, directPlayers: 12,
    riskAnomaly: false, status: 'normal', is2faEnabled: false
  },
  // 助理帳號
  {
    id: '3', uid: 'AG-10055', parentUid: 'AG-10001', depth: 1,
    account: 'assistant_chen', accountType: '助理帳號', promoCode: 'TEST00',
    realName: '陳助理', phone: '0933221100', contact: 'WeChat: chen_gg',
    remark: '助理帳號無法推廣', createdAt: '2025-03-01',
    cpaEnabled: false, baseCpa: 1200,
    depositCommission: 0, commissionAllocationRate: 0,
    downlineAgents: 0, directPlayers: 42,
    riskAnomaly: false, status: 'disabled', is2faEnabled: false
  }
])

// ─────────────────────────────────────────────
// 視圖模式：列表 / 樹狀
// ─────────────────────────────────────────────
const viewMode = ref<'list' | 'tree'>('list')

// 樹狀資料
const agentTree = computed(() => buildTree(agents.value as AgentNode[]))

// 樹狀展開狀態
const expandedNodes = ref<Set<string>>(new Set(['AG-10001', 'AG-10024', 'AG-10088']))

function toggleNode(uid: string) {
  if (expandedNodes.value.has(uid)) {
    expandedNodes.value.delete(uid)
  } else {
    expandedNodes.value.add(uid)
  }
}

// ─────────────────────────────────────────────
// 帳號類型 & 狀態
// ─────────────────────────────────────────────
const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    normal: t('agents.status_normal'),
    frozen: t('agents.status_frozen'),
    disabled: t('agents.status_disabled')
  }
  return map[status] || t('agents.status_unknown')
}

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    normal: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    frozen: 'bg-amber-100 text-amber-700 border-amber-200',
    disabled: 'bg-rose-100 text-rose-700 border-rose-200'
  }
  return map[status] || 'bg-slate-100 text-slate-600 border-slate-200'
}

// 深度顏色徽章
const depthColors = [
  'bg-indigo-100 text-indigo-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
  'bg-rose-100 text-rose-700',
]
function getDepthColor(depth: number) {
  return depthColors[depth] || 'bg-slate-100 text-slate-600'
}

// ─────────────────────────────────────────────
// 搜尋 / 重置
// ─────────────────────────────────────────────
const handleSearch = (filters: any) => console.log('Search:', filters)
const handleReset = () => console.log('Reset')

// ─────────────────────────────────────────────
// 脫敏
// ─────────────────────────────────────────────
const isMasked = ref(true)

const maskString = (str: string, type: 'name' | 'phone') => {
  if (!isMasked.value || !str) return str
  if (type === 'name') {
    if (str.length <= 2) return str[0] + '*'
    return str[0] + '*'.repeat(str.length - 2) + str[str.length - 1]
  }
  return str.length < 7 ? str : str.slice(0, 4) + '***' + str.slice(-3)
}

// ─────────────────────────────────────────────
// Modal：新增/編輯代理
// ─────────────────────────────────────────────
const isModalShow = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const selectedAgent = ref<AgentData | null>(null)

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

const handleSaveAgent = (formData: any) => {
  if (modalMode.value === 'add') {
    agents.value.unshift({
      ...formData,
      id: (agents.value.length + 1).toString(),
      parentUid: 'AG-10001',
      depth: 1,
      cpaEnabled: true,
      baseCpa: 1200,
      depositCommission: formData.commissionRatio || 0,
      commissionAllocationRate: formData.commissionRatio || 0,
      downlineAgents: 0,
      directPlayers: 0,
      createdAt: new Date().toISOString().split('T')[0],
      riskAnomaly: false
    })
  } else {
    const idx = agents.value.findIndex(a => a.uid === formData.uid)
    if (idx !== -1) {
      const current = agents.value[idx]
      agents.value[idx] = {
        ...current,
        ...formData,
        depositCommission: formData.commissionRatio ?? current.depositCommission,
        commissionAllocationRate: formData.commissionRatio ?? current.commissionAllocationRate
      }
    }
  }
}

// ─────────────────────────────────────────────
// Modal：CPA 分潤檢視（SAL-302）
// ─────────────────────────────────────────────
const isCpaModalShow = ref(false)
const selectedCpaAgent = ref<any>(null)

const handleViewCpa = (agent: AgentData) => {
  // 取得向上的代理鏈
  const chain = getAncestors(agent.uid, agents.value as AgentNode[])
  const dist = computeCpaDistribution(agent.baseCpa || 1200, chain)
  selectedCpaAgent.value = {
    uid: agent.uid,
    account: agent.account,
    level: getDepthLabel(agent.depth),
    depth: agent.depth,
    baseCpa: agent.baseCpa || 1200,
    distribution: dist
  }
  isCpaModalShow.value = true
}

// ─────────────────────────────────────────────
// Modal：儲值抽成配置（SAL-303）
// ─────────────────────────────────────────────
const isCommissionModalShow = ref(false)
const selectedCommissionTarget = ref<any>(null)

const handleEditCommission = (agent: AgentData) => {
  selectedCommissionTarget.value = {
    uid: agent.uid,
    account: agent.account,
    realName: agent.realName,
    currentRate: agent.commissionAllocationRate
  }
  isCommissionModalShow.value = true
}

const handleSaveCommission = (payload: { uid: string; allocationRate: number }) => {
  const idx = agents.value.findIndex(a => a.uid === payload.uid)
  if (idx !== -1) {
    agents.value[idx].commissionAllocationRate = payload.allocationRate
    agents.value[idx].depositCommission = payload.allocationRate
  }
}

// ─────────────────────────────────────────────
// Modal：派發推廣金
// ─────────────────────────────────────────────
const promotionBalance = ref(25000)
const isPromotionModalShow = ref(false)
const selectedAgentForPromotion = ref<any>(null)

const handleOpenPromotion = (agent: AgentData) => {
  selectedAgentForPromotion.value = { uid: agent.uid, account: agent.realName }
  isPromotionModalShow.value = true
}

const handlePromotionSubmit = (data: any) => {
  promotionBalance.value -= data.twdAmount
  isPromotionModalShow.value = false
  alert(t('promotion_modal.success_msg', { amount: data.amount.toLocaleString(), uid: data.uid }))
}
</script>

<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{{ t('agents.title') }}</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">{{ t('agents.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- 視圖切換 -->
        <div class="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
          <button
            @click="viewMode = 'list'"
            class="px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
            :class="viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
            列表
          </button>
          <button
            @click="viewMode = 'tree'"
            class="px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
            :class="viewMode === 'tree' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"/><polyline points="6,9 12,15 18,9"/></svg>
            樹狀
          </button>
        </div>

        <button
          @click="handleAddAgent"
          class="group relative inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 bg-cyan-500 text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/30 hover:bg-cyan-600 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden w-full sm:w-auto justify-center"
        >
          <div class="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-30deg] -translate-x-full group-hover:animate-[shine_0.75s_ease-out]"></div>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span class="tracking-tight text-sm sm:text-base">{{ t('agents.btn_add') }}</span>
        </button>
      </div>
    </div>

    <!-- Search Filters -->
    <CommonAgentSearchFilter @search="handleSearch" @reset="handleReset" />

    <!-- Data Table Card -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <div class="flex items-center gap-3">
          <h3 class="text-sm sm:text-base font-semibold text-slate-800">{{ t('agents.search_results') }}</h3>
          <button
            @click="isMasked = !isMasked"
            class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
            :title="isMasked ? t('agents.tooltip_masked') as string : t('agents.tooltip_unmasked') as string"
          >
            <svg v-if="isMasked" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88 3 3m6.12 11.12L3.12 20.88h17.76M21 21l-6.88-6.88M12 4.47a9 9 0 0 1 7.23 4.53m-1.2 5.07A9 9 0 0 1 4.77 12"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
        <div class="text-xs sm:text-sm text-slate-500">{{ t('agents.total_count', { count: agents.length }) }}</div>
      </div>

      <!-- ════════════════════════════════════════ -->
      <!-- LIST VIEW                                -->
      <!-- ════════════════════════════════════════ -->
      <div v-if="viewMode === 'list'">
        <!-- Desktop Table -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="w-full text-sm text-left whitespace-nowrap">
            <thead class="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
              <tr>
                <th class="px-4 py-3 font-semibold">{{ t('agents.col_uid') }}</th>
                <th class="px-4 py-3 font-semibold">層級</th>
                <th class="px-4 py-3 font-semibold">{{ t('agents.col_account_type') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('agents.col_promo_code') }}</th>
                <th class="px-4 py-3 font-semibold text-center">CPA</th>
                <th class="px-4 py-3 font-semibold text-center">儲值抽成</th>
                <th class="px-4 py-3 font-semibold text-right">{{ t('agents.col_downline_agents') }}</th>
                <th class="px-4 py-3 font-semibold text-right">{{ t('agents.col_direct_players') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('agents.col_real_name') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('agents.col_phone') }}</th>
                <th class="px-4 py-3 font-semibold text-center">{{ t('agents.col_risk') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('agents.col_status') }}</th>
                <th class="px-4 py-3 font-semibold text-center sticky right-0 bg-slate-50 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]">{{ t('agents.col_actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="agent in agents" :key="agent.id" class="hover:bg-slate-50/80 transition-colors">
                <!-- UID -->
                <td class="px-4 py-3 font-mono text-xs font-medium text-slate-600">{{ agent.uid }}</td>
                <!-- 深度徽章 -->
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black"
                    :class="getDepthColor(agent.depth)"
                  >
                    L{{ agent.depth }} {{ getDepthLabel(agent.depth) }}
                  </span>
                </td>
                <!-- 帳號類型 -->
                <td class="px-4 py-3 text-slate-600 text-xs">{{ agent.accountType }}</td>
                <!-- 推廣碼 -->
                <td class="px-4 py-3">
                  <span class="px-2 py-1 bg-slate-100 text-slate-700 rounded-md font-mono text-xs">{{ agent.promoCode }}</span>
                </td>
                <!-- CPA 按鈕 -->
                <td class="px-4 py-3 text-center">
                  <button
                    @click="handleViewCpa(agent)"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all hover:-translate-y-0.5"
                    :class="agent.cpaEnabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'"
                    :disabled="!agent.cpaEnabled"
                    :title="agent.cpaEnabled ? '查看 CPA 分潤配置' : 'CPA 功能未啟用'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    {{ agent.cpaEnabled ? `${agent.baseCpa.toLocaleString()}` : 'N/A' }}
                  </button>
                </td>
                <!-- 儲值抽成按鈕 -->
                <td class="px-4 py-3 text-center">
                  <button
                    @click="handleEditCommission(agent)"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-all hover:-translate-y-0.5"
                    title="配置儲值抽成分配率"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                    {{ agent.commissionAllocationRate }}%
                  </button>
                </td>
                <!-- 數量 -->
                <td class="px-4 py-3 text-right text-slate-600 text-xs">{{ agent.downlineAgents }}</td>
                <td class="px-4 py-3 text-right text-slate-600 text-xs">{{ agent.directPlayers }}</td>
                <!-- 個人資訊 -->
                <td class="px-4 py-3 text-slate-700 text-xs">{{ maskString(agent.realName, 'name') }}</td>
                <td class="px-4 py-3 text-slate-600 text-xs">{{ maskString(agent.phone, 'phone') }}</td>
                <!-- 風控 -->
                <td class="px-4 py-3 text-center">
                  <svg v-if="agent.riskAnomaly" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-rose-500 mx-auto"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-emerald-500 mx-auto"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                </td>
                <!-- 狀態 -->
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border" :class="getStatusColor(agent.status)">
                    <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="agent.status === 'normal' ? 'bg-emerald-500' : agent.status === 'frozen' ? 'bg-amber-500' : 'bg-rose-500'"></span>
                    {{ getStatusLabel(agent.status) }}
                  </span>
                </td>
                <!-- 操作 -->
                <td class="px-4 py-3 text-center sticky right-0 bg-white shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] border-l border-slate-100">
                  <div class="flex items-center gap-1.5 justify-center">
                    <button @click="handleEdit(agent)" class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" :title="t('agents.tooltip_edit') as string">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button @click="handleOpenPromotion(agent)" class="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" :title="t('agents.tooltip_promotion') as string">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12V8H4v4"/><path d="M2 12h20"/><path d="m20 12 1 4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2l1-4"/><path d="M12 18v4"/><path d="m9 20 3 2 3-2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card Layout -->
        <div class="lg:hidden divide-y divide-slate-100">
          <div v-for="agent in agents" :key="agent.id" class="p-4 hover:bg-slate-50/80 transition-colors">
            <div class="flex items-start justify-between mb-3">
              <div>
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="font-bold text-slate-900 text-sm font-mono">{{ agent.uid }}</span>
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border" :class="getStatusColor(agent.status)">
                    <span class="w-1 h-1 rounded-full mr-1" :class="agent.status === 'normal' ? 'bg-emerald-500' : agent.status === 'frozen' ? 'bg-amber-500' : 'bg-rose-500'"></span>
                    {{ getStatusLabel(agent.status) }}
                  </span>
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black" :class="getDepthColor(agent.depth)">
                    L{{ agent.depth }}
                  </span>
                </div>
                <div class="text-xs text-slate-500">{{ agent.accountType }} · {{ maskString(agent.realName, 'name') }}</div>
              </div>
              <div class="flex items-center gap-1">
                <button @click="handleViewCpa(agent)" v-if="agent.cpaEnabled" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </button>
                <button @click="handleEditCommission(agent)" class="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                </button>
                <button @click="handleEdit(agent)" class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                <button @click="handleOpenPromotion(agent)" class="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12V8H4v4"/><path d="M2 12h20"/><path d="m20 12 1 4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2l1-4"/><path d="M12 18v4"/><path d="m9 20 3 2 3-2"/></svg>
                </button>
              </div>
            </div>
            <div class="flex items-center gap-3 text-xs mb-2">
              <span class="px-2 py-1 bg-slate-100 text-slate-600 rounded font-mono">{{ agent.promoCode }}</span>
              <span class="text-slate-400">{{ maskString(agent.phone, 'phone') }}</span>
            </div>
            <div class="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div class="flex-1 text-center">
                <div class="text-[10px] text-slate-400 mb-0.5">下線代理</div>
                <div class="text-sm font-bold text-slate-700">{{ agent.downlineAgents }}</div>
              </div>
              <div class="w-px h-7 bg-slate-100"></div>
              <div class="flex-1 text-center">
                <div class="text-[10px] text-slate-400 mb-0.5">直屬玩家</div>
                <div class="text-sm font-bold text-slate-700">{{ agent.directPlayers }}</div>
              </div>
              <div class="w-px h-7 bg-slate-100"></div>
              <div class="flex-1 text-center">
                <div class="text-[10px] text-slate-400 mb-0.5">儲值抽成</div>
                <div class="text-sm font-bold text-violet-600">{{ agent.commissionAllocationRate }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════ -->
      <!-- TREE VIEW                                -->
      <!-- ════════════════════════════════════════ -->
      <div v-else class="p-4 sm:p-6">
        <div class="text-xs text-slate-400 font-medium mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          點擊節點可展開/收合子代理
        </div>
        <div class="space-y-1">
          <template v-for="root in agentTree" :key="root.uid">
            <!-- 遞迴樹節點（展開至 5 層） -->
            <div class="tree-node" :style="{ '--depth': root.depth }">
              <!-- Root node -->
              <div
                class="flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all hover:bg-slate-50 group"
                @click="root.children.length > 0 && toggleNode(root.uid)"
              >
                <!-- 展開箭頭 -->
                <div class="w-5 h-5 flex items-center justify-center shrink-0">
                  <svg v-if="root.children.length > 0" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-slate-400 transition-transform duration-200" :class="expandedNodes.has(root.uid) ? 'rotate-90' : ''"><path d="m9 18 6-6-6-6"/></svg>
                </div>

                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0" :class="getDepthColor(root.depth)">
                  L{{ root.depth }}
                </span>
                <span class="font-bold text-sm text-slate-800">{{ root.account }}</span>
                <span class="text-xs text-slate-400 font-mono">{{ root.uid }}</span>
                <span class="text-xs text-slate-500">{{ root.realName ? maskString(root.realName, 'name') : '' }}</span>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ml-auto" :class="getStatusColor(root.status)">
                  {{ getStatusLabel(root.status) }}
                </span>
                <!-- 快速操作 -->
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                  <button @click.stop="handleViewCpa(root as AgentData)" v-if="root.cpaEnabled" class="p-1 text-emerald-500 hover:bg-emerald-50 rounded" title="CPA 分潤">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </button>
                  <button @click.stop="handleEditCommission(root as AgentData)" class="p-1 text-violet-500 hover:bg-violet-50 rounded" title="儲值抽成">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                  </button>
                  <button @click.stop="handleEdit(root as AgentData)" class="p-1 text-indigo-500 hover:bg-indigo-50 rounded" title="編輯">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                  </button>
                </div>
              </div>

              <!-- Children (recursive up to depth 5+) -->
              <div v-if="expandedNodes.has(root.uid) && root.children.length > 0" class="ml-6 pl-4 border-l-2 border-slate-100 space-y-1 mt-1">
                <template v-for="child in root.children" :key="child.uid">
                  <div @click="child.children.length > 0 && toggleNode(child.uid)"
                    class="flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all hover:bg-slate-50 group"
                  >
                    <div class="w-5 h-5 flex items-center justify-center shrink-0">
                      <svg v-if="child.children.length > 0" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-slate-400 transition-transform duration-200" :class="expandedNodes.has(child.uid) ? 'rotate-90' : ''"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0" :class="getDepthColor(child.depth)">L{{ child.depth }}</span>
                    <span class="font-bold text-sm text-slate-800">{{ child.account }}</span>
                    <span class="text-xs text-slate-400 font-mono">{{ child.uid }}</span>
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ml-auto" :class="getStatusColor(child.status)">{{ getStatusLabel(child.status) }}</span>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                      <button @click.stop="handleViewCpa(child as AgentData)" v-if="child.cpaEnabled" class="p-1 text-emerald-500 hover:bg-emerald-50 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      </button>
                      <button @click.stop="handleEditCommission(child as AgentData)" class="p-1 text-violet-500 hover:bg-violet-50 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                      </button>
                      <button @click.stop="handleEdit(child as AgentData)" class="p-1 text-indigo-500 hover:bg-indigo-50 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </button>
                    </div>
                  </div>
                  <!-- Grandchildren -->
                  <div v-if="expandedNodes.has(child.uid) && child.children.length > 0" class="ml-6 pl-4 border-l-2 border-slate-100 space-y-1 mt-1">
                    <template v-for="gc in child.children" :key="gc.uid">
                      <div @click="gc.children.length > 0 && toggleNode(gc.uid)"
                        class="flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all hover:bg-slate-50 group"
                      >
                        <div class="w-5 h-5 flex items-center justify-center shrink-0">
                          <svg v-if="gc.children.length > 0" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-slate-400 transition-transform duration-200" :class="expandedNodes.has(gc.uid) ? 'rotate-90' : ''"><path d="m9 18 6-6-6-6"/></svg>
                        </div>
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0" :class="getDepthColor(gc.depth)">L{{ gc.depth }}</span>
                        <span class="font-bold text-sm text-slate-800">{{ gc.account }}</span>
                        <span class="text-xs text-slate-400 font-mono">{{ gc.uid }}</span>
                        <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ml-auto" :class="getStatusColor(gc.status)">{{ getStatusLabel(gc.status) }}</span>
                        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                          <button @click.stop="handleViewCpa(gc as AgentData)" v-if="gc.cpaEnabled" class="p-1 text-emerald-500 hover:bg-emerald-50 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                          </button>
                          <button @click.stop="handleEditCommission(gc as AgentData)" class="p-1 text-violet-500 hover:bg-violet-50 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                          </button>
                          <button @click.stop="handleEdit(gc as AgentData)" class="p-1 text-indigo-500 hover:bg-indigo-50 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                          </button>
                        </div>
                      </div>
                      <!-- Great-grandchildren and beyond -->
                      <div v-if="expandedNodes.has(gc.uid) && gc.children.length > 0" class="ml-6 pl-4 border-l-2 border-slate-100 space-y-1 mt-1">
                        <template v-for="ggc in gc.children" :key="ggc.uid">
                          <div @click="ggc.children.length > 0 && toggleNode(ggc.uid)"
                            class="flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all hover:bg-slate-50 group"
                          >
                            <div class="w-5 h-5 flex items-center justify-center shrink-0">
                              <svg v-if="ggc.children.length > 0" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-slate-400 transition-transform duration-200" :class="expandedNodes.has(ggc.uid) ? 'rotate-90' : ''"><path d="m9 18 6-6-6-6"/></svg>
                            </div>
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0" :class="getDepthColor(ggc.depth)">L{{ ggc.depth }}</span>
                            <span class="font-bold text-sm text-slate-800">{{ ggc.account }}</span>
                            <span class="text-xs text-slate-400 font-mono">{{ ggc.uid }}</span>
                            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ml-auto" :class="getStatusColor(ggc.status)">{{ getStatusLabel(ggc.status) }}</span>
                            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                              <button @click.stop="handleViewCpa(ggc as AgentData)" v-if="ggc.cpaEnabled" class="p-1 text-emerald-500 hover:bg-emerald-50 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                              </button>
                              <button @click.stop="handleEditCommission(ggc as AgentData)" class="p-1 text-violet-500 hover:bg-violet-50 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                              </button>
                              <button @click.stop="handleEdit(ggc as AgentData)" class="p-1 text-indigo-500 hover:bg-indigo-50 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                              </button>
                            </div>
                          </div>
                          <!-- Depth 5 -->
                          <div v-if="expandedNodes.has(ggc.uid) && ggc.children.length > 0" class="ml-6 pl-4 border-l-2 border-dashed border-slate-100 space-y-1 mt-1">
                            <div v-for="d5 in ggc.children" :key="d5.uid"
                              class="flex items-center gap-2 p-2.5 rounded-xl transition-all hover:bg-slate-50 group"
                            >
                              <div class="w-5 h-5 shrink-0"></div>
                              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0" :class="getDepthColor(d5.depth)">L{{ d5.depth }}</span>
                              <span class="font-bold text-sm text-slate-800">{{ d5.account }}</span>
                              <span class="text-xs text-slate-400 font-mono">{{ d5.uid }}</span>
                              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ml-auto" :class="getStatusColor(d5.status)">{{ getStatusLabel(d5.status) }}</span>
                              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                <button @click.stop="handleEditCommission(d5 as AgentData)" class="p-1 text-violet-500 hover:bg-violet-50 rounded">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                                </button>
                                <button @click.stop="handleEdit(d5 as AgentData)" class="p-1 text-indigo-500 hover:bg-indigo-50 rounded">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </template>
                      </div>
                    </template>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Pagination -->
      <div class="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50">
        <div class="text-xs sm:text-sm text-slate-500">
          {{ t('agents.pagination_showing', { start: 1, end: agents.length, total: agents.length }) }}
        </div>
        <div class="flex items-center gap-1">
          <button class="px-3 py-1 text-sm border border-slate-200 rounded-md text-slate-400 cursor-not-allowed bg-white" disabled>{{ t('agents.pagination_prev') }}</button>
          <button class="px-3 py-1 text-sm border border-indigo-600 bg-indigo-600 text-white rounded-md">1</button>
          <button class="px-3 py-1 text-sm border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100 bg-white">{{ t('agents.pagination_next') }}</button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AgentModal
      :show="isModalShow"
      :mode="modalMode"
      :agent="selectedAgent"
      @close="isModalShow = false"
      @save="handleSaveAgent"
    />

    <CpaModal
      :show="isCpaModalShow"
      :agent-data="selectedCpaAgent"
      @close="isCpaModalShow = false"
    />

    <CommissionModal
      :show="isCommissionModalShow"
      :target="selectedCommissionTarget"
      @close="isCommissionModalShow = false"
      @save="handleSaveCommission"
    />

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
