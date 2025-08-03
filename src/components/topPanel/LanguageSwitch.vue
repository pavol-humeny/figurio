<script setup>
import { ref } from 'vue'
import { useLanguageSwitch } from '@/composables/topPanel/useLanguageSwitch'
import { globalConfig } from '@/config/globalConfig'

import ItemTip from '@/components/common/ItemTip.vue'

/**
 * Logic for the language switch component.
 */
const { locale, switchLanguage } = useLanguageSwitch()

/**
 * Currently hovered language code
 */
const hoveredLang = ref(null)

/**
 * Returns CSS class for a language button
 * @param {string} lang - Language code to evaluate
 * @returns {string} - CSS class for button styling
 */
const getButtonClass = (lang) => {
  let classes = []
  if (!globalConfig.supportedLanguages.includes(lang)) {
    classes.push('disabled')
  }
  if (locale.value === lang && hoveredLang.value !== lang && hoveredLang.value !== null) {
    classes.push('button-active', 'hovered-away')
  } else if (locale.value === lang) {
    classes.push('button-active')
  }
  return classes.join(' ')
}

</script>

<template>
  <ItemTip :text="$t('topPanel.settingsPanel.language.tip')" position="bottom-left">
    <div class="language-switch">
      <div class="slider" :class="hoveredLang || locale"></div>
      <button :class="getButtonClass('sk')" @click="switchLanguage('sk')" @mouseenter="hoveredLang = 'sk'"
        @mouseleave="hoveredLang = null">
        SK
      </button>
      <button :class="getButtonClass('en')" @click="switchLanguage('en')" @mouseenter="hoveredLang = 'en'"
        @mouseleave="hoveredLang = null">
        EN
      </button>
      <button :class="getButtonClass('cz')" @click="switchLanguage('cz')" @mouseenter="hoveredLang = 'cz'"
        @mouseleave="hoveredLang = null">
        CZ
      </button>
    </div>
  </ItemTip>
</template>

<style scoped>
.language-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: var(--secondary-c);
  border-radius: 20px;
  padding: 5px;
  width: 170px;
  height: 40px;
  overflow: hidden;
}

.language-switch button {
  flex: 1;
  z-index: 1;
  background: transparent;
  border: none;
  color: var(--primary-c);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--default-transition);
}

.language-switch button.button-active {
  color: var(--secondary-c);
}

.language-switch button:not(.button-active):hover {
  color: var(--secondary-c);
  transition: var(--default-transition);
}

.language-switch button.hovered-away {
  color: var(--primary-c);
}

.slider {
  position: absolute;
  top: 5px;
  left: 5px;
  width: calc(100% / 3 - 2px);
  height: 30px;
  background: var(--primary-c);
  border-radius: 15px;
  transition: left 0.2s ease;
}

.slider.sk {
  left: 5px;
}

.slider.en {
  left: calc(100% / 3);
}

.slider.cz {
  left: calc(2 * (100% / 3) - 3px);
}
</style>
