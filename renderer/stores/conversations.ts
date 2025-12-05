import type { Conversation } from '@common/types';
import { conversations as testConversations } from '../testData';
import { database } from '@renderer/dataBase';
import { debounce } from '@common/utils';

type SortBy = 'updatedAt' | 'createAt' | 'name' | 'model'; // 排序字段类型
type SortOrder = 'asc' | 'desc'; // 排序顺序类型

const SORT_BY_KEY = 'conversation:sortBy';
const SORT_ORDER_KEY = 'conversation:sortOrder';


const saveSortMode = debounce(({ sortBy, sortOrder }: { sortBy: SortBy, sortOrder: SortOrder }) => {
    localStorage.setItem(SORT_BY_KEY, sortBy);
    localStorage.setItem(SORT_ORDER_KEY, sortOrder);
}, 300);

export const useConversationsStore = defineStore('conversations', () =>{
//state
    const conversations = ref<Conversation[]>([]);
    const getSortBy = localStorage.getItem(SORT_BY_KEY) as SortBy;
    const getSortOrder = localStorage.getItem(SORT_ORDER_KEY) as SortOrder;
    const sortBy = ref<SortBy>(getSortBy ?? 'createAt');
    const sortOrder = ref<SortOrder>(getSortOrder ?? 'desc');
//getters
    const allconversations = computed(() => {conversations.value})
//actions
    async function initConversations() {
        conversations.value = await database.conversations.toArray();
        const ids = conversations.value.map(item => item.id);
        const message = await database.messages.toArray();
        const invalidId = message.filter(item => !ids.includes(item.conversationId)).map(item => item.conversationId);
        invalidId.length && database.messages.where('id').anyOf(invalidId).delete();
    }

    function setSortMode(_sortBy: SortBy, _sortOrder: SortOrder) {
        if (sortBy.value !== _sortBy)
            sortBy.value = _sortBy;
        if (sortOrder.value !== _sortOrder)
            sortOrder.value = _sortOrder;
    }
    function getConversationById(id: number) {
        return conversations.value.find(item => item.id === id) as Conversation | void;
    }

    async function addConversation(conversation: Omit<Conversation, 'id'>) {
        const fullConversation ={
            ...conversation,
            pinned:conversation.pinned??false
        }
        const id = await database.conversations.add(fullConversation);
        conversations.value.push({
            ...fullConversation,
            id
        });
        return id;
    }

    async function deleteConversation(id:number) {
        await database.messages.where('conversationId').equals(id).delete();
        await database.conversations.delete(id);
        conversations.value = conversations.value.filter(item => item.id !== id);  
    }

    async function updateConversation(conversation: Conversation, updateTime: boolean = true) {
        const _newConversation = {
            ...conversation,
            updatedAt: updateTime ? Date.now() : conversation.updatedAt,
        }

        await database.conversations.update(conversation.id, _newConversation);
        conversations.value = conversations.value.map(item => item.id === conversation.id ? _newConversation : item);
    }

    async function changePinConversation(id: number) {
        const conversation = conversations.value.find(item => item.id === id);

        if (!conversation) return;
        await updateConversation({
            ...conversation,
            pinned: !conversation.pinned,
        }, false);
    }

    watch([() => sortBy.value, () => sortOrder.value], ([newSortBy, newsortOrder]) => {
        sortBy.value = newSortBy 
        sortOrder.value = newsortOrder
        saveSortMode({ sortBy: newSortBy, sortOrder: newsortOrder})
    })
    return {
        // State
        conversations,
        sortBy,
        sortOrder,

        // Getters
        allconversations,
        // Actions
        initConversations,
        setSortMode,
        getConversationById,
        addConversation,
        deleteConversation,
        updateConversation,
        changePinConversation
    }
});


export const useNameStore = defineStore('name', {
state: ()=>({name:''  }),
getters:{
    getName:(state)=>state.name
},
actions:{
    setName(newName:string){
        this.name=newName;
    }
}
})