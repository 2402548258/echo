<script setup lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue';
import { NButton, NIcon } from 'naive-ui';
import type { SelectValue } from '@renderer/types';


import ProviderSelect from './ProviderSelect.vue';
import NativeTooltip from './NativeTooltip.vue';
interface Props {
    placeholder?: string;
    status?: 'loading' | 'streaming' | 'normal';
}
interface Emits {
    (e: 'send', message: string): void;
    (e: 'select', provider: SelectValue): void;
    (e: 'stop'): void
}
const props = withDefaults(defineProps<Props>(), { placeholder: '', status: 'normal' });
const emits = defineEmits<Emits>();
const focused = ref(false);

const message = defineModel('message',{
    type:String,
    default:''
})
const selectedProvider = defineModel<SelectValue>('provider')

const isBtnDisabled = computed(() => {
    if(props.status === 'loading') return true
    if(props.status === 'streaming') return false
    if(selectedProvider) return false
    return message.value.length === 0
})
const { t } = useI18n();
const btnTipContent = computed(() => {
    if (props.status === 'loading') return t('main.message.sending');
    if (props.status === 'streaming') return t('main.message.stopGeneration');
    return t('main.message.send');
});

const handelSend = () => {
    if(props.status === 'loading')  return emits('stop') 
    emits('send',message.value)
}

// watch (() => selectedProvider.value,(val) => emits('select',val))

</script>

<template>
    <div class="message-input h-full flex flex-col justify-between">
        <textarea class="input-area pt-4 px-2  w-full text-tx-primary placeholder:text-tx-secondary "
            v-model="message" @focus="focused = true" :placeholder="placeholder"
            @blur="focused = false"></textarea>

        <div class="bottom-bar h-[40px] flex justify-between items-center p-2 mb-2">
            <div class="selecter-container w-[200px]">
                <provider-select v-model="selectedProvider" />
            </div>
            <native-tooltip :content="btnTipContent">
                <n-button circle type="primary" :disabled="isBtnDisabled" @click="handelSend">
                    <template #icon>
                        <n-icon>
                            <iconify-icon v-if="status === 'normal'" class="w-4 h-4"
                                icon="material-symbols:arrow-upward" />
                            <iconify-icon v-else-if="status === 'streaming'" class="w-4 h-4"
                                icon="material-symbols:pause" />
                            <iconify-icon v-else class="w-4 h-4 animate-spin" icon="mdi:loading" />
                        </n-icon>
                    </template>
                </n-button>
            </native-tooltip>
        </div>
    </div>
</template>

<style scoped>
.input-area {
    padding-inline: 16px;
    border: none;
    resize: none;
}

.input-area:focus {
    outline: none;
}
</style>