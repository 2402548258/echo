import type { Conversation } from '@common/types';
import { conversations as testConversations } from '../testData';


export const useConversationsStore = defineStore('conversations', () =>{
    const conversations = ref<Conversation[]>(testConversations);
    const getConversations = computed(() => conversations.value);
    return{
        conversations,
        getConversations
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