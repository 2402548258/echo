import { database } from "@renderer/dataBase";
import { Provider } from "common/types";

export const useProvidersStore = defineStore('providers',() => {
    const providers = ref<Provider[]>([])
    const allProviders = computed(() => providers.value);

    async function initialize() {
        providers.value = await database.providers.toArray();
    }
    return {
        // state
        providers,
        // getters
        allProviders,
        // actions
        initialize,
    }
})