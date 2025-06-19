<script setup>
import { usePrivacyAndDataModal } from '@/composables/modals/usePrivacyAndDataModal';
import BaseIcon from '../icons/BaseIcon.vue';
import DefaultButton from '../common/DefaultButton.vue';

import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useShaking } from '@/composables/common/useShaking';

const { locale, messages, t } = useI18n()

const sections = computed(() => messages.value[locale.value]?.privacy?.sections || [])

const {
  isShaking,
  triggerShake
} = useShaking();

const {
  isVisible,
  clearLocalStorage,
  closePrivacyAndDataModal
} = usePrivacyAndDataModal(t);
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="privacy-modal-overlay" @click.self="triggerShake">
      <div class="modal-box" :class="{ shake: isShaking }">
        <div class="title-wrapper">
          <BaseIcon name="IconPrivacy" size="28" color="var(--text-c)" />
          <p>{{ $t('privacy.title') }}</p>
        </div>

        <div class="messages-wrapper">
          <div
            v-for="(section, index) in sections"
            :key="index"
            class="message-wrapper"
          >
            <p v-if="section.title">{{ section.title }}</p>
            <p>{{ section.text }}</p>
            <p v-if="section.action" class="action-text" @click="clearLocalStorage">{{ section.action.text }}</p>

          </div>
        </div>

        <div class="button-wrapper">
          <DefaultButton
            :text="$t('privacy.button.text')"
            :onClick="closePrivacyAndDataModal"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.privacy-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--overlay-c);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-index-privacy);
}

.modal-box {
  background: var(--secondary-c);
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
}

.messages-wrapper {
  width: 100%;
  display: flex;
  justify-content: left;
  flex-direction: column;
  gap: 15px;
}

.message-wrapper{
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
