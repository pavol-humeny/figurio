<script setup>
import { useSvgObjectWrapper } from '@/composables/tools/useSvgObjectWrapper'
import { useEditorStore } from '@/stores/editorStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useImageStore } from '@/stores/imageStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

/**
 * @typedef {Object} SvgObjectWrapperProps
 * @property {Object} objectId - SVG object to wrap (with id, tag, attrs)
 */

/** @type {SvgObjectWrapperProps} */
const props = defineProps({
  objectId: {
    type: Number,
    required: true,
  }
})

/**
 * Logic for the SVG object wrapper
 */
const {
  textRef,
  isSelected,
  onMouseDown,
  onMouseDownResizer,
  onMouseDownDrag,
  getResizerPositions,
  boundingBox,
  resizerSize,
  object
} = useSvgObjectWrapper(props.objectId, useImageStore(), useViewportStore(), useEditorStore(), useHistoryStore(), t)
</script>

<template>
  <g @mousedown="onMouseDown" @mousedown.right.prevent.stop>
    <!-- SVG object except text -->
    <g v-if="isSelected" @mousedown="onMouseDownDrag" style="cursor: move">
      <component v-if="object.tag !== 'text'" :is="object.tag" v-bind="object.attrs" />
      <text v-else v-bind="object.attrs" style="user-select: none" ref="textRef">
        {{ object.content || '' }}
      </text>
    </g>

    <!-- SVG text object -->
    <g v-else>
      <component v-if="object.tag !== 'text'" :is="object.tag" v-bind="object.attrs" />
      <text v-else v-bind="object.attrs" style="user-select: none">
        {{ object.content || '' }}
      </text>
    </g>

    <!-- Bounding box -->
    <rect v-if="isSelected && boundingBox" :x="boundingBox.x" :y="boundingBox.y" :width="boundingBox.width"
      :height="boundingBox.height" fill="none" stroke="var(--editor-highlight-c)" stroke-width="1"
      stroke-dasharray="4 2" pointer-events="none" />

    <!-- Resizers -->
    <template v-if="isSelected && object.tag !== 'text'">
      <circle v-for="(pos, i) in getResizerPositions()" :key="i" :cx="pos.x" :cy="pos.y" :r="resizerSize"
        fill="var(--text-c)" stroke="var(--editor-highlight-c)" :style="{ cursor: pos.cursor }"
        @mousedown.stop.prevent="onMouseDownResizer($event, i)" />
    </template>
  </g>
</template>
