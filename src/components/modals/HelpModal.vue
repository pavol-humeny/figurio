<script setup>
import { storeToRefs } from 'pinia';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import DefaultButton from '@/components/common/DefaultButton.vue';
import { useShaking } from '@/composables/common/useShaking';
import { useHelpModal } from '@/composables/modals/useHelpModal';
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/uiStore';
import { useRouter } from 'vue-router';
import { useImageStore } from '@/stores/imageStore';
import { useInteractiveTutorial } from '@/composables/tutorial/useInteractiveTutorial';
import { globalConfig } from '@/config/globalConfig';

const { messages, locale, t } = useI18n()

const uiStore = useUiStore()
const { tutorialStep, tutorialCompleted } = storeToRefs(uiStore)

/**
 * List of shortcuts as array of objects
 */
const keyboardShortcuts = computed(() => {
  return messages.value[locale.value]?.help?.helpContent?.shortcuts?.shortcutsList || []
})

/**
 * List of technical limitations as array
 */
const technicalLimitations = computed(() => {
  return messages.value[locale.value]?.help?.helpContent?.technicalLimitations?.limitations || []
})

/**
 * Logic of the shake animation for modal
 */
const {
  isShaking,
  triggerShake
} = useShaking();

/**
 * Logic of the help modal state and scrolling
 */
const {
  atTop,
  atBottom,
  scrollUp,
  scrollDown,
  checkScroll,
  isVisible,
  helpContentRef,
  closeHelpModal,
  startInteractiveTutorial,
  continueInteractiveTutorial,
} = useHelpModal(useUiStore(), useImageStore(), useRouter(), t);

const { isTutorialEnabled } = useInteractiveTutorial(
  useUiStore(),
  useImageStore(),
  useRouter(),
  t
)
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="help-modal-overlay" @click.self="triggerShake">
      <div class="modal-box" :class="{ shake: isShaking }">
        <div class="title-wrapper">
          <BaseIcon name="IconQuestionMark" size="22" color="var(--secondary-c)" class="help-question-mark" />
          <p>{{ $t('help.title') }}</p>
        </div>

        <div class="help-content-panel">
          <!-- Arrow up -->
          <div v-if="!atTop" class="arrow-up" @click="scrollUp">
            <BaseIcon name="IconArrowUp" size="24" color="var(--primary-c)" />
          </div>

          <!-- Help content -->
          <div class="help-content-wrapper" ref="helpContentRef" @scroll="checkScroll">
            <!-- Purpose -->
            <div class="help-content">
              <p class="help-content-title">
                {{ $t('help.helpContent.purpose.title') }}
              </p>
              <ul class="dot-paragraph">
                <li>
                  {{ $t('help.helpContent.purpose.text') }}
                </li>
              </ul>
            </div>

            <!-- Tools -->
            <div class="help-content">
              <p class="help-content-title">
                {{ $t('help.helpContent.tools.title') }}
              </p>
              <!-- Move -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.move.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.move.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.move.tip') }}
                  </li>
                </ul>
              </div>
              <!-- Transform - Rotate -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.transform.subTools.rotate.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.transform.subTools.rotate.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.transform.subTools.rotate.tip') }}
                  </li>
                </ul>
              </div>
              <!-- Transform - Flip -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.transform.subTools.flip.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.transform.subTools.flip.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.transform.subTools.flip.tip') }}
                  </li>
                </ul>
              </div>
              <!-- Transform - Crop -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.transform.subTools.crop.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.transform.subTools.crop.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.transform.subTools.crop.tip') }}
                  </li>
                </ul>
              </div>
              <!-- Transform - Resize -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.transform.subTools.resize.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.transform.subTools.resize.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.transform.subTools.resize.tip') }}
                  </li>
                </ul>
              </div>
              <!-- SmartCrop -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.smartCrop.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.smartCrop.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.smartCrop.tip') }}
                  </li>
                </ul>
              </div>
              <!-- GrayScale -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.grayscale.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.grayscale.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.grayscale.tip') }}
                  </li>
                </ul>
              </div>
              <!-- Frame -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.frame.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.frame.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.frame.tip') }}
                  </li>
                </ul>
              </div>
              <!-- Preset - My presets -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.preset.subTools.myPresets.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.preset.subTools.myPresets.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.preset.subTools.myPresets.tip') }}
                  </li>
                </ul>
              </div>
              <!-- Preset - Create Preset -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.preset.subTools.createPreset.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.preset.subTools.createPreset.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.preset.subTools.createPreset.tip') }}
                  </li>
                </ul>
              </div>
              <!-- Export -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.export.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.export.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.export.tip') }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Other shortcuts -->
            <div class="help-content">
              <p class="help-content-title">
                {{ $t('help.helpContent.shortcuts.title') }}
              </p>
              <ul class="dot-paragraph">
                <li>
                  {{ $t('help.helpContent.shortcuts.text') }}
                </li>
              </ul>
              <br>
              <div v-for="(item, index) in keyboardShortcuts" :key="index" class="shortcuts-description">
                <ul class="description dot-paragraph">
                  <li>{{ item.description }}</li>
                </ul>
                <p class="shortcut">{{ item.shortcut }}</p>
              </div>
            </div>

            <!-- Tutorial -->
            <div class="help-content">
              <div class="tutorial-title-wrapper">
                <BaseIcon v-if="tutorialCompleted" class="tutorial-completed-icon" name="IconTick" size="20"
                  :tip='$t("help.helpContent.tutorial.tutorialCompletedTip")' position="top-right" />
                <p class="help-content-title" style="margin-bottom: 0;">
                  {{ $t('help.helpContent.tutorial.title') }}
                </p>
              </div>
              <ul class="dot-paragraph">
                <li>
                  {{ $t('help.helpContent.tutorial.text') }}
                </li>
              </ul>
              <div class="tutorial-button">
                <DefaultButton :disabled="!isTutorialEnabled" :text="$t('help.startTutorialButton.text')"
                  @click="startInteractiveTutorial()"
                  :tip="!isTutorialEnabled ? globalConfig.featureFlags.notEnabledMessage : ''" />
                <DefaultButton :disabled="!isTutorialEnabled" :text="$t('help.continueTutorialButton.text')"
                  @click="continueInteractiveTutorial()" v-if="!tutorialCompleted && tutorialStep !== 0"
                  :tip="!isTutorialEnabled ? globalConfig.featureFlags.notEnabledMessage : ''" />
              </div>
            </div>

            <!-- Technical limitations -->
            <div class="help-content">
              <p class="help-content-title">Technical Limitations</p>
              <ul class="dot-paragraph">
                <li v-for="(item, index) in technicalLimitations" :key="index">
                  {{ item }}
                </li>
              </ul>
            </div>

            <!-- Contact and feedback -->
            <div class="help-content">
              <p class="help-content-title" @click="sendFeedback">
                {{ $t('help.helpContent.contactAndFeedback.title') }}
              </p>

              <ul class="dot-paragraph">
                <li>
                  {{ $t('help.helpContent.contactAndFeedback.text') }}
                  <a href="mailto:xhumenp00@stud.fit.vut.cz" class="action-text">xhumenp00@stud.fit.vut.cz</a>.
                </li>
              </ul>

            </div>
          </div>

          <!-- Arrow down -->
          <div v-if="!atBottom" class="arrow-down" @click="scrollDown">
            <BaseIcon name="IconArrowDown" size="24" color="var(--primary-c)" />
          </div>
        </div>

        <!-- Close help -->
        <div class="button-wrapper">
          <DefaultButton :text="$t('help.closeButton.text')" @click="closeHelpModal" />
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
  padding: 25px 30px;
  border-radius: 20px;
  width: 700px;
  height: 90vh;
  box-shadow: var(--box-shadow-ui);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.help-question-mark {
  background: var(--text-c);
  border-radius: 50%;
  padding: 3px;
}

.title-wrapper {
  width: 100%;
  display: flex;
  justify-content: left;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.title-wrapper p {
  font-size: var(--title-font-size);
  font-weight: var(--title-font-weight);
}

.help-content-panel {
  position: relative;
  flex: 1;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 10px 0;
}

.help-content-wrapper {
  position: relative;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 25px 10px;
  scrollbar-width: none;
  mask-image: linear-gradient(to bottom,
      transparent,
      black 30px,
      black calc(100% - 30px),
      transparent 100%);
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

.help-content-title {
  font-size: var(--help-subtitle-font-size);
  font-weight: var(--help-subtitle-font-weight);
  margin-bottom: 10px;
  color: var(--primary-c);
}

.action-text {
  color: var(--primary-c);
  text-decoration: none;
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

.tutorial-title-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.tutorial-completed-icon {
  background: var(--primary-c);
  border-radius: 50%;
  padding: 3px;
}

.tutorial-button {
  width: 100%;
  padding-top: 10px;
  display: flex;
  gap: 10px;
  flex-direction: row;
}

.tool-description {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 5px 0;
}

.shortcuts-description {
  display: flex;
  flex-direction: row;
  gap: 5px;
  padding: 5px 0;
}

.tool-description>div {
  display: flex;
  align-items: center;
  gap: 15px;
}

.tool-description .title {
  font-size: var(--subtitle-font-size);
  font-weight: var(--subtitle-font-weight);
}

.tool-description .shortcut,
.shortcuts-description .shortcut {
  background-color: var(--border-c);
  border: var(--border-ui);
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
  font-family: monospace;
}

.tool-description .shortcut:hover,
.shortcuts-description .shortcut:hover {
  background-color: var(--primary-c);
  color: var(--secondary-c);
  cursor: pointer;
}

.tool-description .description {
  font-size: var(--text-font-size);
  color: var(--text-c);
}

.dot-paragraph {
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;
}

.dot-paragraph li {
  color: var(--text-c);
  font-size: var(--text-font-size);
  line-height: 1.3;
}
</style>
