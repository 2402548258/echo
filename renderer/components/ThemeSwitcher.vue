<script setup lang="ts">
import { useThemeMode } from '@renderer/hooks/useThemeMode';
import NativeTooltip from './NativeTooltip.vue';
import { Icon as IconifyIcon } from '@iconify/vue';

defineOptions({ name: 'ThemeSwitcher' });

const {
    themeIcon,
    themeTooltip,
    setThemeMode,
} = useThemeMode();
const isDarkMode = usePreferredDark();

function toggleThemeMode() {
    setThemeMode(isDarkMode.value ? 'light' : 'dark');
}
</script>

<template>
    <native-tooltip :content="$t(themeTooltip)">
        <iconify-icon :icon="themeIcon" width="24" height="24" @click="toggleThemeMode" />
    </native-tooltip>
</template>
