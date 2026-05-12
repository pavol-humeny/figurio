<script setup>
/**
 * @file: SupportModal.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Modal shown after exporting images, asking user for support (Buy me a coffee style).
 */

import { useSupportModal } from '@/composables/modals/useSupportModal'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import DefaultButton from '@/components/common/DefaultButton.vue'
import { useShaking } from '@/composables/common/useShaking'
import { useUiStore } from '@/stores/uiStore'
import { useEditorStore } from '@/stores/editorStore'
import { globalConfig } from '@/config/globalConfig'

/**
 * Shake animation logic
 */
const { isShaking, triggerShake } = useShaking()

/**
 * Modal state
 */
const {
  isVisible,
  closeSupportModal,
  openDonationLink
} = useSupportModal(useUiStore(), useEditorStore())

/**
 * Compute the number of exported images to show in the modal
 * @returns {number} Number of exported images
 */
const getNumberOfExports = () => {
  const currentCount = parseInt(localStorage.getItem(`${globalConfig.LOCAL_STORAGE_PREFIX}numberOfExports`) || '0', 10)

  return currentCount
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="support-modal-overlay modal-overlay" @click.self="triggerShake">
      <div class="modal-box" :class="{ shake: isShaking }">

        <!-- Title -->
        <div class="title-wrapper">
          <BaseIcon name="IconCoffee" size="28" />
          <p>Ďakujeme!</p>
        </div>

        <!-- Message -->
        <p class="subtitle">
          Už si exportoval <strong>{{ getNumberOfExports() }}</strong> obrázkov.
          Ak ti aplikácia pomáha, môžeš ju podporiť malou kávou ☕
        </p>

        <!-- CTA -->
        <div class="button-wrapper">
          <DefaultButton text="Neskôr" @click="closeSupportModal" onlyText />
          <DefaultButton text="Kúpiť kávu" @click="openDonationLink" main />
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.support-modal-overlay {
  z-index: var(--z-index-modal);
  background: var(--background-overlay-modal);
  backdrop-filter: var(--backdrop-filter-modal);
}

.modal-box {
  background: var(--background-c);
  border: var(--border-modal);
  padding: 22px 26px;
  border-radius: 20px;
  width: 420px;
  box-shadow: var(--box-shadow-ui);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* Title */
.title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-wrapper p {
  font-size: var(--title-font-size);
  font-weight: var(--title-font-weight);
  color: var(--primary-c);
}

/* Subtitle */
.subtitle {
  font-size: var(--text-font-size);
  color: var(--text-secondary-c);
  text-align: center;
  line-height: 1.4;
}

/* Buttons */
.button-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 8px;
}
</style>
