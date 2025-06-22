<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue';
import DefaultButton from '@/components/common/DefaultButton.vue';
import { useShaking } from '@/composables/common/useShaking';
import { useHelpModal } from '@/composables/modals/useHelpModal';
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { locale, messages } = useI18n()


const sections = computed(() => messages.value[locale.value]?.help?.sections || [])

const {
  isShaking,
  triggerShake
} = useShaking();

const {
  atTop,
  atBottom,
  scrollUp,
  scrollDown,
  checkScroll,
  isVisible,
  messagesRef,
  closeHelpModal
} = useHelpModal();

</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="help-modal-overlay" @click.self="triggerShake">
      <div class="modal-box" :class="{ shake: isShaking }">
        <div class="title-wrapper">
          <BaseIcon name="IconQuestionMark" size="28" color="var(--text-c)" />
          <p>{{ $t('help.title') }}</p>
        </div>

        <div class="messages-panel">
          <div v-if="!atTop" class="arrow-up" @click="scrollUp">
            <BaseIcon name="IconArrowUp" size="24" color="var(--primary-c)" />
          </div>

          <div class="messages-wrapper" ref="messagesRef" @scroll="checkScroll">
            <div
              v-for="(section, index) in sections"
              :key="index"
              class="message-wrapper"
              >
              <p v-if="section.title">{{ section.title }}</p>
              <p>{{ section.text }}</p>
            </div>
          </div>

          <div v-if="!atBottom" class="arrow-down" @click="scrollDown">
            <BaseIcon name="IconArrowDown" size="24" color="var(--primary-c)" />
          </div>
        </div>

        <div class="button-wrapper">
          <DefaultButton
            :text="$t('help.button.text')"
            @click="closeHelpModal"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.help-modal-overlay {
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
  width: 700px;
  height: 90vh;
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
}

.title-wrapper p {
  font-size: var(--title-font-size);
  font-weight: var(--title-font-weight);
}

.messages-panel{
  position: relative;
  flex: 1;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 30px 0;
}

.messages-wrapper {
  position: relative;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 10px;
  scrollbar-width: none;
  mask-image: linear-gradient(
    to bottom,
    transparent,
    black 30px,
    black calc(100% - 30px),
    transparent 100%
  );
}

.arrow-up,
.arrow-down {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.arrow-up {
  top: 0;
}
.arrow-down {
  bottom: 0;
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
}

</style>
