<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import ItemTip from '@/components/common/ItemTip.vue'
import { useEditorStore } from '@/stores/editorStore'
import { useOneTool } from '@/composables/tools/useOneTool'
import { useImageStore } from '@/stores/imageStore'

const editorStore = useEditorStore()
const imageStore = useImageStore()

/**
 * @typedef {Object} OneToolButtonProps
 * @property {Object} tool - Tool configuration object
 * @property {string} [tip=''] - Tooltip text
 * @property {boolean} [active=false] - Whether the tool is selected
 * @property {boolean} [disabled=false] - Whether the tool is disabled
 * @property {Object|null} [advanceTip=null] - Advanced tooltip config (title, shortcut, etc.)
 */

/** @type {OneToolButtonProps} */
const props = defineProps({
  tool: {
    type: Object,
    required: true,
  },
  tip: {
    type: String,
    default: '',
  },
  active: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  advanceTip: {
    type: Object,
    default: null,
  },
})

/**
 * @event click - Emitted when the tool or subtool is clicked
 */
const emit = defineEmits(['click'])

/**
 * Logic of the single tool and subtools popup
 */
const { wrapperRef, subToolPos, onRightClick, onClickTab, onClickTool } = useOneTool(
  useEditorStore(),
  useImageStore(),
  props,
  emit,
)
</script>

<template>
  <ItemTip v-bind="props.advanceTip?.advance ? {
    text: editorStore.enableTools[props.tool.key] === false ? $t('tools.toolIsNotAvailable.tip') : props.advanceTip.text,
    title: props.advanceTip.title,
    shortcut: props.advanceTip.shortcut,
    advance: true,
    position: 'top-right',
  } : {
    text: props.tip,
    position: 'top-right',
  }">
    <div class="tool-wrapper" ref="wrapperRef" @contextmenu="onRightClick"
      :id="props.tool.key === 'export' ? 'export-tool' : undefined">
      <div class="tool"
        :class="{ active: props.active && imageStore.isImageLoaded, disabled: props.disabled || editorStore.enableTools[props.tool.key] === false }"
        @click.left="onClickTool">
        <BaseIcon :name="props.tool.iconName" :size="27" :color="'var(--primary-c)'" />
      </div>
      <p class="tool-label">{{ props.tool.label }}</p>
    </div>

    <Teleport to="body" v-if="editorStore.toolWithOpenSubToolsKey === props.tool.key && props.tool.subTools">
      <div class="subTools-popup" :style="{
        position: 'absolute',
        top: subToolPos.top + 'px',
        left: subToolPos.left + 'px',
      }">
        <ItemTip v-for="sub in props.tool.subTools" :key="sub.key" v-bind="{
          text: sub.tip,
          title: sub.label,
          shortcut: sub.shortcut || '',
          advance: true,
          position: 'right',
        }">
          <div class="subTool" @click.stop="onClickTab(sub.key)">
            <BaseIcon :name="sub.iconName" :size="27" :color="'var(--primary-c)'" />
          </div>
        </ItemTip>
      </div>
    </Teleport>
  </ItemTip>
</template>

<style setup>
.tool-wrapper {
  position: relative;
  width: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tool {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border-radius: 10px;
  width: 40px;
  height: 40px;
  padding: 10px;
  background: var(--secondary-c);
  transition: var(--default-transition);
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.tool:hover {
  border: var(--border-modal);
}

.tool.active {
  border: var(--border-modal);
}

.tool.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.tool-label{
  text-align: center;
  color: var(--primary-c);
  margin-top: 5px;
  font-size: var(--tool-text-font-size);
}

.subTools-popup {
  z-index: 650;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.subTool {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  width: 40px;
  height: 40px;
  padding: 10px;
  background: var(--secondary-c);
  transition: var(--default-transition);
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.subTool:hover {
  border: var(--border-modal);
}

.subTool.active {
  border: var(--border-modal);
}

.subTool.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
