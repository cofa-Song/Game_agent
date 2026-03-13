<script setup lang="ts">
import SideMenu from '~/components/layout/SideMenu.vue'
import Header from '~/components/layout/Header.vue'

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Close sidebar on navigation (mobile)
const route = useRoute()
watch(() => route.path, () => {
  isSidebarOpen.value = false
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans flex relative overflow-x-hidden">
    <!-- Overlay for mobile -->
    <div 
      v-if="isSidebarOpen" 
      class="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
      @click="toggleSidebar"
    ></div>

    <!-- Sidebar -->
    <SideMenu :is-open="isSidebarOpen" @toggle="toggleSidebar" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Navbar -->
      <Header @toggle-sidebar="toggleSidebar" />

      <!-- Page Content -->
      <main class="flex-1 p-4 md:p-6 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Any default-specific styles can go here */
</style>
