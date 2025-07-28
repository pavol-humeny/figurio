<script setup>
import { useSvgObjectWrapper } from '@/composables/tools/useSvgObjectWrapper'
import { useImageStore } from '@/stores/imageStore';
import { useViewportStore } from '@/stores/viewportStore';

const props = defineProps({
  object: {
    type: Object,
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
  onMouseDownDrag,
  getResizerPositions,
  boundingBox,
  resizerSize,
} = useSvgObjectWrapper(props.object, useImageStore(), useViewportStore())
</script>

<template>
  <g @mousedown="onMouseDown" @mousedown.right.prevent.stop>
    <g v-if="isSelected" @mousedown="onMouseDownDrag" style="cursor: move">
      <component v-if="props.object.tag !== 'text'" :is="props.object.tag" v-bind="props.object.attrs" />
      <text v-else v-bind="props.object.attrs" style="user-select: none" ref="textRef">
        {{ props.object.content || '' }}
      </text>
    </g>

    <g v-else>
      <component v-if="props.object.tag !== 'text'" :is="props.object.tag" v-bind="props.object.attrs" />
      <text v-else v-bind="props.object.attrs" style="user-select: none">
        {{ props.object.content || '' }}
      </text>
    </g>

    <rect v-if="isSelected && boundingBox" :x="boundingBox.x" :y="boundingBox.y" :width="boundingBox.width"
      :height="boundingBox.height" fill="none" stroke="var(--editor-highlight-c)" stroke-width="1"
      stroke-dasharray="4 2" pointer-events="none" />

    <template v-if="isSelected && object.tag !== 'text'">
      <circle v-for="(pos, i) in getResizerPositions()" :key="i" :cx="pos.x" :cy="pos.y" :r="resizerSize"
        fill="var(--text-c)" stroke="var(--editor-highlight-c)" :style="{ cursor: pos.cursor }" />
    </template>
  </g>
</template>
