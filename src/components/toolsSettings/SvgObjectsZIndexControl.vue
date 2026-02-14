<script setup>
import DefaultButton from '../common/DefaultButton.vue';
import { useImageStore } from '@/stores/imageStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useEditorStore } from '@/stores/editorStore';
import { useUiStore } from '@/stores/uiStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useI18n } from 'vue-i18n';
import { useSvgObjectsZIndexControl } from '@/composables/toolsSettings/useSvgObjectsZIndexControl';

const { t } = useI18n()

/**
 * @typedef {Object} SvgObjectsZIndexControlProps
 * @property {boolean} isVisible - Whether the Z-Index control is visible
 * @property {string} type - The type of objects being controlled ('svg', 'blur', 'magnify')
 */

/** @type {SvgObjectsZIndexControlProps} */
const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  type: {
    type: String, // svg, blur, magnify
    required: true,
  },
})

/**
 * Logic for controlling the Z-index of SVG objects in various tools
 */
const {
  isZIndexControlVisible,
  bringObjectToFront,
  moveObjectForward,
  moveObjectBackward,
  sendObjectToBack,
  bringObjectToFrontVisible,
  moveObjectForwardVisible,
  moveObjectBackwardVisible,
  sendObjectToBackVisible,
  moveObjectForwardEnabled,
  moveObjectBackwardEnabled,
} = useSvgObjectsZIndexControl(props, useImageStore(),
  useHistoryStore(),
  useViewportStore(),
  useEditorStore(),
  useUiStore(),
  useWorkspaceStore(),
  t,)
</script>

<template>
  <div v-if="props.isVisible" class="settings-content-wrapper">
    <div v-if="isZIndexControlVisible" class="content-wrapper">
      <div class="content-title">
        <p>
          {{ $t('tools.magnifyArea.settings.general.zIndex.label') }}
        </p>
      </div>
      <DefaultButton v-if="bringObjectToFrontVisible"
        :text="$t('tools.magnifyArea.settings.general.zIndex.bringToFrontButton.text')" @click="bringObjectToFront"
        :disabled="!moveObjectForwardEnabled" />

      <DefaultButton v-if="moveObjectForwardVisible"
        :text="$t('tools.magnifyArea.settings.general.zIndex.moveForwardButton.text')" @click="moveObjectForward"
        :disabled="!moveObjectForwardEnabled" />

      <DefaultButton v-if="moveObjectBackwardVisible"
        :text="$t('tools.magnifyArea.settings.general.zIndex.moveBackwardButton.text')" @click="moveObjectBackward"
        :disabled="!moveObjectBackwardEnabled" />

      <DefaultButton v-if="sendObjectToBackVisible"
        :text="$t('tools.magnifyArea.settings.general.zIndex.sendToBackButton.text')" @click="sendObjectToBack"
        :disabled="!moveObjectBackwardEnabled" />
    </div>
  </div>
</template>
