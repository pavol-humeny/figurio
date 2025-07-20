<script setup>
import { useThemeSwitch } from '@/composables/topPanel/useThemeSwitch'
import { useUiStore } from '@/stores/uiStore'

import BaseIcon from '@/components/icons/BaseIcon.vue'
import ItemTip from '@/components/common/ItemTip.vue'

/**
 * Logic for the theme switch button.
 */
const {
  theme,
  toggleTheme
} = useThemeSwitch(useUiStore())
</script>

<template>
  <ItemTip :text="$t('topPanel.settingsPanel.theme.button.tip')" position="bottom-left">
    <div class="theme-switch button button-circle button-control" @click="toggleTheme">
      <BaseIcon :key="theme" :name="theme === 'dark' ? 'IconSun' : 'IconMoon'" size="24" />
    </div>
  </ItemTip>
</template>

<style scoped>
.theme-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
</style>
