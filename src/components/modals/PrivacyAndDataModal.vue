<script setup>
/**
 * @file: PrivacyAndDataModal.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { usePrivacyAndDataModal } from '@/composables/modals/usePrivacyAndDataModal';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import DefaultButton from '@/components/common/DefaultButton.vue';

import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { locale, messages, t } = useI18n()

/**
 * Computed privacy sections from i18n messages
 */
const sections = computed(() => messages.value[locale.value]?.privacy?.sections || [])


/**
 * Logic of the privacy and data modal state
 */
const {
  isVisible,
  clearLocalStorage,
  closePrivacyAndDataModal
} = usePrivacyAndDataModal(t);
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="privacy-modal-overlay modal-overlay" @mousedown.self="closePrivacyAndDataModal">
      <div class="modal-box">
        <div class="title-wrapper">
          <BaseIcon name="IconPrivacy" size="28" color="var(--primary-c)" />
          <p>{{ $t('privacy.title') }}</p>
        </div>

        <div class="messages-wrapper">
          <div v-for="(section, index) in sections" :key="index" class="message-wrapper">
            <p v-if="section.title">{{ section.title }}</p>
            <p>{{ section.text }}</p>
            <DefaultButton :text="section.action.text" @click="clearLocalStorage" v-if="section.action"
              style="margin-top: 5px;" />
          </div>
        </div>

        <div class="button-wrapper">
          <DefaultButton :text="$t('privacy.button.text')" @click="closePrivacyAndDataModal" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.privacy-modal-overlay {
  z-index: var(--z-index-privacy);
  background: var(--background-overlay-modal);
  backdrop-filter: var(--backdrop-filter-modal);
}

.modal-box {
  background: var(--background-c);
  border: var(--border-modal);
  padding: 20px 25px;
  border-radius: 20px;
  width: 600px;
  box-shadow: var(--box-shadow-ui);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.title-wrapper {
  width: 100%;
  display: flex;
  justify-content: left;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.title-wrapper p {
  font-size: var(--title-font-size);
  font-weight: var(--title-font-weight);
  color: var(--primary-c);
}

.messages-wrapper {
  width: 100%;
  display: flex;
  justify-content: left;
  flex-direction: column;
  gap: 15px;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.message-wrapper p:first-child {
  font-weight: var(--subtitle-font-weight);
  font-size: var(--subtitle-font-size);
  color: var(--text-c);
}

.message-wrapper p:last-child {
  font-size: var(--text-font-size);
  color: var(--text-secondary-c);
}

.message-wrapper p.action-text {
  color: var(--primary-c);
  cursor: pointer;
}

.action-text:hover {
  text-decoration: underline;
}

.button-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
}
</style>
