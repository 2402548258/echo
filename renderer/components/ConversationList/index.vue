<script setup lang="ts">
import { useFilter } from './useFilter';
import SearchBar from './SearchBar.vue';
import ListItem from './ListItem.vue';
import { CTX_KEY } from './constants';
import { useContextMenu } from './useContextMenu';

defineOptions({
    name: 'ConversationList'
});
const { conversations } = useFilter()

const props = defineProps<{ width: number }>()

const { handleListContextMenu,handleItemContextMenu } = useContextMenu()



provide(CTX_KEY, {
    width: computed(() => props.width)
})

</script>

<template>
    <div class="conversation-list px-2 pt-3 h-[100vh] flex flex-col w-[calc(100%-57px)]"
        @contextmenu.prevent.stop="handleListContextMenu">
        <search-bar />
        <ul class="flex-auto min-w-0 ">
            <template v-for="item in conversations" :key="item.id">
                <li v-if="item.type !== 'divider'"
                    class="cursor-pointer p-2 mt-2 rounded-md hover:bg-input flex flex-col items-start gap-2 min-w-0 "
                    @contextmenu.prevent.stop="handleItemContextMenu(item)">
                    <list-item v-bind="item" />
                </li>
                <li v-else class="divider my-2 h-px bg-input"></li>
            </template>
        </ul>
    </div>
</template>