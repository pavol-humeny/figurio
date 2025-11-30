<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue';
import DefaultButton from '@/components/common/DefaultButton.vue';
import { useReleaseModal } from '@/composables/modals/useReleaseModal';
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { messages, locale } = useI18n()

/**
 * Computed property for patch notes
 */
const releases = computed(() => {
  return messages.value[locale.value]?.release?.versions || {};
});

/**
 * Computed property for currently in progress items
 */
const currentlyInProgress = computed(() => {
  return messages.value[locale.value]?.release?.inProgressGlobal?.items || [];
});

/**
 * Logic of the patch notes modal state and scrolling
 */
const {
  atTop,
  atBottom,
  scrollUp,
  scrollDown,
  checkScroll,
  isVisible,
  releaseContentRef,
  closeReleaseModal,
} = useReleaseModal();

</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="release-modal-overlay" @mousedown.self="closeReleaseModal">
      <div class="modal-box">
        <div class="title-wrapper">
          <BaseIcon name="IconReleaseNotes" size="28" color="var(--primary-c)" />
          <p>{{ $t('release.title') }}</p>
        </div>

        <div class="release-content-panel">
          <!-- Arrow up -->
          <div v-if="!atTop" class="arrow-up" @click="scrollUp">
            <BaseIcon name="IconArrowUp" size="24" color="var(--primary-c)" />
          </div>

          <!-- Patch notes content -->
          <div class="release-content-wrapper" ref="releaseContentRef" @scroll="checkScroll">
            <div v-if="currentlyInProgress.length > 0" class="release-block">
              <p class="release-global-texts">
                {{ $t('release.inProgressGlobal.currentlyInProgressText') }}
              </p>
              <ul class="dot-paragraph">
                <li v-for="(item, i) in currentlyInProgress" :key="i">{{ item }}</li>
              </ul>
            </div>
            <div v-for="(releaseNotes, version) in releases" :key="version">
              <div class="label-date-wrapper">

                <p class="release-content-title">
                  {{ releaseNotes.label }}
                </p>
                <p class="release-content-date">
                  ({{ releaseNotes.date }})
                </p>
              </div>

              <!-- New Features -->
              <div v-if="releaseNotes.newFeatures?.items?.length" class="release-block">
                <p class="release-global-texts">{{ $t('release.globalTexts.newFeatures.title') }}</p>
                <ul class="dot-paragraph">
                  <li v-for="(item, i) in releaseNotes.newFeatures.items" :key="'nf-' + i">{{ item }}</li>
                </ul>
              </div>

              <!-- Improvements -->
              <div v-if="releaseNotes.improvements?.items?.length" class="release-block">
                <p class="release-global-texts">{{ $t('release.globalTexts.improvements.title') }}</p>
                <ul class="dot-paragraph">
                  <li v-for="(item, i) in releaseNotes.improvements.items" :key="'imp-' + i">{{ item }}</li>
                </ul>
              </div>

              <!-- Bug Fixes -->
              <div v-if="releaseNotes.bugFixes?.items?.length" class="release-block">
                <p class="release-global-texts">{{ $t('release.globalTexts.bugFixes.title') }}</p>
                <ul class="dot-paragraph">
                  <li v-for="(item, i) in releaseNotes.bugFixes.items" :key="'bf-' + i">{{ item }}</li>
                </ul>
              </div>

              <!-- Known Issues -->
              <div v-if="releaseNotes.knownIssues?.items?.length" class="release-block">
                <p class="release-global-texts">{{ $t('release.globalTexts.knownIssues.title') }}</p>
                <ul class="dot-paragraph">
                  <li v-for="(item, i) in releaseNotes.knownIssues.items" :key="'ki-' + i">{{ item }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Arrow down -->
          <div v-if="!atBottom" class="arrow-down" @click="scrollDown">
            <BaseIcon name="IconArrowDown" size="24" color="var(--primary-c)" />
          </div>
        </div>

        <!-- Close patch notes -->
        <div class="button-wrapper">
          <DefaultButton :text="$t('release.closeButton.text')" @click="closeReleaseModal" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.release-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--overlay-c);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-index-release);
  min-width: var(--min-window-width);
  min-height: var(--min-window-height);
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

.release-content-panel {
  position: relative;
  flex: 1;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 10px 0;
}

.release-content-wrapper {
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

.label-date-wrapper {
  display: flex;
  align-items: baseline;
  flex-direction: row;
  gap: 8px;
}

.release-content-title {
  font-size: var(--release-subtitle-font-size);
  font-weight: var(--release-subtitle-font-weight);
  color: var(--primary-c);
}

.release-content-date {
  font-size: var(--release-date-font-size);
  font-weight: var(--release-date-font-weight);
  color: var(--primary-c);
}

.button-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.dot-paragraph {
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;
}

.dot-paragraph li {
  color: var(--text-c);
  font-size: var(--release-font-size);
  line-height: 1.3;
}

.release-block {
  padding: 10px;
}

.release-global-texts {
  font-size: calc(var(--release-font-size) + 2px);
  margin-bottom: 2px;
}
</style>
