<script setup>
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
import FigurioLogoDark from '@/assets/FigurioLogoDark.png'
import FigurioLogoLight from '@/assets/FigurioLogoLight.png'
import { useDragAndDropArea } from '@/composables/editor/useDragAndDropArea';
import { useEditorStore } from '@/stores/editorStore';
import { useFeatureTourModal } from '@/composables/modals/useFeatureTourModal';
import { usePrivacyAndDataModal } from '@/composables/modals/usePrivacyAndDataModal';
import { useReleaseModal } from '@/composables/modals/useReleaseModal';

const { t, messages, locale } = useI18n()
const router = useRouter()
const uiStore = useUiStore()

const { uploadFile } = useUploadFileButton(useImageStore(), t, useRouter())
const { openHelpModal } = useHelpModal(useUiStore(), useImageStore(), useEditorStore(), useRouter(), t)
const { openSettingsPanel } = useSettingsPanel(useUiStore())
const { prevStep, nextStep, finishTutorial, closeTutorial } = useInteractiveTutorial(useUiStore(), useImageStore(), useRouter(), t)
const { closeHelpModal } = useHelpModal(useUiStore(), useImageStore(), useEditorStore(), useRouter(), t)
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
const logoSrc = computed(() => {
  return uiStore.theme === 'dark' ? FigurioLogoDark : FigurioLogoLight
})

const features = computed(() => {
  return messages.value[locale.value]?.home?.features || [];
})

/**
 * Logic of the drag-and-drop area
 */
const {
  handleDrop,
  selectFile
} = useDragAndDropArea(useImageStore(), useEditorStore(), t, router)

const {
  openFeatureTourModal
} = useFeatureTourModal();

/**
 * On mounted, check seen feature tour slides and open modal
 */
onMounted(() => {
  const seen = JSON.parse(localStorage.getItem(`${globalConfig.LOCAL_STORAGE_PREFIX}seenFeatureTour`) || '[]')

  // Open feature tour modal
  openFeatureTourModal(seen)
})
</script>

<template>
  <div class="home-view" @drop="handleDrop" @dragover.prevent @dragleave.prevent>
    <div class="background"></div>

    <div class="left-side">
      <div class="app-name">
        <img :src="logoSrc" alt="Figurio logo" :style="{ 'user-select': 'none' }" @dragstart.prevent>
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
      <DragAndDropArea isHomePage />
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
  overflow: hidden;
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

.app-name img {
  height: var(--landing-page-logo-size);
  transition: var(--default-transition);
}

.app-name img:hover {
  transition: var(--default-transition);
  filter: drop-shadow(var(--box-shadow-hover));
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
  clip-path: polygon(30% 0, 100% 0, 100% 100%, 10% 100%);
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
