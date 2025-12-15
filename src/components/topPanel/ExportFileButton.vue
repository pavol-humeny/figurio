<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import ItemTip from '@/components/common/ItemTip.vue'
import { useEditorStore } from '@/stores/editorStore'
import { useImageStore } from '@/stores/imageStore'
import { computed } from 'vue'
import { useExportToolSettings } from '@/composables/toolsSettings/useExportToolSettings'
import { useHistoryStore } from '@/stores/historyStore'
import { useI18n } from 'vue-i18n'

import { useConsole } from '@/composables/common/useConsole.js'
import { useViewportStore } from '@/stores/viewportStore'
const { log } = useConsole()

const { t } = useI18n()
const editorStore = useEditorStore()
const imageStore = useImageStore()

/**
 * Whether the export tool is disabled
 */
const exportIsDisabled = computed(() => {
  return !imageStore.isImageLoaded
})

/**
 * Method to open the export tool settings modal
 */
const { openExportToolSettings } = useExportToolSettings(
  useImageStore(),
  useEditorStore(),
  useHistoryStore(),
  useViewportStore(),
  t,
)

/**
 * Function to export file
 */
const exportFile = () => {
  if (exportIsDisabled.value) return

  log('Export file')
  openExportToolSettings()
}

</script>

<template>
  <ItemTip id="export-tool"
    :text="editorStore.enableTools['export'] === false ? $t('tools.toolIsNotAvailable.tip') : exportIsDisabled ? $t('tools.export.tipDisabled') : $t('tools.export.tip')"
    :title="$t('tools.export.label')" :shortcut="$t('tools.export.shortcut')" :advance="true" :position="'bottom'">
    <div class="export-wrapper button button-default button-main" :class="{ disabled: exportIsDisabled }"
      @click="exportFile">
      <BaseIcon name="IconExportTool" :size="20" />
      <p class="export-title">{{ $t('tools.export.label') }}</p>
    </div>
  </ItemTip>
</template>

<style scoped>
.export-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 10px;
  color: var(--secondary-c);
}

.export-wrapper:hover {
  color: var(--primary-c);
}

.export-title {
  font-size: var(--text-font-size);
  font-weight: bold;
  padding-bottom: 2px;
}
</style>
