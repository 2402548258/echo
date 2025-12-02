<script setup lang="ts">
import { NConfigProvider } from 'naive-ui';
import TitleBar from './components/TitleBar.vue';
import DragRegion from './components/DragRegion.vue';
import NavBar from './components/NavBar.vue';

onMounted(() => {
  console.log('App mounted');
});

</script>
<template>
  <n-config-provider class="h-full w-[100vw] flex text-tx-primary">
    <aside class="sidebar h-full flex flex-shrink-0 flex-col bg-amber-600 w-[320px]">
      <div class="flex-auto flex">
        <nav-bar />
        <div class="flex-auto">
          list
        </div>
      </div>
    </aside>
    <div class="flex-auto ">
      <title-bar title="Echo">
        <drag-region class="w-full">Echo</drag-region>
      </title-bar>
      <div>
        Main
      </div>
    </div>
  </n-config-provider>
</template>

<style scoped>
.sidebar {
  background-color: var(--bg-color);
  box-shadow: -3px -2px 10px rgba(101, 101, 101, 0.2);
}
</style>
