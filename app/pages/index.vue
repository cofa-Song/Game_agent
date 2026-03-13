<script setup lang="ts">
import { ref, defineComponent, h, onMounted } from 'vue'

// --- Dynamic Import for ApexCharts (Client-only compatibility) ---
// Since ssr: false is set in nuxt.config.ts, we can use it directly, 
// but we still need to be careful with component name.
let VueApexCharts: any = null

const isChartLoaded = ref(false)

onMounted(async () => {
  const module = await import('vue3-apexcharts')
  VueApexCharts = module.default
  isChartLoaded.value = true
})

// --- Dashboard Metrics ---
const stats = [
  { 
    label: '近期新增玩家', 
    value: '342', 
    trend: 12.5, 
    colorClass: 'text-indigo-600 bg-indigo-50', 
    icon: 'UserPlusIcon',
    description: '過去 7 天內新增玩家總數'
  },
  { 
    label: '近期儲值總額', 
    value: '$128,450', 
    trend: 8.2, 
    colorClass: 'text-emerald-600 bg-emerald-50', 
    icon: 'CurrencyDollarIcon',
    description: '過去 7 天內玩家儲值總台幣'
  },
  { 
    label: '近期 CPA 佣金', 
    value: '$45,200', 
    trend: 15.4, 
    colorClass: 'text-amber-600 bg-amber-50', 
    icon: 'GiftIcon',
    description: '過去 7 天內結算的 CPA 獎勵'
  },
  { 
    label: '近期儲值抽成', 
    value: '$32,150', 
    trend: 5.1, 
    colorClass: 'text-cyan-600 bg-cyan-50', 
    icon: 'ChartBarIcon',
    description: '過去 7 天內代理儲值佣金收入'
  },
]

// --- Mock Data for 7 Days ---
const last7Days = ['3/07', '3/08', '3/09', '3/10', '3/11', '3/12', '3/13']
const cpaData = [4500, 5200, 3800, 6100, 5500, 4800, 7200]
const revenueData = [2100, 2400, 1900, 3200, 2800, 2500, 3800]

// --- Combo Chart Config (Bar + Line) ---
const comboChartOptions = ref({
  chart: {
    id: 'performance-trend',
    toolbar: { show: false },
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  colors: ['#6366f1', '#10b981'], // Indigo (Bar), Emerald (Line)
  stroke: {
    width: [0, 3],
    curve: 'smooth'
  },
  plotOptions: {
    bar: {
      columnWidth: '45%',
      borderRadius: 6
    }
  },
  dataLabels: { enabled: false },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    offsetY: -10,
    fontFamily: 'inherit',
    fontWeight: 600
  },
  labels: last7Days,
  xaxis: {
    type: 'category',
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: {
        colors: '#94a3b8',
        fontWeight: 500
      }
    }
  },
  yaxis: [
    {
      labels: {
        offsetX: -10,
        style: { colors: '#6366f1', fontWeight: 600 }
      }
    },
    {
      opposite: true,
      labels: {
        offsetX: -10,
        style: { colors: '#10b981', fontWeight: 600 }
      }
    }
  ],
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4,
    padding: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }
  },
  tooltip: {
    shared: true,
    intersect: false,
    theme: 'light'
  }
})

const comboSeries = ref([
  {
    name: 'CPA 佣金',
    type: 'column',
    data: cpaData
  },
  {
    name: '儲值抽成',
    type: 'line',
    data: revenueData
  }
])

// --- Commission Source Pie Chart Config ---
const pieChartOptions = ref({
  chart: {
    id: 'commission-source',
    fontFamily: 'Inter, system-ui, sans-serif',
    dropShadow: {
        enabled: true,
        top: 10,
        left: 0,
        blur: 15,
        opacity: 0.1
    }
  },
  colors: ['#22d3ee', '#312e81'], // Lighter Cyan (400), Deep Indigo (900) - Maximum contrast
  labels: ['直屬玩家', '下線代理'],
  legend: {
    show: false
  },
  stroke: { 
    show: true, 
    width: 3, 
    colors: ['#fff'] 
  },
  dataLabels: {
    enabled: true,
    style: {
      fontSize: '11px',
      fontWeight: '900',
    },
    dropShadow: { enabled: false },
    formatter: function (val: number) {
      return val.toFixed(0) + "%"
    }
  },
  plotOptions: {
    pie: {
      expandOnClick: true,
      dataLabels: { offset: -10 },
      donut: {
        size: '0%'
      }
    }
  }
})

const pieSeries = ref([65, 35])

// --- Assessment Status Pie Chart Config ---
const assessmentChartOptions = ref({
  chart: {
    id: 'assessment-status',
    fontFamily: 'Inter, system-ui, sans-serif',
    dropShadow: {
        enabled: true,
        top: 10,
        left: 0,
        blur: 15,
        opacity: 0.1
    }
  },
  colors: ['#6366f1', '#10b981', '#f43f5e'], // Indigo (考核中), Emerald (已達標), Rose (已失效)
  labels: ['考核中', '已達標', '已失效'],
  legend: {
    show: false
  },
  stroke: { 
    show: true, 
    width: 3, 
    colors: ['#fff'] 
  },
  dataLabels: {
    enabled: true,
    style: {
      fontSize: '11px',
      fontWeight: '900',
    },
    dropShadow: { enabled: false },
    formatter: function (val: number) {
      return val.toFixed(0) + "%"
    }
  },
  plotOptions: {
    pie: {
      expandOnClick: true,
      dataLabels: { offset: -10 },
      donut: {
        size: '0%'
      }
    }
  }
})

const assessmentSeries = ref([45, 40, 15])

// --- Icons ---
const UserPlusIcon = () => h('svg', { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [h('path', { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }), h('circle', { cx: "9", cy: "7", r: "4" }), h('line', { x1: "19", x2: "19", y1: "8", y2: "14" }), h('line', { x1: "16", x2: "22", y1: "11", y2: "11" })])
const CurrencyDollarIcon = () => h('svg', { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [h('line', { x1: "12", x2: "12", y1: "2", y2: "22" }), h('path', { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" })])
const GiftIcon = () => h('svg', { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [h('polyline', { points: "20 12 20 22 4 22 4 12" }), h('rect', { width: "20", height: "5", x: "2", y: "7" }), h('line', { x1: "12", x2: "12", y1: "22", y2: "7" }), h('path', { d: "M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" }), h('path', { d: "M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" })])
const ChartBarIcon = () => h('svg', { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [h('line', { x1: "12", x2: "12", y1: "20", y2: "10" }), h('line', { x1: "18", x2: "18", y1: "20", y2: "4" }), h('line', { x1: "6", x2: "6", y1: "20", y2: "16" })])
</script>

<template>
  <div class="space-y-6 max-w-[1600px] mx-auto pb-12">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black tracking-tight text-slate-900">業績概覽</h1>
        <p class="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          昨日數據已更新 · 掌握代理與玩家表現分佈
        </p>
      </div>
      <div class="flex gap-3">
        <button class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all text-sm shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 21v-4h-4"/><path d="M22 17l-3 3"/></svg>
          刷新數據
        </button>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="stat in stats" 
        :key="stat.label" 
        class="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
      >
        <div class="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-5 group-hover:scale-125 transition-transform">
          <component :is="stat.icon" class="w-20 h-20" />
        </div>
        
        <div class="flex items-center justify-between mb-5 relative z-10">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" :class="stat.colorClass">
            <component :is="stat.icon" class="w-6 h-6" />
          </div>
          <div class="flex flex-col items-end">
            <span :class="stat.trend > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'" class="text-[11px] font-black px-2 py-1 rounded-lg">
              {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
            </span>
            <span class="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">VS 上一期</span>
          </div>
        </div>
        
        <div class="relative z-10">
          <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">{{ stat.label }}</p>
          <div class="flex items-baseline gap-2 mt-2">
            <p class="text-3xl font-black text-slate-900 tracking-tight">{{ stat.value }}</p>
            <span v-if="stat.label.includes('總額') || stat.label.includes('佣金')" class="text-sm font-bold text-slate-400">TWD</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-3 font-medium">{{ stat.description }}</p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Performance Trend (Combo Chart) -->
      <div class="lg:col-span-6 bg-white rounded-3xl shadow-sm border border-slate-100 py-8 px-2 md:px-4">
        <div class="flex items-center justify-between mb-8 px-4">
          <div>
            <h3 class="text-xl font-black text-slate-800 tracking-tight">業績成長趨勢</h3>
            <p class="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">CPA & Revenue Analysis</p>
          </div>
        </div>
        
        <div class="h-80 w-full">
           <div v-if="isChartLoaded" class="w-[98%] h-full mx-auto">
             <component 
               :is="VueApexCharts" 
               type="line" 
               height="100%" 
               width="100%"
               :options="comboChartOptions" 
               :series="comboSeries" 
             />
           </div>
           <div v-else class="flex flex-col items-center gap-4 text-slate-300 h-full justify-center">
             <div class="w-12 h-12 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
             <span class="text-sm font-bold animate-pulse">圖表加載中...</span>
           </div>
        </div>
      </div>

      <!-- Commission Source (Pie Chart) -->
      <div class="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
        <div class="mb-4 text-center w-full">
            <h3 class="text-lg font-black text-slate-800 tracking-tight">佣金來源</h3>
            <p class="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Commission Sources</p>
        </div>
        
        <div class="h-48 w-full flex items-center justify-center relative">
           <component 
             v-if="isChartLoaded"
             :is="VueApexCharts" 
             type="pie" 
             height="100%" 
             width="100%"
             :options="pieChartOptions" 
             :series="pieSeries" 
           />
           <div v-else class="animate-pulse flex items-center justify-center h-full w-full bg-slate-50 rounded-full border-8 border-slate-100">
              <span class="text-xs font-black text-slate-300 uppercase tracking-widest">Loading...</span>
           </div>
        </div>

        <div class="mt-6 space-y-2.5 w-full">
           <div class="flex items-center justify-between p-3 rounded-2xl bg-cyan-50/50 border border-cyan-100">
              <div class="flex items-center gap-2">
                 <div class="w-2 h-2 rounded-full bg-cyan-500"></div>
                 <span class="text-[11px] font-extrabold text-cyan-800">直屬玩家</span>
              </div>
              <span class="text-xs font-black text-cyan-900">65%</span>
           </div>
           <div class="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <div class="flex items-center gap-2">
                 <div class="w-2 h-2 rounded-full bg-indigo-600"></div>
                 <span class="text-[11px] font-extrabold text-indigo-800">下線代理</span>
              </div>
              <span class="text-xs font-black text-indigo-900">35%</span>
           </div>
        </div>
      </div>

      <!-- Assessment Status (Pie Chart) [NEW] -->
      <div class="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
        <div class="mb-4 text-center w-full">
            <h3 class="text-lg font-black text-slate-800 tracking-tight">直屬考核狀態</h3>
            <p class="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Assessment Analysis</p>
        </div>
        
        <div class="h-48 w-full flex items-center justify-center relative">
           <component 
             v-if="isChartLoaded"
             :is="VueApexCharts" 
             type="pie" 
             height="100%" 
             width="100%"
             :options="assessmentChartOptions" 
             :series="assessmentSeries" 
           />
           <div v-else class="animate-pulse flex items-center justify-center h-full w-full bg-slate-50 rounded-full border-8 border-slate-100">
              <span class="text-xs font-black text-slate-300 uppercase tracking-widest">Loading...</span>
           </div>
        </div>

        <div class="mt-6 space-y-2.5 w-full">
           <div class="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <div class="flex items-center gap-2">
                 <div class="w-2 h-2 rounded-full bg-indigo-600"></div>
                 <span class="text-[11px] font-extrabold text-indigo-800">考核中</span>
              </div>
              <span class="text-xs font-black text-indigo-900">45%</span>
           </div>
           <div class="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <div class="flex items-center gap-2">
                 <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <span class="text-[11px] font-extrabold text-emerald-800">已達標</span>
              </div>
              <span class="text-xs font-black text-emerald-900">40%</span>
           </div>
           <div class="flex items-center justify-between p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
              <div class="flex items-center gap-2">
                 <div class="w-2 h-2 rounded-full bg-rose-500"></div>
                 <span class="text-[11px] font-extrabold text-rose-800">已失效</span>
              </div>
              <span class="text-xs font-black text-rose-900">15%</span>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure dashboard-specific styles don't conflict */
</style>
