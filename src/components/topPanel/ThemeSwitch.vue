<script setup>
import { useThemeSwitch } from '@/composables/topPanel/useThemeSwitch'

import BaseIcon from '@/components/icons/BaseIcon.vue'

const { theme, toggleTheme } = useThemeSwitch()
</script>

<template>
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
</template>

<style scoped>
.theme-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

</style>
