<script setup lang="ts">
import { SelectValue } from '@renderer/types';
import MessageInput from '@renderer/components/MessageInput.vue';
import CreateConversation from '@renderer/components/CreateConversation.vue';

const message = ref('');
const provider = ref<SelectValue>();
//拆分select的value: `${item.id}:${model}`,
const providerId = computed(() => ((provider.value as string)?.split(':')[0] ?? ''));
const selectedModel = computed(() => ((provider.value as string)?.split(':')[1] ?? ''));
const handleCreateConversation = async(create: (title?: string) => Promise<number | void>,message:string) => {
    const conversationId = await create(message);
    if(!conversationId) return
    console.log(message);
}

</script>

<template>
    <div class="main-view h-full w-full flex flex-col">
        <title-bar>
            <drag-region class="w-full" />
        </title-bar>
        <div>Main</div>
        <main class="flex-auto">
            <!-- <router-view /> -->
             <create-conversation :provider-id="providerId" :selected-model="selectedModel" v-slot="{ create }">
                <message-input v-model:message="message" v-model:provider="provider" 
                    :placeholder="$t('main.conversation.placeholder')" @send="handleCreateConversation(create,$event)"></message-input>
             </create-conversation>
        </main>
    </div>
</template>