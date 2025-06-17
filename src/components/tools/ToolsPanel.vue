<script setup>
import BaseIcon from '../icons/BaseIcon.vue';
import OneTool from './OneTool.vue';
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useToolsPanel } from '@/composables/tools/useToolsPanel';
import { toolsDefinitions } from '@/config/toolsDefinitions'
import { useToolStore } from '@/stores/toolStore';

const { t } = useI18n()

const {
  activeTool,
  toolsRef,
  atTop,
  atBottom,
  checkScroll,
  scrollUp,
  scrollDown,
  toggleTool
} = useToolsPanel(useToolStore())

const tools = computed(() =>
  toolsDefinitions.map(tool => ({
    ...tool,
    label: t(`tools.${tool.key}.label`),
    tip: t(`tools.${tool.key}.tip`)
  }))
)
</script>

<template>
  <div class="tools-panel">
    <div
      v-if="!atTop"
      class="arrow-up"
      @click="scrollUp">
      <BaseIcon name="IconArrowUp" size="24" color="var(--primary-c)" />
    </div>

    <div
      ref="toolsRef"
      class="tools-wrapper"
      @scroll="checkScroll">
      <OneTool
        v-for="tool in tools"
        :key="tool.key"
        :iconName="tool.iconName"
        :label="tool.label"
        :tip="tool.tip"
        :active="activeTool === tool.key"
        @click="toggleTool(tool.key)"
      />
    </div>

    <div
      v-if="!atBottom"
      class="arrow-down"
      @click="scrollDown"
    >
      <BaseIcon name="IconArrowDown" size="24" color="var(--primary-c)" />
    </div>
  </div>
</template>

<style scoped>
.tools-panel{
  position: relative;
  height: 100%;
  padding: 30px 0;
  border-right: var(--border-ui);
}

.tools-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 50px;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 30px 20px;
  height: 100%;
  mask-image: linear-gradient(to bottom, transparent, black 30px, rgb(0, 0, 0) calc(100% - 30px), transparent 100%);
}

.arrow-up,
.arrow-down {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  cursor: pointer;
}
.arrow-up {
  top: 0;
}
.arrow-down {
  bottom: 0;
}
</style>
