import { CONVERSATION_ITEM_MENU_IDS, CONVERSATION_LIST_MENU_IDS, MENU_IDS } from "@common/constants";
import { Conversation } from "@common/types";
import useDialog from "@renderer/hooks/useDialog";
import { useConversationsStore } from "@renderer/stores/conversations";
import { createMenu } from "@renderer/utils/contextMenu";
import { useFilter } from "./useFilter";

const SortByIdMap = new Map([
    ['createAt', CONVERSATION_LIST_MENU_IDS.SORT_BY_CREATE_TIME],
    ['updatedAt', CONVERSATION_LIST_MENU_IDS.SORT_BY_UPDATE_TIME],
    ['name', CONVERSATION_LIST_MENU_IDS.SORT_BY_NAME],
    ['model', CONVERSATION_LIST_MENU_IDS.SORT_BY_MODEL],
])
const SortOrderIdMap = new Map([
    ['desc', CONVERSATION_LIST_MENU_IDS.SORT_DESCENDING],
    ['asc', CONVERSATION_LIST_MENU_IDS.SORT_ASCENDING],
])

const isBatchOperate = ref(false);
const checkedIds = ref<number[]>([]);

export function useContextMenu() {
    const { conversations } = useFilter()
    const { createDialog } = useDialog();
    const router = useRouter();
    const route = useRoute();
    const currentId = computed(() => Number(route.params.id));
    const conversationsStore = useConversationsStore();

    const actionPolicy = new Map([
        [CONVERSATION_LIST_MENU_IDS.BATCH_OPERATIONS, () => {
            isBatchOperate.value = !isBatchOperate.value;
        }],
        [CONVERSATION_LIST_MENU_IDS.NEW_CONVERSATION, () => {
            router.push('/conversation')
        }],
        [CONVERSATION_LIST_MENU_IDS.SORT_BY_CREATE_TIME, () => conversationsStore.setSortMode('createAt', conversationsStore.sortOrder)],
        [CONVERSATION_LIST_MENU_IDS.SORT_BY_UPDATE_TIME, () => conversationsStore.setSortMode('updatedAt', conversationsStore.sortOrder)],
        [CONVERSATION_LIST_MENU_IDS.SORT_BY_NAME, () => conversationsStore.setSortMode('name', conversationsStore.sortOrder)],
        [CONVERSATION_LIST_MENU_IDS.SORT_BY_MODEL, () => conversationsStore.setSortMode('model', conversationsStore.sortOrder)],
        [CONVERSATION_LIST_MENU_IDS.SORT_DESCENDING, () => conversationsStore.setSortMode(conversationsStore.sortBy, 'desc')],
        [CONVERSATION_LIST_MENU_IDS.SORT_ASCENDING, () => conversationsStore.setSortMode(conversationsStore.sortBy, 'asc')],
    ])

    const handle = async () => {
        const sortBy = conversationsStore.sortBy
        const sortOrder = conversationsStore.sortOrder
        const sortById = SortByIdMap.get(sortBy) ?? '';
        const sortOrderId = SortOrderIdMap.get(sortOrder) ?? '';
        const newConversationEnabled = !!route.params.id
        const item = await createMenu(MENU_IDS.CONVERSATION_LIST, void 0, [
            { id: CONVERSATION_LIST_MENU_IDS.NEW_CONVERSATION, enabled: newConversationEnabled },
            { id: sortById, checked: true },
            { id: sortOrderId, checked: true },
        ]);
        
        const action = actionPolicy.get(item as CONVERSATION_LIST_MENU_IDS);
        action?.();
    }

    const conversationItemActionPolicy = new Map([
        [CONVERSATION_ITEM_MENU_IDS.DEL, async (item: Conversation) => {
            const res = await createDialog({
                title: 'main.conversation.dialog.title',
                content: 'main.conversation.dialog.content',
            })
            if (res === 'confirm') {
                conversationsStore.deleteConversation(item.id);
                item.id === currentId.value && router.push('/conversation');
            }
        }],
        [CONVERSATION_ITEM_MENU_IDS.RENAME, async (item: Conversation, callback: (id: number) => void) => {
            callback(item.id);
        }],
        [CONVERSATION_ITEM_MENU_IDS.PIN, async (item: Conversation) => {
            await conversationsStore.changePinConversation(item.id);
        }],
    ])



    async function handleItemContextMenu(_item: Conversation,callback?: (id: number) => void) {
        const label = _item.pinned ? 'main.conversation.operations.unpin' : 'main.conversation.operations.pin';
        const clickItem = await createMenu(MENU_IDS.CONVERSATION_ITEM, void 0, [{ label: label, id: CONVERSATION_ITEM_MENU_IDS.PIN }]) as CONVERSATION_ITEM_MENU_IDS;
        const action = conversationItemActionPolicy.get(clickItem);
        action && await action?.(_item,callback!);
    }


    const batchActionPolicy = new Map([
        [CONVERSATION_ITEM_MENU_IDS.DEL, async () => {
            const res =  await createDialog({
                title: 'main.conversation.dialog.title',
                content: 'main.conversation.dialog.content_1',
            })
            if (res !== 'confirm') return
            if(checkedIds.value.includes(currentId.value)){
                router.push('/conversation');
            }
            checkedIds.value.forEach(id => conversationsStore.deleteConversation(id));
            isBatchOperate.value = false;
        }],
        [CONVERSATION_ITEM_MENU_IDS.PIN, async () => {
            checkedIds.value.forEach((id) => {
                conversationsStore.changePinConversation(id)
            })
            isBatchOperate.value = false;
        }]
    ])
    function handleAllSelectChange(checked: boolean) {
        checkedIds.value = checked ? conversations.value.map(item => item.id) : [];
    }

    function handleBatchOperate(id: CONVERSATION_ITEM_MENU_IDS) {
        const action = batchActionPolicy.get(id);
        action && action();
    }

    return {
        isBatchOperate,
        conversations,
        checkedIds,
        handleAllSelectChange,
        handleBatchOperate,
        handleListContextMenu:handle,
        handleItemContextMenu
    }
}