import { Conversation } from "@common/types";
import { debounce } from "@common/utils";
import { useConversationsStore } from "@renderer/stores/conversations"

const searchKey = ref('')
const _searchKey = ref('');//防抖处理搜索关键词
export function useFilter() {
    const conversionStore = useConversationsStore()
    const sortConversations = computed(() => {
        const sortBy = conversionStore.sortBy
        const sortOrder = conversionStore.sortOrder
        const divider = Object.freeze({
            type: 'divider',
            id: -1
        }) as Conversation;
        const pinned: Conversation[] = conversionStore.allconversations.filter(item => item.pinned).map(item => ({ type: 'conversation', ...item }));

        if (pinned.length) {
            pinned.push(divider);
        }

        const unPinned: Conversation[] = conversionStore.allconversations.filter(item => !item.pinned).map(item => ({ type: 'conversation', ...item }));

        const handleSortOrder = <T = number | string>(a?: T, b?: T) => {
            if (typeof a === 'number' && typeof b === 'number') {
                return sortOrder === 'desc' ? b - a : a - b;
            }

            if (typeof a === 'string' && typeof b === 'string') {
                return sortOrder === 'desc' ? b.localeCompare(a) : a.localeCompare(b);
            }

            return 0
        }

        if (sortBy === 'createAt') { 
            return [
                ...pinned.sort((a, b) => handleSortOrder(a.createdAt, b.createdAt)),
                ...unPinned.sort((a, b) => handleSortOrder(a.createdAt, b.createdAt)),
            ]
        }

        if (sortBy === 'updatedAt') {
            return [
                ...pinned.sort((a, b) => handleSortOrder(a.updatedAt, b.updatedAt)),
                ...unPinned.sort((a, b) => handleSortOrder(a.updatedAt, b.updatedAt)),
            ]
        }

        if (sortBy === 'name') {
            return [
                ...pinned.sort((a, b) => handleSortOrder(a.title, b.title)),
                ...unPinned.sort((a, b) => handleSortOrder(a.title, b.title)),
            ]
        }

        return [
            ...pinned.sort((a, b) => handleSortOrder(a.selectedModel, b.selectedModel)),
            ...unPinned.sort((a, b) => handleSortOrder(a.selectedModel, b.selectedModel)),
        ]
    })
    const updateSearchKey = debounce((key: string) => {
        
        _searchKey.value = key
    },300)
    const filterconversitions = computed(() => {
        if (!_searchKey.value.trim()){
            return sortConversations.value
        }
        console.log(_searchKey.value.toLowerCase().trim());
        const filtered = sortConversations.value.filter(item => {
            const title = item?.title ?? '';
            return title.toLowerCase().includes(_searchKey.value.toLowerCase().trim());
        });
        if (filtered.filter(item => item.pinned).length === 0 && filtered.filter(item => item.type==='divider').length>0){
            sortConversations.value.splice(sortConversations.value.findIndex(item => item.type==='divider'),1)
        }
        return filtered
    })
    watch(searchKey, (newVal) => {
        updateSearchKey(newVal)
    })
    return{
        searchKey,
        conversations:filterconversitions
    }
}
