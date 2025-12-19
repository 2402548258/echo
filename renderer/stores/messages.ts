import { Message, MessageStatus } from "@common/types"
import { database } from "@renderer/dataBase";
import { uniqueByKey } from "@common/utils";
import { useConversationsStore } from "./conversations";
import { useProvidersStore } from "./providers";
import { listenDialogueBack } from "@renderer/utils/dialogMessage";

const msgContentMap = new Map<number, string>(); //用于存取每次发送的不同块的内容
export const stopMethods = new Map<number, () => void>();

export const useMessagesStore = defineStore('messages', () => {
    const conversationsStore = useConversationsStore()
    const providerStore = useProvidersStore()
//state
    const messages = ref<Message[]>([])
//getters
    const allMessages = computed(() => messages.value)

    const messagesByConversationId = computed(() => (conversationId: number)=>{
        return messages.value.filter(msg => msg.conversationId === conversationId).sort((a, b) => a.createdAt - b.createdAt);
    })

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
        const loadingMsgId = await addMessage({
          conversationId: message.conversationId,
          type: 'answer',
          content: '',
          status: 'loading',
        });
        const conversation = conversationsStore.getConversationById(message.conversationId);

        if (!conversation) return loadingMsgId;

        const provider = providerStore.allProviders.find(item => item.id === conversation.providerId);

        if (!provider) return loadingMsgId;

        msgContentMap.set(loadingMsgId, '');

        let streamCallback: ((stream: DialogueBackStream) => Promise<void>) | void = async (stream) => {
            const { messageId, data} = stream;
            const getStatus = (data: DialogueBackStream['data']): MessageStatus => {
                if (data.isError) return 'error';
                if (data.isEnd) return 'success';
                return 'streaming';
            }
            msgContentMap.set(messageId, msgContentMap.get(messageId) + data.result); //累计内容
            const _updateMsg = {
                content: msgContentMap.get(messageId) || '',
                status: getStatus(data),
                updatedAt: Date.now(),
            }
            await updateMessage(messageId, _updateMsg);
            if(data.isEnd){
                msgContentMap.delete(messageId);
            }
        }
        stopMethods.set(loadingMsgId,listenDialogueBack(streamCallback,loadingMsgId)) //得到stop并开启监听
        const messages = messagesByConversationId.value(message.conversationId).filter(item => item.status !== 'loading').map(item => ({
            role: item.type === 'question' ? 'user' : 'assistant' as DialogueMessageRole,
            content: item.content,
        })); //上下文为除loading外的消息

        window.api.startADialogueMessage({
            messageId: loadingMsgId,
            providerName: provider.name,
            selectedModel: conversation.selectedModel,
            conversationId: message.conversationId,
            messages,
        });
    }
   
    async function updateMessage(id: number, updates: Partial<Message>) {
        const message = messages.value.find(msg => msg.id === id);
        if (!message) return 0;
        const rowsUpdated = await database.messages.update(id, { ...message, ...updates });
        if (rowsUpdated) {
            messages.value = messages.value.map(msg => msg.id === id ? { ...msg, ...updates } : msg);
        }
        return rowsUpdated;
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
