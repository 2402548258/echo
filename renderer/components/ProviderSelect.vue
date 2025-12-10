<script setup lang="ts">
// import { SelectValue } from '@renderer/'
import { NSelect, NButton } from 'naive-ui';
import { useProvidersStore } from '@renderer/stores/providers';
import { SelectValue } from '@renderer/types';

defineOptions({name:'ProviderSelect'});
const providersStore = useProvidersStore();
const selectedProvider = defineModel<SelectValue>('modelValue') //绑定的 prop 名叫 modelValue返回一个响应式 ref，你可以像平常的局部 state 一样使用它。

const providerOptions = computed(() => providersStore.allProviders.map(item => ({
    label: item.title || item.name,
    type: 'group',
    key: item.id,
    children: item.models.map(model => ({
        label: model,
        value: `${item.id}:${model}`,
    }))
})))
 
function openSettingWindow(){

}

</script>


<template>
    <n-select size="small" v-model:value="selectedProvider" :options="providerOptions"
        :placeholder="$t('main.conversation.selectModel')">
        <template #empty>
            <span class="text-tx-primary text-[0.7rem]">
                {{ $t('main.conversation.goSettings') }}
                <n-button class="go-settings-btn" size="tiny" @click="openSettingWindow" text>{{
                    $t('main.conversation.settings')
                    }}</n-button>{{
                        $t('main.conversation.addModel') }}
            </span>
        </template>
    </n-select>
</template>

<style scoped>
.go-settings-btn {
    padding: 0 0.5rem;
    font-weight: bold;
}
</style>