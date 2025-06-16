<script setup>
import { useThemeSwitch } from '@/composables/topPanel/useThemeSwitch'

import BaseIcon from '@/components/icons/BaseIcon.vue'
import ItemTip from '../common/ItemTip.vue'

const { theme, toggleTheme } = useThemeSwitch()
</script>

<template>
  <ItemTip
    :text="$t('topPanel.settingsPanel.theme.button.tip')"
    position="bottom"
  >
    <div
      class="theme-switch button button-circle button-control"
      @click="toggleTheme"
    >
      <BaseIcon
        :key="theme"
        :name="theme === 'dark' ? 'IconSun' : 'IconMoon'"
        size="24"
      />
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
