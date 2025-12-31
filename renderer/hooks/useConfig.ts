import type { Reactive } from 'vue';
import type { IConfig } from '@common/types';
import { CONFIG_KEYS } from '@common/constants';

import { setLanguage, getLanguage } from '@renderer/i18n';

const config: Reactive<IConfig> = reactive({
    [CONFIG_KEYS.THEME_MODE]: 'system',
    [CONFIG_KEYS.PRIMARY_COLOR]: '#BB5BE7',
    [CONFIG_KEYS.LANGUAGE]: 'zh',
    [CONFIG_KEYS.FONT_SIZE]: 14,
    [CONFIG_KEYS.MINIMIZE_TO_TRAY]: false,
    [CONFIG_KEYS.PROVIDER]: '',
    [CONFIG_KEYS.DEFAULT_MODEL]: null,
});

const configKeys = [
    CONFIG_KEYS.THEME_MODE,
    CONFIG_KEYS.PRIMARY_COLOR,
    CONFIG_KEYS.LANGUAGE,
    CONFIG_KEYS.FONT_SIZE,
    CONFIG_KEYS.MINIMIZE_TO_TRAY,
    CONFIG_KEYS.PROVIDER,
    CONFIG_KEYS.DEFAULT_MODEL
];


const setReactiveConfig = <K extends keyof IConfig>(key: K, value: IConfig[K]) => config[key] = value


configKeys.forEach(item => window.api.getConfig(item).then(res => setReactiveConfig(item, res)))

setLanguage(config[CONFIG_KEYS.LANGUAGE])

export function useConfig() {
    const removeListener = window.api.onConfigChange((_config: IConfig) => {
        configKeys.forEach(async (key) => {
            if (key === CONFIG_KEYS.LANGUAGE) {
                const lang = await getLanguage();
                (lang !== config[key]) && setLanguage(config[key])
            }
            if (_config[key] === config[key]) return;
            setReactiveConfig(key, _config[key]);
        });
    })

    const onReactiveChange = async () => {
       window.api.updateConfig({...config})
    }

    watch(() => config, () => {
        onReactiveChange()
    }, {
        deep: true
    })

    onUnmounted(()=>{
        removeListener()
    })

    return config
}

export default useConfig
