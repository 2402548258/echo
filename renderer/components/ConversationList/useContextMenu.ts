import { CONVERSATION_ITEM_MENU_IDS, CONVERSATION_LIST_MENU_IDS, MENU_IDS } from "@common/constants";
import { Conversation } from "@common/types";
import { useConversationsStore } from "@renderer/stores/conversations";
import { createMenu } from "@renderer/utils/contextMenu";

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
        [CONVERSATION_LIST_MENU_IDS.SORT_BY_CREATE_TIME, () => {
            console.log('sort by create time');
        }
        ],
        [CONVERSATION_LIST_MENU_IDS.SORT_BY_UPDATE_TIME, () => {
            console.log('sort by update time');
        }
        ],
        [CONVERSATION_LIST_MENU_IDS.SORT_BY_NAME, () => {
            console.log('sort by name');
        }
        ],
        [CONVERSATION_LIST_MENU_IDS.SORT_BY_MODEL, () => {
            console.log('sort by model');
        }
        ],
        [CONVERSATION_LIST_MENU_IDS.SORT_DESCENDING, () => {
            console.log('sort descending');
        }],
        [CONVERSATION_LIST_MENU_IDS.SORT_ASCENDING, () => {
            console.log('sort ascending');
        }],
    ])
    const handle = async () => {

        const item = await createMenu(MENU_IDS.CONVERSATION_LIST);
        const action = actionPolicy.get(item as CONVERSATION_LIST_MENU_IDS);
        action?.();
    }

    const conversationItemActionPolicy = new Map([
        [CONVERSATION_ITEM_MENU_IDS.DEL, () => {
            console.log('删除');
        }],
        [CONVERSATION_ITEM_MENU_IDS.RENAME, () => {
            console.log('重命名');
        }],
        [CONVERSATION_ITEM_MENU_IDS.PIN, () => {
            console.log('置顶');
        }],
    ])

    async function handleItemContextMenu(_item: Conversation) {
        const clickItem = await createMenu(MENU_IDS.CONVERSATION_ITEM, void 0) as CONVERSATION_ITEM_MENU_IDS;
        const action = conversationItemActionPolicy.get(clickItem);
        action && await action?.();
    }

    return {
        handleListContextMenu:handle,
        handleItemContextMenu
    }
}