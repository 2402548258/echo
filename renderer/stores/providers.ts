import type { Provider } from '@common/types';
import { CONFIG_KEYS } from '@common/constants';
import { parseOpenAISetting, deepMerge } from '@common/utils';
import { encode } from 'js-base64';
import { database } from '../dataBase';
import { useConfig } from '../hooks/useConfig';



export const useProvidersStore = defineStore('providers',() => {
    const providers = ref<Provider[]>([])
    const allProviders = computed(() => providers.value.map(item => ({ ...item, openAISetting: parseOpenAISetting(item.openAISetting ?? '') })))
    const config = useConfig()
    async function initialize() {
        providers.value = await database.providers.toArray();
    }

    async function updateProvider(id: number, provider: Partial<Provider>) {
        await database.providers.update(id,{...provider})
        providers.value =providers.value.map(item => item.id === id ? deepMerge(item,provider) as Provider : item) 
        config[CONFIG_KEYS.PROVIDER] = encode(JSON.stringify(providers.value))
    }

    watch(() => config[CONFIG_KEYS.PROVIDER], () => initialize());
   
    return {
        // state
        providers,
        // getters
        allProviders,
        // actions
        initialize,
        updateProvider,
    }
})