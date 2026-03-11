<script setup lang="ts">
import SideMenu from '~/components/layout/SideMenu.vue'
import Header from '~/components/layout/Header.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans flex">
    <!-- Sidebar -->
    <SideMenu />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Navbar -->
      <Header />

      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Any default-specific styles can go here */
</style>
