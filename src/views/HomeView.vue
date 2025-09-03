<script setup>
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
import EdimageLogoDark from '@/assets/EdimageLogoDark.png'
import EdimageLogoLight from '@/assets/EdimageLogoLight.png'
import { useDragAndDropArea } from '@/composables/editor/useDragAndDropArea';

const { t } = useI18n()
const router = useRouter()
const uiStore = useUiStore()

const { uploadFile } = useUploadFileButton(useImageStore(), t, useRouter())
const { openHelpModal } = useHelpModal(useUiStore(), useImageStore(), useRouter(), t)
const { openSettingsPanel } = useSettingsPanel(useUiStore())
const { prevStep, nextStep, finishTutorial, closeTutorial } = useInteractiveTutorial(useUiStore(), useImageStore(), useRouter(), t)

useKeyboardShortcuts({ uploadFile, openHelpModal, openSettingsPanel, prevStep, nextStep, finishTutorial, closeTutorial }, useUiStore(), useImageStore());



/**
 * Computes the logo source based on the current theme.
 */
const logoSrc = computed(() => {
  return uiStore.theme === 'dark' ? EdimageLogoDark : EdimageLogoLight
})

/**
 * Logic of the drag-and-drop area
 */
const {
  selectFile
} = useDragAndDropArea(useImageStore(), t, router)

</script>

<template>
  <div class="home-view">
    <div class="background"></div>

    <div class="left-side">
      <div class="app-name">
        <img :src="logoSrc" alt="Edimage logo">
        <h2><span class="highlight-e">{{ $t('home.appNameHighlight') }}</span>{{ $t('home.appNameBasic') }}
        </h2>
      </div>
      <h1 class="title">
        {{ $t('home.title') }}
      </h1>
      <p class="text">
        <b>{{ $t('home.appName') }}</b> {{ $t('home.text') }}
      </p>

      <DefaultButton @click="selectFile" :text="$t('dragAndDropArea.button.text')" />
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
  font-size: calc(var(--landing-page-app-name-font-size) * 1.2);
  font-weight: var(--landing-page-app-name-font-weight);
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
  margin: 0 0 30px 0;

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
  width: 100%;
  height: 100%;
  top: 0;
  left: 50%;
  background: var(--primary-c);
  z-index: var(--z-index-home-page-background);
  clip-path: polygon(30% 0, 100% 0, 100% 100%, 10% 100%);
}
</style>
