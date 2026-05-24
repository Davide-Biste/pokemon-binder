<script setup lang="ts">
import AppSidebar from '@/components/custom/AppSidebar.vue'
</script>

<template>
  <div class="pb-app">
    <AppSidebar />
    <main class="pb-view">
      <RouterView />
    </main>
  </div>
</template>
