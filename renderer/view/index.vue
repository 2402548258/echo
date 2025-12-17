<script setup lang="ts">




</script>

<template>
    <div class="main-view h-full w-full flex flex-col">
        <title-bar>
            <drag-region class="w-full" />
        </title-bar>
        <main class="flex-auto">
            <router-view />
             <!-- <create-conversation :provider-id="providerId" :selected-model="selectedModel" v-slot="{ create }">
                <message-input v-model:message="message" v-model:provider="provider" 
                    :placeholder="$t('main.conversation.placeholder')" @send="handleCreateConversation(create,$event)"></message-input>
             </create-conversation> -->
        </main>
    </div>
</template>