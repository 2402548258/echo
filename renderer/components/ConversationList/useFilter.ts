import { useConversationsStore } from "@renderer/stores/conversations"

const searchKey = ref('')
export function useFilter() {
    const conversionStore = useConversationsStore()
    const filterconversitions = computed(() => {
        return conversionStore.conversations
    })
    return{
        searchKey,
        conversations:filterconversitions
    }
}
