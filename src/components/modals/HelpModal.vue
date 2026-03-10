<script setup>
import { storeToRefs } from 'pinia';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import DefaultButton from '@/components/common/DefaultButton.vue';
import { useHelpModal } from '@/composables/modals/useHelpModal';
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/uiStore';
import { useRouter } from 'vue-router';
import { useImageStore } from '@/stores/imageStore';
import { useInteractiveTutorial } from '@/composables/tutorial/useInteractiveTutorial';
import { globalConfig } from '@/config/globalConfig';
import { useApi } from '../../composables/common/useApi';
import { useEditorStore } from '@/stores/editorStore';
import { useUserModeStore } from '@/stores/userModeStore';
import CommandLine from './CommandLine.vue';

const { messages, locale, t } = useI18n()
const router = useRouter()
const { addUserEvent } = useApi()

const uiStore = useUiStore()
const imageStore = useImageStore()
const userModeStore = useUserModeStore()
const { tutorialStep, tutorialCompleted } = storeToRefs(uiStore)

/**
 * List of shortcuts as array of objects
 */
const keyboardShortcuts = computed(() => {
  return (
    messages.value[locale.value]?.help?.helpContent?.shortcuts?.categories || []
  )
})

/**
 * List of technical limitations as array
 */
const technicalLimitations = computed(() => {
  return messages.value[locale.value]?.help?.helpContent?.technicalLimitations?.limitations || []
})

/**
 * List of testers to acknowledge as array
 */
const testers = computed(() => {
  return messages.value[locale.value]?.help?.helpContent?.acknowledgements?.testers || []
})

/**
 * List of points about the purpose of Figurio as array
 */
const aboutPoints = computed(() => {
  return messages.value[locale.value]?.help?.helpContent?.purpose?.points || []
})

/**
 * Logic of the help modal state and scrolling
 */
const {
  isVisible,
  helpContentRef,
  closeHelpModal,
  startInteractiveTutorial,
  continueInteractiveTutorial,
  openFeatureTourModalHelper,
  contactForm,
  submitContactForm,
  subjectInputWrong,
  subjectInputSuccess,
  isCommandEmail,
  passwordInputWrong,
  togglePasswordVisibility,
  showPassword,
  emailInputWrong,
  nameInputWrong,
  messageInputWrong,
} = useHelpModal(useUiStore(), useImageStore(), useEditorStore(), useUserModeStore(), useRouter(), t);

const { isTutorialEnabled } = useInteractiveTutorial(
  useUiStore(),
  useImageStore(),
  useRouter(),
  t
)

/**
 * Navigates to the statistics view
 */
const showStatistics = () => {
  // Open statistics view in a new tab
  const url = router.resolve({ name: 'statistics' }).href
  window.open(url, '_blank')

  addUserEvent('openModal', { modal: 'statistics' })
}
</script>

<template>
  <Teleport to="body">
    <div v-show="isVisible" class="help-modal-overlay modal-overlay" @mousedown.self="closeHelpModal">
      <div class="modal-box">
        <div class="title-wrapper">
          <BaseIcon name="IconQuestionMark" size="22" color="var(--secondary-c)" class="help-question-mark" />
          <p>{{ $t('help.title') }}</p>
        </div>

        <div class="help-content-panel">
          <!-- Help content -->
          <div class="help-content-wrapper" ref="helpContentRef">
            <!-- Purpose -->
            <div class="help-content">
              <p class="help-content-title">
                {{ $t('help.helpContent.purpose.title') }}
              </p>
              <ul class="dot-paragraph">
                <li v-for="(point, index) in aboutPoints" :key="index">
                  {{ point }}
                </li>
              </ul>
            </div>

            <!-- Tools -->
            <div class="help-content">
              <p class="help-content-title">
                {{ $t('help.helpContent.tools.title') }}
              </p>
              <!-- Image analysis -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.imageAnalysis.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.imageAnalysis.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.imageAnalysis.tip') }}
                  </li>
                </ul>
              </div>
              <!-- Crop -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.crop.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.crop.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.crop.tip') }}
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
              <!-- BackgroundRemoval -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.backgroundRemoval.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.backgroundRemoval.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.backgroundRemoval.tip') }}
                  </li>
                </ul>
              </div>
              <!-- Brush -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.brush.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.brush.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.brush.tip') }}
                  </li>
                </ul>
              </div>
              <!-- Eraser -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.brush.subTools.pencil.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.brush.subTools.pencil.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.brush.subTools.pencil.tip') }}
                  </li>
                </ul>
              </div>
              <!-- Select -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.select.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.select.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.select.tip') }}
                  </li>
                </ul>
              </div>
              <!-- Shape -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.shape.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.shape.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.shape.tip') }}
                  </li>
                </ul>
              </div>
              <!-- Text -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.text.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.text.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.text.tip') }}
                  </li>
                </ul>
              </div>
              <!-- Blur -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.blur.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.blur.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.blur.tip') }}
                  </li>
                </ul>
              </div>
              <!-- Magnify area -->
              <div class="tool-description">
                <div>
                  <p class="title">
                    {{ $t('tools.magnifyArea.label') }}
                  </p>
                  <p class="shortcut">
                    {{ $t('tools.magnifyArea.shortcut') }}
                  </p>
                </div>
                <ul class="description dot-paragraph">
                  <li>
                    {{ $t('tools.magnifyArea.tip') }}
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
              <div v-for="(category, cIndex) in keyboardShortcuts" :key="cIndex" class="shortcut-category">
                <h4 class="category-title">{{ category.name }}</h4>

                <div v-for="(item, index) in category.list" :key="index" class="shortcuts-description">
                  <ul class="description dot-paragraph">
                    <li>{{ item.description }}</li>
                  </ul>
                  <p class="shortcut">{{ item.shortcut }}</p>
                </div>
              </div>
            </div>

            <!-- Tutorial -->
            <div class="help-content" v-if="imageStore.isImageLoaded">
              <div class="subtitle-wrapper">
                <p class="help-content-title">
                  {{ $t('help.helpContent.tutorial.title') }}
                </p>
                <BaseIcon v-if="tutorialCompleted" class="tutorial-completed-icon" name="IconTick" size="17"
                  color="var(--background-c)" :tip='$t("help.helpContent.tutorial.tutorialCompletedTip")'
                  position="top-right" />
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

            <!-- Feature Tour -->
            <div class="help-content">
              <div class="subtitle-wrapper">
                <p class="help-content-title">
                  {{ $t('help.helpContent.featureTour.title') }}
                </p>
              </div>
              <ul class="dot-paragraph">
                <li>
                  {{ $t('help.helpContent.featureTour.text') }}
                </li>
              </ul>
              <div class="feature-tour-button">
                <DefaultButton :text="$t('help.helpContent.featureTour.button.text')"
                  @click="openFeatureTourModalHelper()" />
              </div>
            </div>

            <!-- Technical limitations -->
            <div class="help-content">
              <p class="help-content-title">{{ $t('help.helpContent.technicalLimitations.title') }}</p>
              <ul class="dot-paragraph">
                <li v-for="(item, index) in technicalLimitations" :key="index">
                  {{ item }}
                </li>
              </ul>
            </div>

            <!-- Acknowledgements -->
            <div class="help-content" v-if="userModeStore.hasUserAccessToFeature('acknowledgements')">
              <p class="help-content-title">
                {{ $t('help.helpContent.acknowledgements.title') }}
              </p>

              <ul class="dot-paragraph">
                <li>
                  {{ $t('help.helpContent.acknowledgements.text') }}
                </li>
              </ul>

              <div v-if="testers.length" class="acknowledgements-names" style="padding-top: 3px;">
                <ul class="dot-paragraph">
                  <li>
                    {{ $t('help.helpContent.acknowledgements.namedIntro') }}:
                  </li>
                </ul>

                <ul class="dot-paragraph" style="padding-left: 50px;">
                  <li v-for="tester in testers" :key="tester">
                    <strong>{{ tester }}</strong>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Statistics -->
            <div class="help-content" v-if="userModeStore.hasUserAccessToFeature('statistics')">
              <div class="subtitle-wrapper">
                <p class="help-content-title">
                  {{ $t('help.helpContent.statistics.title') }}
                </p>
              </div>
              <ul class="dot-paragraph">
                <li>
                  {{ $t('help.helpContent.statistics.text') }}
                </li>
              </ul>
              <div class="tutorial-button">
                <DefaultButton :disabled="!isTutorialEnabled"
                  :text="$t('help.helpContent.statistics.seeStatisticsButton.text')" @click="showStatistics()" />
              </div>
            </div>

            <!-- Contact and feedback -->
            <div class="help-content">
              <p class="help-content-title" @click="sendFeedback">
                {{ $t('help.helpContent.contactAndFeedback.title') }}
              </p>

              <ul class="dot-paragraph">
                <li>
                  {{ $t('help.helpContent.contactAndFeedback.text') }}
                  <a href="mailto:pavol.humeny@gmail.com" class="action-text" draggable="false" @dragstart.prevent>{{
                    globalConfig.contactMail }}</a>.
                </li>
              </ul>

              <!-- Contact Form -->
              <div v-if="!userModeStore.isExpertOrAdminMode" class="contact-form">
                <div class="contact-name-email">
                  <!-- Name -->
                  <div v-if="!isCommandEmail" class="input-label-wrapper">
                    <label>
                      {{ $t('help.helpContent.contactAndFeedback.contactForm.name') }}
                    </label>
                    <input v-model="contactForm.name" type="text" required maxlength="50"
                      @keydown.enter="submitContactForm"
                      :placeholder="$t('help.helpContent.contactAndFeedback.contactForm.namePlaceholder')"
                      :class="{ 'name-input-wrong': nameInputWrong }" />
                  </div>

                  <!-- Email -->
                  <div class="input-label-wrapper">
                    <label>
                      {{ $t('help.helpContent.contactAndFeedback.contactForm.email') }}
                    </label>
                    <input :class="{ 'email-input-wrong': emailInputWrong }" v-model="contactForm.email" type="email"
                      required maxlength="50" @keydown.enter="submitContactForm"
                      :placeholder="$t('help.helpContent.contactAndFeedback.contactForm.emailPlaceholder1') + '@' + $t('help.helpContent.contactAndFeedback.contactForm.emailPlaceholder2')" />
                  </div>
                </div>

                <!-- Subject -->
                <div class="input-label-wrapper">
                  <label>
                    {{ $t('help.helpContent.contactAndFeedback.contactForm.subject') }}
                  </label>
                  <input
                    :class="{ 'subject-input-wrong': subjectInputWrong, 'subject-input-success': subjectInputSuccess }"
                    v-model="contactForm.subject" type="text" required maxlength="150"
                    @keydown.enter="submitContactForm"
                    :placeholder="$t('help.helpContent.contactAndFeedback.contactForm.subjectPlaceholder')" />
                </div>

                <!-- Message -->
                <div v-if="!isCommandEmail" class="input-label-wrapper">
                  <label>
                    {{ $t('help.helpContent.contactAndFeedback.contactForm.message') }}
                  </label>
                  <textarea v-model="contactForm.message" required maxlength="500" @keydown.enter="submitContactForm"
                    :placeholder="$t('help.helpContent.contactAndFeedback.contactForm.messagePlaceholder')"
                    :class="{ 'message-input-wrong': messageInputWrong }"></textarea>
                </div>

                <!-- Password -->
                <div v-else class="input-label-wrapper">
                  <label>
                    {{ $t('help.helpContent.contactAndFeedback.contactForm.password') }}
                  </label>
                  <div class="password-wrapper">
                    <input :type="showPassword ? 'text' : 'password'"
                      :class="{ 'password-input-wrong': passwordInputWrong }" v-model="contactForm.password" required
                      maxlength="50" @keydown.enter="submitContactForm" />
                    <BaseIcon :name="showPassword ? 'IconEyeOff' : 'IconEye'" size="20" class="password-toggle-icon"
                      color="var(--primary-c)" @click="togglePasswordVisibility" />
                  </div>
                </div>

                <DefaultButton v-if="!isCommandEmail" :text="$t('help.helpContent.contactAndFeedback.contactForm.send')"
                  @click="submitContactForm" />
              </div>
              <div v-else class="command-line-wrapper">
                <CommandLine />
              </div>
            </div>
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
  z-index: var(--z-index-help);
  background: var(--background-overlay-modal);
  backdrop-filter: var(--backdrop-filter-modal);
}

.modal-box {
  background: var(--background-c);
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
  background: var(--primary-c);
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
  color: var(--primary-c);
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
}

.help-content-title {
  font-size: var(--help-subtitle-font-size);
  font-weight: var(--help-subtitle-font-weight);
  margin-bottom: 10px;
  color: var(--primary-c);
}

.subtitle-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
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

.title-wrapper {
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
  /* margin-bottom: 7px; */
  position: relative;
  top: -5px;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tutorial-button,
.feature-tour-button {
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
  text-align: justify;
  padding-right: 10px;
}

.dot-paragraph li {
  color: var(--text-c);
  font-size: var(--text-font-size);
  line-height: 1.3;
}

.category-title {
  font-size: var(--subtitle-font-size);
  font-weight: var(--subtitle-font-weight);
}

/* Contact form */
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.command-line-wrapper {
  margin-top: 20px;
  padding-right: 10px;
}

.contact-name-email {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.input-label-wrapper {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle-icon {
  position: absolute;
  right: 7px;
  cursor: pointer;
  margin-bottom: 2px;
}

.contact-form input,
.contact-form textarea {
  width: 100%;
  padding: var(--input-top-padding) 10px var(--input-top-padding) 10px;
  border-radius: var(--input-border-radius);
  background: var(--secondary-c);
  color: var(--text-c);
  font-size: var(--input-text-size);
  border: solid 1px transparent;
}

.contact-form textarea {
  height: 150px;
  resize: none;
}

.email-input-wrong,
.message-input-wrong,
.name-input-wrong,
.subject-input-wrong {
  border: solid 1px var(--error-c) !important;
}

.subject-input-success {
  background: var(--success-c) !important;
}

.password-input-wrong {
  background: var(--error-c) !important;
}
</style>
