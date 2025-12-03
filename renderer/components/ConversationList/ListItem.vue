<script setup lang="ts">
import type { Conversation } from '@common/types'
import { Icon as IconifyIcon } from '@iconify/vue'
import ItemTitle from './ItemTitle.vue';
const _PIN_ICON_SIZE = 16 as const

defineOptions({ name: 'ListItem' });

defineProps<Conversation>();
const emit = defineEmits(['updateTitle']);

</script>

<template>
    <div class="conversation-desc text-tx-secondary items-center text-sm loading-5">
        <span min-w-0>
            {{ selectedModel }}
            <iconify-icon class="inline-block" v-if="pinned" icon="material-symbols:keep-rounded"
                :width="_PIN_ICON_SIZE" :height="_PIN_ICON_SIZE" />
        </span>
    </div>
    <div class="flex items-center w-full">
        <!-- 复选框 预留 -->
        <item-title :title="title" />
    </div>

</template>

<style></style>