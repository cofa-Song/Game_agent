<script setup lang="ts">
import { ref } from 'vue'

interface ReportRecord {
  id: string
  name: string
  type: string
  criteria: string
  createdAt: string
  status: 'completed' | 'processing' | 'failed'
  size?: string
}

const reports = ref<ReportRecord[]>([
  {
    id: 'RPT001',
    name: '業績報表_20240312',
    type: '業績報表',
    criteria: '日期: 2024-03-12 | 類型: 全部',
    createdAt: '2026-03-13 10:30:45',
    status: 'completed',
    size: '1.2 MB'
  },
  {
    id: 'RPT002',
    name: '直屬玩家列表_全量',
    type: '玩家列表',
    criteria: '狀態: 正常 | 考核: 全部',
    createdAt: '2026-03-13 11:15:20',
    status: 'processing',
  },
  {
    id: 'RPT003',
    name: '財務提領紀錄_Q1',
    type: '財務報表',
    criteria: '日期: 2026-01-01 ~ 2026-03-31',
    createdAt: '2026-03-12 18:20:10',
    status: 'completed',
    size: '3.5 MB'
  },
  {
    id: 'RPT004',
    name: '代理推廣統計_失敗測試',
    type: '推廣報表',
    criteria: '代理: admin_test',
    createdAt: '2026-03-12 09:05:33',
    status: 'failed',
  }
])

const getStatusConfig = (status: ReportRecord['status']) => {
  switch (status) {
    case 'completed': return { label: '已完成', class: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
    case 'processing': return { label: '生成中', class: 'bg-blue-50 text-blue-600 border-blue-100' }
    case 'failed': return { label: '失敗', class: 'bg-rose-50 text-rose-600 border-rose-100' }
  }
}

const handleDownload = (report: ReportRecord) => {
  alert(`正在下載: ${report.name}`)
}

const handleDelete = (id: string) => {
  reports.value = reports.value.filter(r => r.id !== id)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">報表管理中心</h1>
        <p class="text-sm text-slate-500 mt-1">管理並下載所有已生成的數據報表，避免重複資源浪費</p>
      </div>
      <div class="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
        <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
        <span class="text-xs font-bold text-amber-700 uppercase tracking-wider">儲存期限：報表將保留 7 天</span>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">今日生成</p>
        <p class="text-2xl font-black text-slate-900 mt-2">12 <span class="text-sm font-bold text-slate-400">份</span></p>
      </div>
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">累計佔用空間</p>
        <p class="text-2xl font-black text-slate-900 mt-2">145.8 <span class="text-sm font-bold text-slate-400">MB</span></p>
      </div>
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">剩餘配額</p>
        <div class="flex items-center justify-between mt-2">
           <p class="text-2xl font-black text-slate-900">85%</p>
           <div class="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
             <div class="w-[85%] h-full bg-indigo-500"></div>
           </div>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-bottom border-slate-100">
              <th class="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">報表資訊</th>
              <th class="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">搜尋條件摘要</th>
              <th class="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">生成時間</th>
              <th class="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">狀態 / 大小</th>
              <th class="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="report in reports" :key="report.id" class="group hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div>
                    <p class="text-sm font-black text-slate-900">{{ report.name }}</p>
                    <p class="text-[11px] font-bold text-slate-400 uppercase mt-0.5">{{ report.type }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-5">
                <div class="max-w-xs">
                  <span class="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md line-clamp-1">
                    {{ report.criteria }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-5 font-mono text-xs text-slate-500">
                {{ report.createdAt }}
              </td>
              <td class="px-6 py-5">
                <div class="flex flex-col gap-1.5">
                  <span 
                    class="inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[10px] font-black border"
                    :class="getStatusConfig(report.status).class"
                  >
                    {{ getStatusConfig(report.status).label }}
                  </span>
                  <span v-if="report.size" class="text-[10px] font-bold text-slate-400 ml-1">{{ report.size }}</span>
                </div>
              </td>
              <td class="px-6 py-5 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button 
                    v-if="report.status === 'completed'"
                    @click="handleDownload(report)"
                    class="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm border border-transparent hover:border-indigo-100 active:scale-90"
                    title="下載報表"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                  <button 
                    @click="handleDelete(report.id)"
                    class="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100 active:scale-90"
                    title="刪除"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Empty State -->
      <div v-if="reports.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-20"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M9 15h6"/></svg>
        <p class="font-bold">目前暫無生成的報表紀錄</p>
      </div>
    </div>
  </div>
</template>
