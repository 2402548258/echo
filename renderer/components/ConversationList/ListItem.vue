<script setup lang="ts">
import type { Conversation } from '@common/types'
import { Icon as IconifyIcon } from '@iconify/vue'
import { NCheckbox } from 'naive-ui';
import ItemTitle from './ItemTitle.vue';
import { CTX_KEY } from './constants';
import { useContextMenu } from './useContextMenu';
const _PIN_ICON_SIZE = 16 as const

defineOptions({ name: 'ListItem' });

const props = defineProps<Conversation>();
const emit = defineEmits(['updateTitle']);
const ctx = inject(CTX_KEY, void 0);
const checked = ref(false);
const { isBatchOperate } = useContextMenu();
function updateTitle(val: string) {
    emit('updateTitle', props.id, val);
}
const isTitleEditable = computed(() => ctx?.editId.value === props.id);

watch(() => checked.value, (val) => {
    if (val) {
        !ctx?.checkedIds.value.includes(props.id) && ctx?.checkedIds.value.push(props.id);
        return
    }
    ctx?.checkedIds.value.includes(props.id) && (ctx!.checkedIds.value = ctx!.checkedIds.value.filter(id => id !== props.id));
})

watch(() => ctx?.checkedIds.value, (val) => {
    if (!val) return
    checked.value = val.includes(props.id);
})

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
        <div class="w-full flex items-center" v-if="isBatchOperate">
            <n-checkbox class=" ml-[5px] translate-x-[-5px] translate-y-[-1px]" v-model:checked="checked" @click.stop />
            <div class="flex-auto">
                <item-title :title="title" :is-editable="isTitleEditable" @update-title="updateTitle" />
            </div>
        </div>
        <item-title v-else :title="title" :is-editable="isTitleEditable" @updateTitle="updateTitle" />
    </div>

</template>

<style></style>