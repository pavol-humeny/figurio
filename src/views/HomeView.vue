<script setup>
/**
 * @file: HomeView.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { onMounted } from 'vue';
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
import { computed } from 'vue'
// import FigurioLogoDark from '@/assets/FigurioLogoDark.png'
// import FigurioLogoLight from '@/assets/FigurioLogoLight.png'
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

const { t, messages, locale } = useI18n()
const router = useRouter()
// const uiStore = useUiStore()
const userModeStore = useUserModeStore()
const editorStore = useEditorStore()

const { uploadFile } = useUploadFileButton(useImageStore(), t, useRouter(), useUserModeStore(), useWorkspaceStore(), useUiStore(), useViewportStore(), useHistoryStore(), useEditorStore())
const { openHelpModal } = useHelpModal(useUiStore(), useImageStore(), useEditorStore(), useUserModeStore(), useRouter(), t)
const { openSettingsPanel } = useSettingsPanel(useUiStore())
const { prevStep, nextStep, finishTutorial, closeTutorial } = useInteractiveTutorial(useUiStore(), useImageStore(), useRouter(), t)
const { closeHelpModal } = useHelpModal(useUiStore(), useImageStore(), useEditorStore(), useUserModeStore(), useRouter(), t)
const { closeSettingsPanel } = useSettingsPanel(useUiStore())
const { closePrivacyAndDataModal } = usePrivacyAndDataModal(t)
const { closeFeatureTourModal } = useFeatureTourModal()
const { closeReleaseModal } = useReleaseModal()

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
 * Computes the logo source based on the current theme.
 */
// const logoSrc = computed(() => {
//   return uiStore.theme === 'dark' ? FigurioLogoDark : FigurioLogoLight
// })

const features = computed(() => {
  return messages.value[locale.value]?.home?.features || [];
})

/**
 * Logic of the drag-and-drop area
 */
const {
  handleDrop,
  selectFile
} = useDragAndDropArea(useImageStore(), useEditorStore(), t, router, useUserModeStore(), useWorkspaceStore(), useUiStore(), useViewportStore(), useHistoryStore())

const {
  openFeatureTourModal
} = useFeatureTourModal();

/**
 * On mounted, check seen feature tour slides and open modal
 */
onMounted(() => {
  // Open feature tour modal on start if enabled in global config
  if (globalConfig.modalSettings.showFeatureTourModalOnStart) {
    const seen = JSON.parse(localStorage.getItem(`${globalConfig.LOCAL_STORAGE_PREFIX}seenFeatureTour`) || '[]')

    openFeatureTourModal(true, seen)
  }
})
</script>

<template>
  <div class="home-view" @drop.stop="handleDrop" @dragover.prevent @dragleave.prevent>
    <div class="background"></div>

    <div class="left-side">
      <div class="app-name">
        <div class="logo-wrapper">
          <!-- <img :src="logoSrc" alt="Figurio logo" :style="{ 'user-select': 'none' }" @dragstart.prevent> -->
          <BaseIcon name="IconLogo" class="logo" :size="60" color="var(--primary-c)" />

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
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 5%;
  width: 100%;
  height: 100%;
  background: var(--background-c);
  padding: 0 10%;
  user-select: text;
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
  font-size: 48px;
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

.background {
  position: fixed;
  min-width: var(--min-window-width);
  width: 100%;
  min-height: var(--min-window-height);
  height: 100%;
  top: 0;
  left: 50%;
  background: var(--primary-c);
  z-index: var(--z-index-home-page-background);
  clip-path: polygon(clamp(250px, 35%, 600px) 0,
      100% 0,
      100% 100%,
      clamp(150px, 15%, 400px) 100%);
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
</style>
