<script setup>
/**
 * @file: HomeView.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Home page of the application. This component serves as the landing page for users when they open the application. It provides an introduction to the app, highlights key features, and includes a drag-and-drop area for users to start working with their images immediately. The component also integrates various modals and panels, such as the help modal, settings panel, and feature tour modal.
 */
import { onMounted, onUnmounted, ref } from 'vue';
import { globalConfig } from '@/config/globalConfig.js';
import DragAndDropArea from '@/components/editor/DragAndDropArea.vue';
import { useKeyboardShortcuts } from '@/composables/editor/useKeyboardShortcuts';
import { useUiStore } from '@/stores/uiStore';
import { useImageStore } from '@/stores/imageStore';
import { useUploadFileButton } from '@/composables/topPanel/useUploadFileButton';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'
import { useHelpModal } from '@/composables/modals/useHelpModal';
import { useSettingsPanel } from '@/composables/topPanel/useSettingsPanel';
import { useInteractiveTutorial } from '@/composables/tutorial/useInteractiveTutorial';
import DefaultButton from '@/components/common/DefaultButton.vue';
import { useDragAndDropArea } from '@/composables/editor/useDragAndDropArea';
import { useEditorStore } from '@/stores/editorStore';
import { useFeatureTourModal } from '@/composables/modals/useFeatureTourModal';
import { usePrivacyAndDataModal } from '@/composables/modals/usePrivacyAndDataModal';
import { useReleaseModal } from '@/composables/modals/useReleaseModal';
import { useUserModeStore } from '@/stores/userModeStore';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import ChristmasTree from '@/components/randomEvents/ChristmasTree.vue';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useViewportStore } from '@/stores/viewportStore';
import { computed } from 'vue'
import crop from '@/assets/videos/crop.mp4'
import frame from '@/assets/videos/frame.mp4'
import blurArea from '@/assets/videos/blurArea.mp4'

const { t, tm, locale, messages } = useI18n()
const router = useRouter()
const userModeStore = useUserModeStore()
const editorStore = useEditorStore()

const { uploadFile } = useUploadFileButton(useImageStore(), t, useRouter(), useUserModeStore(), useWorkspaceStore(), useUiStore(), useViewportStore(), useHistoryStore(), useEditorStore())
const { openHelpModal } = useHelpModal(useUiStore(), useImageStore(), useEditorStore(), useUserModeStore(), t)
const { openSettingsPanel } = useSettingsPanel(useUiStore())
const { prevStep, nextStep, finishTutorial, closeTutorial } = useInteractiveTutorial(useUiStore(), useImageStore(), t)
const { closeHelpModal } = useHelpModal(useUiStore(), useImageStore(), useEditorStore(), useUserModeStore(), t)
const { closeSettingsPanel } = useSettingsPanel(useUiStore())
const { closePrivacyAndDataModal } = usePrivacyAndDataModal(t)
const { closeFeatureTourModal } = useFeatureTourModal()
const { closeReleaseModal } = useReleaseModal()

/**
 * Set up global keyboard shortcuts for the home page.
 */
useKeyboardShortcuts({
  uploadFile,
  openHelpModal,
  openSettingsPanel,
  prevStep,
  nextStep,
  finishTutorial,
  closeTutorial,
  closeHelpModal,
  closeSettingsPanel,
  closePrivacyAndDataModal,
  closeFeatureTourModal,
  closeReleaseModal,
}, useUiStore(), useEditorStore());

/**
 * Logic of the drag-and-drop area
 */
const {
  handleDrop,
  selectFile
} = useDragAndDropArea(useImageStore(), useEditorStore(), t, router, useUserModeStore(), useWorkspaceStore(), useUiStore(), useViewportStore(), useHistoryStore())

/**
 * Logic for opening the feature tour modal
 */
const {
  openFeatureTourModal
} = useFeatureTourModal();

/**
 * Computed property to get the list of features to display on the home page based on the current locale
 */
const features = computed(() => {
  return messages.value[locale.value]?.home?.features || [];
})

/**
 * On mounted, check seen feature tour slides and open modal
 */
onMounted(() => {
  // Open feature tour modal on start if enabled in global config
  if (globalConfig.modalSettings.showFeatureTourModalOnStart) {
    const seen = JSON.parse(localStorage.getItem(`${globalConfig.LOCAL_STORAGE_PREFIX}seenFeatureTour`) || '[]')

    openFeatureTourModal(true, seen)
  }

  // SCROLL REVEAL
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.15 })

  document.querySelectorAll('.reveal').forEach(el => {
    // Skip hero section
    if (!el.classList.contains('hero-section')) {
      observer.observe(el)
    }
  })

  updateSize()
  window.addEventListener('resize', updateSize)
})

/**
 * Logo size based on width
 */
const logoSize = ref(60)

/**
 * Get logo size for current window width, ensuring it stays within a reasonable range
 */
const updateSize = () => {
  const vw = window.innerWidth
  logoSize.value = Math.min(Math.max(40, vw * 0.05), 90)
}
/**
 * Cleanup event listener on unmount
 */
onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
})
</script>

<template>
  <div class="home-view" @drop.stop="handleDrop" @dragover.prevent @dragleave.prevent>

    <div class="hero-section reveal">
      <div class="left-side">
        <div class="app-name">
          <div class="logo-wrapper">
            <BaseIcon name="IconLogo" class="logo" :size="logoSize" color="var(--primary-c)" />

            <p class="logo-letter">F</p>

            <BaseIcon v-if="userModeStore.isExpertMode" class="user-mode-icon" name="IconStar" size="25"
              color="var(--gold-c)" />
            <BaseIcon v-if="userModeStore.isAdminMode" class="user-mode-icon" name="IconCrown" size="25"
              color="var(--gold-c)" />
          </div>
          <h2><span class="highlight-e">{{ $t('home.appNameHighlight') }}</span>{{ $t('home.appNameBasic') }}
          </h2>
        </div>
        <h1 class="title">
          {{ $t('home.title') }}
        </h1>
        <p class="text">
          <b>{{ $t('home.appName') }}</b> {{ $t('home.text') }}
        </p>
        <p class="text" style="margin-bottom: 30px;">
          {{ $t('home.text2') }}
        </p>

        <div class="feature" v-for="feature in features" :key="feature.name">
          <p class="feature-title">{{ feature.name }}</p>
          <p class="feature-description">{{ feature.description }}</p>
        </div>

        <DefaultButton @click="selectFile" :text="$t('dragAndDropArea.button.text')"
          :style="{ 'user-select': 'none', 'padding-top': '30px' }" />
      </div>
      <div class="right-side">
        <DragAndDropArea v-if="!editorStore.randomEvents.christmasTree" isHomePage />
        <ChristmasTree v-else />
      </div>
    </div>

    <div class="key-features section">
      <h2 class="section-title">{{ $t('home.keyFeatures.title') }}</h2>

      <div class="cards">
        <div class="card-wrapper reveal">
          <div class="card">
            <BaseIcon name="IconKeyFeaturePrivacy" size="170" color="var(--primary-c)" />

            <h3>{{ $t('home.keyFeatures.privacy.title') }}</h3>
            <p>
              {{ $t('home.keyFeatures.privacy.description') }}
            </p>
          </div>
        </div>

        <div class="card-wrapper reveal">

          <div class="card">
            <BaseIcon name="IconKeyFeaturePdf" size="170" color="var(--primary-c)" />

            <h3>{{ $t('home.keyFeatures.pdf.title') }}</h3>
            <p>
              {{ $t('home.keyFeatures.pdf.description') }}
            </p>
          </div>
        </div>

        <div class="card-wrapper reveal">

          <div class="card">
            <BaseIcon name="IconKeyFeatureTools" size="170" color="var(--primary-c)" />

            <h3>{{ $t('home.keyFeatures.tools.title') }}</h3>
            <p>
              {{ $t('home.keyFeatures.tools.description') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="most-used-tools section">
      <h2 class="section-title">{{ t('home.mostUsedTools.title') }}</h2>

      <!-- TOOL 1 - CROP -->
      <div class="tool-content reveal">
        <div class="tool-video">
          <div class="video-wrapper">
            <video autoplay muted loop playsinline>
              <source :src="crop" type="video/mp4" />
            </video>
          </div>
        </div>

        <div class="tool-info">
          <div class="tool-header">
            <BaseIcon name="IconCropTool" size="36" color="var(--primary-c)" />
            <h2>{{ t('home.mostUsedTools.crop.title') }}</h2>
          </div>

          <p class="tool-description">
            {{ t('home.mostUsedTools.crop.description') }}
          </p>

          <div class="tool-points">
            <div class="point" v-for="(point, i) in tm('home.mostUsedTools.crop.points', {}, { returnObjects: true })"
              :key="i">
              <div class="point-content reveal">
                <BaseIcon name="IconCheck" size="18" color="var(--text-c)" />
                <div>
                  <b>{{ point.title }}</b>
                  <p>{{ point.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TOOL 2 - BLUR -->
      <div class="tool-content reverse reveal">
        <div class="tool-video">
          <div class="video-wrapper">
            <video autoplay muted loop playsinline>
              <source :src="blurArea" type="video/mp4" />
            </video>
          </div>
        </div>

        <div class="tool-info">
          <div class="tool-header">
            <BaseIcon name="IconBlurTool" size="36" color="var(--primary-c)" />
            <h2>{{ t('home.mostUsedTools.blur.title') }}</h2>
          </div>

          <p class="tool-description">
            {{ t('home.mostUsedTools.blur.description') }}
          </p>

          <div class="tool-points">
            <div class="point" v-for="(point, i) in tm('home.mostUsedTools.blur.points', {}, { returnObjects: true })"
              :key="i">
              <div class="point-content reveal">
                <BaseIcon name="IconCheck" size="18" color="var(--text-c)" />
                <div>
                  <b>{{ point.title }}</b>
                  <p>{{ point.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TOOL 3 - FRAME -->
      <div class="tool-content reveal">
        <div class="tool-video">
          <div class="video-wrapper">
            <video autoplay muted loop playsinline>
              <source :src="frame" type="video/mp4" />
            </video>
          </div>
        </div>

        <div class="tool-info">
          <div class="tool-header">
            <BaseIcon name="IconFrameTool" size="36" color="var(--primary-c)" />
            <h2>{{ t('home.mostUsedTools.frame.title') }}</h2>
          </div>

          <p class="tool-description">
            {{ t('home.mostUsedTools.frame.description') }}
          </p>

          <div class="tool-points">
            <div class="point" v-for="(point, i) in tm('home.mostUsedTools.frame.points', {}, { returnObjects: true })"
              :key="i">
              <div class="point-content reveal">
                <BaseIcon name="IconCheck" size="18" color="var(--text-c)" />
                <div>
                  <b>{{ point.title }}</b>
                  <p>{{ point.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-content">

      <p class="footer-text">
        {{ t('home.footer.text') }}
      </p>

      <a class="footer-link" href="https://www.stud.fit.vutbr.cz/~xhumenp00/figurio/" target="_blank"
        rel="noopener noreferrer">
        {{ t('home.footer.projectPage') }}
      </a>

    </div>
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-width: var(--min-window-width);
  background: var(--background-c);
  user-select: text;
  padding: 0 14vw;
}

@media (max-width: 1224px) {
  .home-view {
    padding: 0 calc(var(--min-window-width) / 10);
  }
}

.hero-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 5%;
  height: calc(100vh - 70px);
  min-height: var(--min-window-height);
}

.left-side {
  flex: 1;
  height: 60%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 20px;
  z-index: var(--z-index-home-page-content);
}

.app-name {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: calc(var(--landing-page-logo-size) / 4);
}

.logo-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.logo-letter {
  position: absolute;
  top: 50%;
  left: 45%;
  transform: translate(-50%, -50%);
  font-family: var(--font-family-rc);
  font-size: var(--landing-page-logo-letter-size);
  opacity: 0.8;
}

.user-mode-icon {
  position: absolute;
  top: -6px;
  left: -4px;
  filter: drop-shadow(var(--box-shadow-hover));
}

.app-name .logo-wrapper img {
  height: var(--landing-page-logo-size);
  transition: var(--default-transition);
}

.app-name h2 {
  font-size: var(--landing-page-app-name-font-size);
  font-weight: var(--landing-page-app-name-font-weight);
  color: var(--text-c);
}

.app-name .highlight-e {
  color: var(--primary-c);
  font-size: calc(var(--landing-page-app-name-font-size) * 1.4);
  font-weight: var(--landing-page-app-name-font-weight);
  font-family: var(--font-family-rc);
  margin-right: -3px;
}

.title {
  font-size: var(--landing-page-title-font-size);
  font-weight: var(--landing-page-title-font-weight);
  color: var(--text-c);
  margin: 20px 0 30px 0;
}

.text {
  font-size: var(--landing-page-text-font-size);
  font-weight: var(--landing-page-text-font-weight);
  color: var(--text-c);
  margin: 0 0 10px 0;
  padding-right: 15px;
}

.right-side {
  flex: 1;
  height: 60%;
  display: flex;
  flex-direction: column;
  z-index: var(--z-index-home-page-content);
}

.section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 80px 0;
}

.section-title {
  font-size: var(--landing-page-section-title-font-size);
  font-weight: var(--landing-page-section-title-font-weight);
  color: var(--text-c);
  margin-bottom: 70px;
}

.cards {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  gap: 45px;
  align-items: stretch;
}


@media (max-width: 1224px) {
  .cards {
    gap: 45px;
  }
}

.card-wrapper {
  flex: 1;
  display: flex;
}

.card {
  max-width: 350px;
  flex: 1;
  background: var(--secondary-c);
  border-radius: 20px;
  padding: 35px 30px;

  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.045);
  transition: 0.2s ease;

  flex: 1;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
}

.card h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: var(--landing-page-section-subtitle-font-size);
  font-weight: var(--landing-page-section-subtitle-font-weight);
  color: var(--text-c);
}

.card p {
  font-size: var(--landing-page-section-text-font-size);
  font-weight: var(--landing-page-section-text-font-weight);
  color: var(--text-secondary-c);
  line-height: 1.6;
}

/* TOOL BLOCK */
.tool-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 100px;
  gap: 60px;
}

.tool-content.reverse {
  flex-direction: row-reverse;
}

/* VIDEO */
.tool-video {
  flex: 3;
}

.video-wrapper {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.05);
  transition: 0.2s ease;
  border: solid 3px var(--secondary-c);
}

.video-wrapper:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.video-wrapper video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* INFO */
.tool-info {
  flex: 2;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  color: var(--primary-c);
}

.tool-header h2 {
  font-size: var(--landing-page-section-subtitle2-font-size);
  font-weight: var(--landing-page-section-subtitle2-font-weight);
}

.tool-description {
  color: var(--text-c);
  margin-bottom: 25px;
  font-size: var(--landing-page-section-text-font-size);
  font-weight: var(--landing-page-section-text-font-weight);
}

/* POINTS */
.tool-points {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.point {
  transition: 0.2s ease;
}

.point-content {
  border-radius: 10px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.05);
  background: var(--secondary-c);
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
}

.point:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.point p {
  font-size: calc(var(--landing-page-section-text-font-size) * 0.95);
  font-weight: var(--landing-page-section-text-font-weight);
  color: var(--text-secondary-c);
  margin: 2px 0 0;
}

.point b {
  font-size: var(--landing-page-section-text-font-size);
  font-weight: calc(var(--landing-page-section-text-font-weight) + 200);
  color: var(--text-secondary-c);
  margin: 2px 0 0;
}

.feature {
  display: flex;
  gap: 10px;
  flex-direction: row;
  padding: 2px 0px;
}

.feature-title {
  font-size: var(--text-font-size);
  color: var(--primary-c);
}

.feature-description {
  font-size: var(--text-font-size);
  font-weight: var(--text-font-weight);
  color: var(--text-c);
}

.footer {
  width: 100%;
  padding: 30px 0;
  background: var(--background-c);
  border-top: 1px solid var(--secondary-c);
  display: flex;
  justify-content: center;
}

.footer-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.footer-text {
  font-size: var(--landing-page-section-text-font-size);
  color: var(--text-secondary-c);
  text-align: center;
}

.footer-link {
  font-size: var(--landing-page-section-text-font-size);
  color: var(--primary-c);
  text-decoration: none;
  transition: 0.2s;
}

.footer-link:hover {
  text-decoration: underline;
}

/* REVEAL */
.reveal {
  opacity: 0;
  transform: translateY(20px);
  filter: blur(6px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease,
    filter 0.6s ease;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

.hero-section {
  opacity: 1 !important;
  transform: none !important;
  filter: none !important;
}
</style>
