<template>
  <div class="min-h-screen flex flex-col bg-gray-50 text-gray-900">
    <!-- Header -->
    <header class="w-full bg-white shadow-sm ring-1 ring-gray-900/5">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="font-bold text-xl text-indigo-600">NuxtApp</NuxtLink>
        <nav class="flex gap-4">
          <NuxtLink to="/" class="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors">Home</NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex justify-center text-sm text-gray-500">
        &copy; {{ new Date().getFullYear() }} NuxtApp. All rights reserved.
      </div>
    </footer>
  </div>
</template>
