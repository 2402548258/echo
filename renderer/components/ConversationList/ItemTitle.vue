<script setup lang="ts">
// import { CTX_KEY } from './constants';

import NativeTooltip from '../NativeTooltip.vue';
import { CTX_KEY } from './constants';
import { NInput } from 'naive-ui';

interface ItemTitleProps {
    title: string;
    isEditable: boolean;
}
interface Emits {
    (e: 'updateTitle', title: string): void;
}

const props = defineProps<ItemTitleProps>();
const emit = defineEmits<Emits>();
const _title = ref(props.title);

const isTitleOverflow = ref(false);
const titleRef = useTemplateRef<HTMLElement>('titleRef');
const ctx = inject(CTX_KEY);
function checkOverflow(element: HTMLElement | null): boolean {
    if (!element) return false;
    return element.scrollWidth > element.clientWidth;
}

function _updateOverflowStatus() {
    isTitleOverflow.value = checkOverflow(titleRef.value);
}

function updateTitle() {
    emit('updateTitle', _title.value);
}


const updateOverflow = useDebounceFn(_updateOverflowStatus, 100)


onMounted(() => {
    updateOverflow();
    window.addEventListener('resize', updateOverflow);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateOverflow);
});

watch([() => props.title, () => ctx?.width.value], () => {
    updateOverflow();
});
</script>

<template>
    <n-input v-if="isEditable" class="w-full" size="tiny" v-model:value="_title" @keydown.enter="updateTitle" />
    <h2 v-else ref="titleRef" class="conversation-title  text-tx-secondary font-semibold loading-5 truncate">
        <template v-if="isTitleOverflow">
            <native-tooltip :content="title">
                {{ title }}
            </native-tooltip>
        </template>
        <template v-else>
            {{ title }}
        </template>
    </h2>
</template>