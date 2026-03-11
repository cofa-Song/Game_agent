<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">後台控制台</h1>
        <p class="text-sm text-slate-500 mt-1">查看系統即時數據與代理表現</p>
      </div>
      <div class="flex gap-2">
        <UiButton variant="outline" class="text-sm px-4">匯出報表</UiButton>
        <UiButton class="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm text-sm px-4">刷新數據</UiButton>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50" :class="stat.colorClass">
            <component :is="stat.icon" class="w-5 h-5" />
          </div>
          <span :class="stat.trend > 0 ? 'text-emerald-600' : 'text-rose-600'" class="text-xs font-bold bg-slate-50 px-2 py-1 rounded-full">
            {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
          </span>
        </div>
        <p class="text-sm font-medium text-slate-500 truncate">{{ stat.label }}</p>
        <p class="text-2xl font-bold text-slate-900 mt-1">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Main Dashboard Body -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-80 flex flex-col items-center justify-center text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-20"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        <p>業績成長趨勢圖表 (預留位置)</p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-80 flex flex-col items-center justify-center text-slate-400 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-20"><circle cx="12" cy="12" r="10"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
        <p>代理地域分佈圖 (預留位置)</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const stats = [
  { label: '今日新增玩家', value: '1,284', trend: 12.5, colorClass: 'text-indigo-600 bg-indigo-50', icon: 'UserPlusIcon' },
  { label: '今日儲值總額', value: '$84,200', trend: 8.2, colorClass: 'text-emerald-600 bg-emerald-50', icon: 'CurrencyDollarIcon' },
  { label: '本月代理佣金', value: '$12,500', trend: -2.4, colorClass: 'text-amber-600 bg-amber-50', icon: 'GiftIcon' },
  { label: '活躍代理總數', value: '452', trend: 5.1, colorClass: 'text-rose-600 bg-rose-50', icon: 'UsersIcon' },
]

// Mocking icons for simple rendering
const UserPlusIcon = () => h('svg', { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [h('path', { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }), h('circle', { cx: "9", cy: "7", r: "4" }), h('line', { x1: "19", x2: "19", y1: "8", y2: "14" }), h('line', { x1: "16", x2: "22", y1: "11", y2: "11" })])
const CurrencyDollarIcon = () => h('svg', { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [h('line', { x1: "12", x2: "12", y1: "2", y2: "22" }), h('path', { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" })])
const GiftIcon = () => h('svg', { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [h('polyline', { points: "20 12 20 22 4 22 4 12" }), h('rect', { width: "20", height: "5", x: "2", y: "7" }), h('line', { x1: "12", x2: "12", y1: "22", y2: "7" }), h('path', { d: "M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" }), h('path', { d: "M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" })])
const UsersIcon = () => h('svg', { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [h('path', { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }), h('circle', { cx: "9", cy: "7", r: "4" }), h('path', { d: "M22 21v-2a4 4 0 0 0-3-3.87" }), h('path', { d: "M16 3.13a4 4 0 0 1 0 7.75" })])

import { h } from 'vue'
</script>
