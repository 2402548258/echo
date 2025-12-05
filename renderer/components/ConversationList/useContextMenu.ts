import { CONVERSATION_ITEM_MENU_IDS, CONVERSATION_LIST_MENU_IDS, MENU_IDS } from "@common/constants";
import { Conversation } from "@common/types";
import { useConversationsStore } from "@renderer/stores/conversations";
import { createMenu } from "@renderer/utils/contextMenu";

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

export function useContextMenu() {
    const router = useRouter();
    const route = useRoute();
    const conversationsStore = useConversationsStore();

    const actionPolicy = new Map([
        [CONVERSATION_LIST_MENU_IDS.BATCH_OPERATIONS, () => {
            console.log('batch operations');
        }],
        [CONVERSATION_LIST_MENU_IDS.NEW_CONVERSATION, () => {
            console.log('new conversation');
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
        console.log(sortById);
        const item = await createMenu(MENU_IDS.CONVERSATION_LIST, void 0, [
            { id: CONVERSATION_LIST_MENU_IDS.NEW_CONVERSATION, enabled: newConversationEnabled },
            { id: sortById, checked: true },
            { id: sortOrderId, checked: true },
        ]);
        
        const action = actionPolicy.get(item as CONVERSATION_LIST_MENU_IDS);
        action?.();
    }

    const conversationItemActionPolicy = new Map([
        [CONVERSATION_ITEM_MENU_IDS.DEL, async () => {
            console.log('删除');
        }],
        [CONVERSATION_ITEM_MENU_IDS.RENAME, async () => {
            console.log('重命名');
        }],
        [CONVERSATION_ITEM_MENU_IDS.PIN, async (item: Conversation) => {
            await conversationsStore.changePinConversation(item.id);
        }],
    ])

    async function handleItemContextMenu(_item: Conversation) {
        const clickItem = await createMenu(MENU_IDS.CONVERSATION_ITEM, void 0) as CONVERSATION_ITEM_MENU_IDS;
        const action = conversationItemActionPolicy.get(clickItem);
        action && await action?.(_item);
    }

    return {
        handleListContextMenu:handle,
        handleItemContextMenu
    }
}