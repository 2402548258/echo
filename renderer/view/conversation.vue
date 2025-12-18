<script setup lang="ts">
import { MAIN_WIN_SIZE } from '@common/constants';
import { throttle } from '@common/utils';
import { SelectValue } from '@renderer/types';
import MessageInput from '@renderer/components/MessageInput.vue';
import CreateConversation from '@renderer/components/CreateConversation.vue';
import ResizeDivider from '../components/ResizeDivider.vue';
import MessageList from '@renderer/components/MessageList.vue';
import { messages } from '@renderer/testData';
import { useMessagesStore } from '@renderer/stores/messages';

const route = useRoute();
const router = useRouter();
const conversationId = computed(() => route.params.id);
const listHeight = ref(0);
const listScale = ref(0.7);
const maxListHeight = ref(window.innerHeight * 0.7);
// const isStoping = ref(false);
const msgInputRef = useTemplateRef<{ selectedProvider: SelectValue }>('msgInputRef');
const message = ref('');
const provider = ref<SelectValue>();
//拆分select的value: `${item.id}:${model}`,
const providerId = computed(() => ((provider.value as string)?.split(':')[0] ?? ''));
const selectedModel = computed(() => ((provider.value as string)?.split(':')[1] ?? ''));
const messagesStore = useMessagesStore();
const handleCreateConversation = async (create: (title?: string) => Promise<number | void>, message: string) => {
    const conversationId = await create(message);
    if (!conversationId) return
    afterCreateConversation(conversationId,message);
}

const afterCreateConversation = (id: number,firstMsg:string) => {
    router.push(`/conversation/${id}`);
    //重置输入框
    message.value = '';
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



watch(() => listHeight.value, () => listScale.value = listHeight.value / window.innerHeight);
</script>

<template>
    <div class="h-full " v-if="!conversationId">
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
    <div class="h-full flex flex-col" v-else>
        <div class="w-full min-h-0" :style="{ height: `${listHeight}px` }">
            <message-list :messages="messages"/>

        </div>
        <div class="input-container bg-bubble-others flex-auto w-[calc(100% + 10px)] ml-[-5px] ">
            <resize-divider direction="horizontal" v-model:size="listHeight" :max-size="maxListHeight"
                :min-size="100" />
            <message-input v-model:provider="provider" :placeholder="$t('main.conversation.placeholder')" />
        </div>
    </div>
</template>