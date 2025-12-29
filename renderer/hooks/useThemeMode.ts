import { CONFIG_KEYS } from "@common/constants";
import useConfig from "./useConfig";

const iconMap = new Map([
    ['system', 'material-symbols:auto-awesome-outline'],
    ['light', 'material-symbols:light-mode-outline'],
    ['dark', 'material-symbols:dark-mode-outline'],
])

const tooltipMap = new Map([
    ['system', 'settings.theme.system'],
    ['light', 'settings.theme.light'],
    ['dark', 'settings.theme.dark']
])

export function useThemeMode() {
    const themeMode = ref<ThemeMode>('dark');
    const isDark = ref<boolean>(true);
    const themeIcon = computed(() => iconMap.get(themeMode.value) || 'material-symbols:auto-awesome-outline');
    const themeTooltip = computed(() => tooltipMap.get(themeMode.value) || 'settings.theme.system');
    const themeChangeCallbacks: Array<(mode: ThemeMode) => void> = [];

    const config = useConfig()

  function setThemeMode(mode: ThemeMode) {
        themeMode.value = mode;
        window.api.setThemeMode(mode);
    }

    function getThemeMode() {
        return themeMode.value;
    }

    function onThemeChange(callback: (mode: ThemeMode) => void) {
        themeChangeCallbacks.push(callback);
    }

    watch(() => config[CONFIG_KEYS.THEME_MODE], (mode) => {
        (themeMode.value !== mode) && setThemeMode(mode);
    });

    onMounted(async () => {
        window.api.onSystemThemeChange((_isDark) => window.api.getThemeMode().then((mode) => {
            if (isDark.value != _isDark) isDark.value = _isDark;
            if (themeMode.value !== mode) themeMode.value = mode;
            themeChangeCallbacks.forEach(element => {
                element(mode);
            })
        }))
        isDark.value = await window.api.isDarkTheme();
        themeMode.value = await window.api.getThemeMode();
    })

    return {
        themeMode,
        themeIcon,
        themeTooltip,
        isDark,
        setThemeMode,
        getThemeMode,
        onThemeChange,
    }

}


export default useThemeMode;

