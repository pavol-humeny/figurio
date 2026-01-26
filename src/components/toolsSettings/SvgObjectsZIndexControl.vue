<script setup>
import DefaultButton from '../common/DefaultButton.vue';
import { useSvgObjects } from '@/composables/tools/useSvgObjects';
import { useImageStore } from '@/stores/imageStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useEditorStore } from '@/stores/editorStore';
import { useUiStore } from '@/stores/uiStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const imageStore = useImageStore();

/**
 * @typedef {Object} SvgObjectsZIndexControlProps
 * @property {boolean} isVisible - Whether the Z-Index control is visible
 */

/** @type {SvgObjectsZIndexControlProps} */
const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
})

/**
 * Logic for moving selected SVG objects
 */
const {
  moveSelectedSvgObjectForward,
  moveSelectedSvgObjectBackward,
  sendSelectedSvgObjectToBack,
  bringSelectedSvgObjectToFront,
} = useSvgObjects(useImageStore(), useHistoryStore(), useViewportStore(), useEditorStore(), useUiStore(), useWorkspaceStore(), t);

</script>

<template>
  <div v-if="props.isVisible" class="settings-content-wrapper">
    <div
      v-if="imageStore.bringToFrontButtonEnabled() || imageStore.moveForwardButtonEnabled() || imageStore.moveBackwardButtonEnabled() || imageStore.sendToBackButtonEnabled()"
      class="content-wrapper">
      <div class="content-title">
        <p>
          {{ $t('tools.magnifyArea.settings.general.zIndex.label') }}
        </p>
      </div>
      <DefaultButton v-if="imageStore.bringToFrontButtonEnabled()"
        :text="$t('tools.magnifyArea.settings.general.zIndex.bringToFrontButton.text')"
        @click="bringSelectedSvgObjectToFront" :disabled="imageStore.isMaxZIndexOfSelectedSvgObject()" />

      <DefaultButton v-if="imageStore.moveForwardButtonEnabled()"
        :text="$t('tools.magnifyArea.settings.general.zIndex.moveForwardButton.text')"
        @click="moveSelectedSvgObjectForward" :disabled="imageStore.isMaxZIndexOfSelectedSvgObject()" />

      <DefaultButton v-if="imageStore.moveBackwardButtonEnabled()"
        :text="$t('tools.magnifyArea.settings.general.zIndex.moveBackwardButton.text')"
        @click="moveSelectedSvgObjectBackward" :disabled="imageStore.isMinZIndexOfSelectedSvgObject()" />

      <DefaultButton v-if="imageStore.sendToBackButtonEnabled()"
        :text="$t('tools.magnifyArea.settings.general.zIndex.sendToBackButton.text')"
        @click="sendSelectedSvgObjectToBack" :disabled="imageStore.isMinZIndexOfSelectedSvgObject()" />
    </div>
  </div>
</template>
