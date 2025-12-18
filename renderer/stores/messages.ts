import { Message } from "@common/types"
import { database } from "@renderer/dataBase";
import { uniqueByKey } from "@common/utils";
import { useConversationsStore } from "./conversations";


export const useMessagesStore = defineStore('messages', () => {
    const conversationsStore = useConversationsStore()
//state
    const messages = ref<Message[]>([])
//getters
    const allMessages = computed(() => messages.value)

    const messagesByConversationId = (conversationId: number) => {
        return messages.value.filter(msg => msg.conversationId === conversationId).sort((a, b) => a.createdAt - b.createdAt);
    }

    async function initialize(conversationId: number) {
        const isLocal = messages.value.some(msg => msg.conversationId === conversationId);
        if(isLocal) return; 
        const dataBaseMessages = await database.messages.where('conversationId').equals(conversationId).toArray();
        messages.value = uniqueByKey([...messages.value, ...dataBaseMessages], 'id');
    }

    async function addMessage(message: Omit<Message, 'id' |'createdAt'>) {
        const newMessage: Message = {
            ...message,
            createdAt: Date.now(),
        } as Message;
        const id = await database.messages.add(newMessage);
        _updateConversation(id)
        messages.value.push({
            ...newMessage,
            id
        })
        return id;
    }

    function _updateConversation(conversationId:number){
        const conversation = conversationsStore.getConversationById(conversationId);
        if(!conversation) return;
        conversationsStore.updateConversation(conversation)
    }

    async function sendMessage(message: Omit<Message, 'id' | 'createdAt'>){
        await addMessage(message);
        // const loadingMsgId = await addMessage({
        //   conversationId: message.conversationId,
        //   type: 'answer',
        //   content: '',
        //   status: 'loading',
        // });

    }
    async function updateMessage(id: number, updates: Partial<Message>) {
        const message = messages.value.find(msg => msg.id === id);
        const updateId = await database.messages.update(id, {...message,...updates});
        messages.value = messages.value.map(msg => msg.id === updateId ? { ...msg, ...updates } : msg);
        return updateId;
    }

    async function deleteMessage(id: number) {
        const currentMsg = messages.value.find(item => item.id === id);
        //TODO: stopMessage(id, false);
        await database.messages.delete(id);
        currentMsg && _updateConversation(currentMsg.conversationId);
        // 从响应式数组中移除
        messages.value = messages.value.filter(message => message.id !== id);
    }


    return {
        messages,
        allMessages,
        messagesByConversationId,
        initialize,
        addMessage,
        sendMessage,
        updateMessage,
        deleteMessage,
    }


    
})