<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import OneTool from './OneTool.vue'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useToolsPanel } from '@/composables/tools/useToolsPanel'
import { toolsDefinitions } from '@/config/toolsDefinitions'
import { useEditorStore } from '@/stores/editorStore'
import { useImageStore } from '@/stores/imageStore'
import { useUiStore } from '@/stores/uiStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const { t } = useI18n()

/**
 * Logic of the tools panel (scrolling, active tool, tool selection)
 */
const {
  activeTool,
  toolsRef,
  atTop,
  atBottom,
  checkScroll,
  scrollUp,
  scrollDown,
  selectTool,
  isToolDisabled,
} = useToolsPanel(useEditorStore(), useImageStore(), useUiStore(), useWorkspaceStore(), t)

/**
 * Computed tool list with localized labels, tips and shortcuts
 */
const tools = computed(() =>
  toolsDefinitions.filter((tool) => tool.key !== 'export').map((tool) => ({
    ...tool,
    label: t(`tools.${tool.key}.label`),
    tip: t(`tools.${tool.key}.tip`),
    shortcut: t(`tools.${tool.key}.shortcut`),
    tipDisabled: t(`tools.${tool.key}.tipDisabled`),
    subTools:
      tool.subTools?.map((subTool) => ({
        ...subTool,
        label: t(`tools.${tool.key}.subTools.${subTool.key}.label`),
        tip: t(`tools.${tool.key}.subTools.${subTool.key}.tip`),
        shortcut: t(`tools.${tool.key}.subTools.${subTool.key}.shortcut`),
      })) || [],
  })),
)
</script>

<template>
  <div class="tools-panel" id="tools-panel">
    <div v-if="!atTop" class="arrow-up" @click="scrollUp">
      <BaseIcon name="IconArrowUp" size="24" color="var(--primary-c)" />
    </div>

    <div ref="toolsRef" class="tools-wrapper" @scroll="checkScroll">
      <OneTool v-for="tool in tools" :key="tool.key" :tool="tool" :tip="isToolDisabled ? tool.tipDisabled : tool.tip"
        :active="activeTool === tool.key" :advance-tip="{
          advance: true,
          title: tool.label,
          shortcut: tool.shortcut || '',
          text: isToolDisabled ? tool.tipDisabled : tool.tip,
        }" @click="selectTool" :disabled="isToolDisabled" />
    </div>

    <div v-if="!atBottom" class="arrow-down" @click="scrollDown">
      <BaseIcon name="IconArrowDown" size="24" color="var(--primary-c)" />
    </div>
  </div>
</template>

<style scoped>
.tools-panel {
  position: relative;
  height: 100%;
  padding: 30px 0;
  border-right: var(--border-ui);
  z-index: var(--z-index-tools-panel);
}

.tools-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 30px 25px;
  height: 100%;
  mask-image: linear-gradient(to bottom,
      transparent,
      black 30px,
      rgb(0, 0, 0) calc(100% - 30px),
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
</style>
