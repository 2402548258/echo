<script setup lang="ts">
import { CONFIG_KEYS, MAIN_WIN_SIZE } from '@common/constants';
import { throttle } from '@common/utils';
import { SelectValue } from '@renderer/types';
import MessageInput from '@renderer/components/MessageInput.vue';
import CreateConversation from '@renderer/components/CreateConversation.vue';
import ResizeDivider from '../components/ResizeDivider.vue';
import MessageList from '@renderer/components/MessageList.vue';
import { useMessagesStore } from '@renderer/stores/messages';
import { useConversationsStore } from '@renderer/stores/conversations';
import { useProvidersStore } from '@renderer/stores/providers';
import useConfig from '@renderer/hooks/useConfig';

const route = useRoute();
const router = useRouter();
const conversationId = computed(() => Number(route.params.id));
const listHeight = ref(0);
const listScale = ref(0.7);
const maxListHeight = ref(window.innerHeight * 0.7);
const msgInputRef = useTemplateRef<{ selectedProvider: SelectValue }>('msgInputRef');
const message = ref('');
const provider = ref<SelectValue>();
//拆分select的value: `${item.id}:${model}`,
const providerId = computed(() => ((provider.value as string)?.split(':')[0] ?? ''));
const selectedModel = computed(() => ((provider.value as string)?.split(':')[1] ?? ''));
const messagesStore = useMessagesStore();
const conversationsStore = useConversationsStore();
const isStoping = ref(false);
const providersStore = useProvidersStore();
const config = useConfig();

const messageInputStatus = computed(() => {
    if (isStoping.value) return 'loading';
    const messages = messagesStore.messagesByConversationId(conversationId.value as number);
    const last = messages[messages.length - 1];
    if (last?.status === 'streaming' && last?.content?.length === 0) return 'loading';
    if (last?.status === 'loading' || last?.status === 'streaming') return last?.status;
    return 'normal';
})

const defaultModel = computed(() => {
    const vals: string[] = [];
    providersStore.allProviders.forEach(provider => {
        if (!provider.visible) return;
        provider.models.forEach(model => {
            vals.push(`${provider.id}:${model}`)
        })
    })
    if (!vals.includes(config[CONFIG_KEYS.DEFAULT_MODEL] ?? '')) return null
    return config[CONFIG_KEYS.DEFAULT_MODEL] || null;
})
const handleCreateConversation = async (create: (title?: string) => Promise<number | void>, message: string) => {
    const conversationId = await create(message);
    if (!conversationId) return
    afterCreateConversation(conversationId,message);
}

const afterCreateConversation = (id: number,firstMsg:string) => {
    router.push(`/conversation/${id}`);
    //重置输入框
    message.value = '';
    messagesStore.sendMessage({
        conversationId:id,
        type:'question',
        content:firstMsg
    })
    
}

const handleSendMessage = (msg:string) => {
    const _conversationId = conversationId.value;
    if (!msg?.trim()?.length) return;
    messagesStore.sendMessage({
        type: 'question',
        content:msg,
        conversationId: _conversationId,
    })
    messagesStore.setMessageInputValue(_conversationId, '');
}

const handleStopMessage = () => {
    isStoping.value = true;
    const msgIds = messagesStore.loadingMsgIdsByConversationId(conversationId.value as number ?? -1);
    for (const id of msgIds) {
        messagesStore.stopMessage(id);
    }
    isStoping.value = false;
}

const handleProviderSelect = () => {
    const current = conversationsStore.getConversationById(conversationId.value as number);
    if (!conversationId.value || !current) return;
    conversationsStore.updateConversation({
        ...current,
        providerId: Number(providerId.value),
        selectedModel: selectedModel.value,
    });
}
window.onresize = throttle(async () => {
    if (window.innerHeight < MAIN_WIN_SIZE.minHeight) return;
    listHeight.value = window.innerHeight * listScale.value;
    await nextTick();
    maxListHeight.value = window.innerHeight * 0.7;
}, 40);

onBeforeRouteUpdate(async (to, from, next) => {
    if (to.params.id === from.params.id) return next();
    await messagesStore.initialize(Number(to.params.id));
    next();
});

function configChange() {  //如果是初始化对话则设为defaultModel.value，否则判断对话的provider.models是否被禁用，如果没有则展示
    if (!conversationId.value || !msgInputRef.value) {
        provider.value = defaultModel.value
        return
    }
    const current = conversationsStore.getConversationById(conversationId.value);
    const vals: string[] = [];
    providersStore.allProviders.forEach(provider => {
        if (!provider.visible) return;
        provider.models.forEach(model => {
            vals.push(`${provider.id}:${model}`)
        })
    })
    if (!current) return;
    if (!vals.includes(`${current.providerId}:${current.selectedModel}`)) {
        provider.value = null
        return
    }
    provider.value = `${current.providerId}:${current.selectedModel}`;

}


const stopWatch = watch(()=>config,async()=>{
    await providersStore.initialize() //先更新provide状态
    configChange() //在更新模型选择状态
},{deep:true})

onMounted(async () => {
    await nextTick();
    console.log(1);
    listHeight.value = window.innerHeight * listScale.value; 
});

onUnmounted(()=>{
    stopWatch()
})



watch(() => listHeight.value, () => listScale.value = listHeight.value / window.innerHeight);


watch([() => conversationId.value, () => msgInputRef.value], async ([id, msgInput]) => {
    if (!id || !msgInput) {
        provider.value = defaultModel.value
        return;
    }
    const current = conversationsStore.getConversationById(id);
    const vals: string[] = [];
    providersStore.allProviders.forEach(provider => {
        if (!provider.visible) return;
        provider.models.forEach(model => {
            vals.push(`${provider.id}:${model}`)
        })
    })
    if (!current) return; 
    if (!vals.includes(`${current.providerId}:${current.selectedModel}`)) {
        provider.value = null
        return 
    }
    provider.value = `${current.providerId}:${current.selectedModel}`;
},{
    immediate:true
});
</script>

<template>
    <div class="h-full copy" v-if="!conversationId">
        <div class="h-full pt-[45vh] px-5">
            <div class="text-3xl font-bold text-primary-subtle text-center">
                {{ $t('main.welcome.helloMessage') }}
            </div>

            <div class="bg-bubble-others mt-6 max-w-[800px] h-[200px] mx-auto rounded-md">
                <create-conversation :providerId="providerId" :selectedModel="selectedModel" v-slot="{ create }">
                    <message-input v-model:message="message" v-model:provider="provider"
                        :placeholder="$t('main.conversation.placeholder')"
                        @send="handleCreateConversation(create, $event)" />
                </create-conversation>
            </div>
        </div>
    </div>
    <div class="h-full flex flex-col copy" v-else>
        <div class="w-full min-h-0" :style="{ height: `${listHeight}px` }">
            <message-list :messages="messagesStore.messagesByConversationId(conversationId)"/>
        </div>
        <div class="input-container bg-bubble-others flex-auto w-[calc(100% + 10px)] ml-[-5px] ">
            <resize-divider direction="horizontal" v-model:size="listHeight" :max-size="maxListHeight"
                :min-size="100" />
               <message-input class="p-2 pt-0" ref="msgInputRef"
                :status="messageInputStatus"
                :message="messagesStore.messageInputValueById(conversationId ?? -1)" v-model:provider="provider"
                :placeholder="$t('main.conversation.placeholder')" 
                @update:message="messagesStore.setMessageInputValue(conversationId ?? -1, $event)"
                @send="handleSendMessage" @update:provider="handleProviderSelect" @stop="handleStopMessage" />
        </div>
    </div>
</template>

<style scoped>
.input-container {
    box-shadow: 5px 1px 20px 0px rgba(101, 101, 101, 0.2);
}
.copy {
    user-select: all;
}
</style>