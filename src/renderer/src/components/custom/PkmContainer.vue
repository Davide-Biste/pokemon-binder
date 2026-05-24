<script setup lang="ts"></script>

<template>
  <div class="container">
    <slot />
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  min-height: 100%;
  padding: 1.2rem;
  margin: 0 auto;
  max-width: 1200px;
}
</style>
