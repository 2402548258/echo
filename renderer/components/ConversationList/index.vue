<script setup lang="ts">
import { useFilter } from './useFilter';
import SearchBar from './SearchBar.vue';
import ListItem from './ListItem.vue';
import { CTX_KEY } from './constants';
import { useContextMenu } from './useContextMenu';
import { useConversationsStore } from '@renderer/stores/conversations';
import { CONVERSATION_ITEM_MENU_IDS } from '@common/constants';
import OperationsBar from './OperationsBar.vue';

defineOptions({
    name: 'ConversationList'
});
const { conversations } = useFilter()

const props = defineProps<{ width: number }>()
const editId = ref<number | undefined>();
const checkedIds = ref<number[]>([]);
const conversationsStore = useConversationsStore();
const { handleListContextMenu, handleItemContextMenu, isBatchOperate } = useContextMenu()


provide(CTX_KEY, {
    width: computed(() => props.width),
    editId: computed(() => editId.value),
    checkedIds: checkedIds
})

function updateTitle(id: number, title: string) {
    const target = conversationsStore.conversations.find(item => item.id === id);
    if (!target) return
    conversationsStore.updateConversation({
        ...target,
        title
    });
    editId.value = void 0;
}

const batchActionPolicy = new Map([
    [CONVERSATION_ITEM_MENU_IDS.DEL, async () => {
        // TODO
    }],
    [CONVERSATION_ITEM_MENU_IDS.PIN, async () => {
        checkedIds.value.forEach((id) => {
            conversationsStore.changePinConversation(id)
        })
        isBatchOperate.value = false;
    }]
])
function handleAllSelectChange(checked: boolean){
    checkedIds.value = checked ? conversations.value.map(item => item.id) : [];
}

function handleBatchOperate(id:CONVERSATION_ITEM_MENU_IDS){
    const action = batchActionPolicy.get(id);
    action && action();
}

const rename = (id: number) => {
    editId.value = id;
};

watch(()=> conversations.value, ()=> {
    
})

</script>

<template>
    <div class="conversation-list px-2 pt-3 h-[100vh] flex flex-col w-[calc(100%-57px)]"
        @contextmenu.prevent.stop="handleListContextMenu">
        <search-bar />
        <ul class="flex-auto min-w-0 overflow-y-auto scrollbar-primary">
            <template v-for="item in conversations" :key="item.id">
                <li v-if="item.type !== 'divider'"
                    class="cursor-pointer p-2 mt-2 rounded-md hover:bg-input flex flex-col items-start gap-2 min-w-0 "
                    @contextmenu.prevent.stop="handleItemContextMenu(item, rename)">
                    <list-item v-bind="item" @update-title="updateTitle" />
                </li>
                <li v-else class="divider my-2 h-px bg-input"></li>
            </template>
        </ul>
        <operations-bar v-show="isBatchOperate" @select-all="handleAllSelectChange" @cancel="isBatchOperate = false"
            @op="handleBatchOperate" />
    </div>
</template>