<script setup lang="ts">
import { NConfigProvider } from 'naive-ui';
import NavBar from './components/NavBar.vue';
import ResizeDivider from './components/ResizeDivider.vue';
import ConversationList  from './components/ConversationList/index.vue'
import { initProvider } from './dataBase';
import { useProvidersStore } from './stores/providers';
import { useConversationsStore } from './stores/conversations';

const providersStore = useProvidersStore();
const conversationsStore = useConversationsStore();
onMounted(() => {
  initProvider()
  providersStore.initialize()
  conversationsStore.initConversations()
  console.log('App mounted');
});
const sidebarWidth = ref(320);
</script>
<template>
  <n-config-provider class="h-full w-[100vw] flex text-tx-primary">
    <aside class="sidebar h-full flex flex-shrink-0 flex-col" :style="{ width: sidebarWidth + 'px' }">
      <div class="flex justify-between">
        <nav-bar />
        <conversation-list class="flex-auto" :width="sidebarWidth"/>
      </div>
    </aside>
    <resize-divider direction="vertical" v-model:size="sidebarWidth" :max-size="800" :min-size="320" />
    <div class="flex-auto ">  
        <router-view />
    </div>
  </n-config-provider>
</template>

<style scoped>
.sidebar {
  background-color: var(--bg-color);
  box-shadow: -3px -2px 10px rgba(101, 101, 101, 0.2);
}
</style>
