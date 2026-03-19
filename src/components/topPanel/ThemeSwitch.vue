<script setup>
/**
 * @file: ThemeSwitch.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for the theme switch button. Renders a button that allows users to switch between light and dark themes. The button displays an icon representing the current theme and toggles the theme when clicked.
 */
import { useThemeSwitch } from '@/composables/topPanel/useThemeSwitch'
import { useUiStore } from '@/stores/uiStore'

import BaseIcon from '@/components/icons/BaseIcon.vue'
import ItemTip from '@/components/common/ItemTip.vue'

/**
 * Logic for the theme switch button.
 */
const {
  isLightMode,
  toggleTheme
} = useThemeSwitch(useUiStore())
</script>

<template>
  <ItemTip :text="$t('topPanel.settingsPanel.theme.button.tip')" position="bottom-left">
    <div class="toggle-mode-switch">
      <div class="toggle-mode-switch-wrapper" :class="{ active: isLightMode }" @click="toggleTheme">
        <div class="toggle-mode-switch-slider" :class="{ active: isLightMode }">
          <BaseIcon color="var(--secondary-c)" :name="isLightMode ? 'IconSun' : 'IconMoon'" size="24" />
        </div>
      </div>
    </div>
  </ItemTip>
</template>

<style scoped>
.toggle-mode-switch {
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-mode-switch-wrapper {
  position: relative;
  display: flex;
  border: 2px solid var(--secondary-c);
  border-radius: 20px;
  padding: 5px;
  width: 80px;
  height: 40px;
  overflow: hidden;
  cursor: pointer;
  transition: var(--default-transition);
}

.toggle-mode-switch-wrapper.active {
  background: var(--secondary-c);
  transition: var(--default-transition);
}

.toggle-mode-switch-slider {
  position: absolute;
  top: 3px;
  opacity: 1;
  left: 3px;
  width: calc(100% / 2 - 3px);
  height: 30px;
  background: var(--primary-c);
  border: 2px solid var(--primary-c);
  border-radius: 15px;
  transition: var(--default-transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-mode-switch-slider.active {
  left: calc(100% / 2);
  opacity: 1;
  transition: var(--default-transition);
}
</style>
