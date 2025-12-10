<script setup lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue';
import DragRegion from './DragRegion.vue';
import ThemeSwitcher from './ThemeSwitcher.vue';
import NativeTooltip from './NativeTooltip.vue';
defineOptions({ name: 'NavBar' });
</script>

<template>
    <drag-region>
        <!-- flex排版 如果想h-full并且不超出范围需要在子元素设置margin 不能在父元素mt-[.7rem] mb-[.7rem]-->
        <nav class="h-full flex flex-col justify-between  px-4  border-r border-r-input text-tx-secondary">
            <ul class="mt-[.7rem]">
                <li class="sidebar-item no-drag cursor-pointer hover:text-primary-hover text-tx-primary">
                    <native-tooltip :content="$t('main.sidebar.conversations')">
                        <iconify-icon icon="material-symbols:chat-outline" width="24" height="24" />
                    </native-tooltip>
                </li>
            </ul>
            <ul class="mb-[.7rem]">
                <li class="sidebar-item no-drag cursor-pointer hover:text-primary-subtle">
                    <theme-switcher />
                    <!-- <iconify-icon icon="material-symbols:dark-mode-outline" width="24" height="24" /> -->
                </li>
                <li class="sidebar-item no-drag cursor-pointer hover:text-primary-subtle">
                    <native-tooltip :content="$t('main.sidebar.settings')">
                        <iconify-icon icon="material-symbols:settings-outline" width="24" height="24" />
                    </native-tooltip>
                </li>
            </ul>

        </nav>
    </drag-region>
</template>

<style scoped>
li {
    margin-top: 10px;
}
</style>