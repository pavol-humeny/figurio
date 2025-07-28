<script setup>
import { useSvgObjectWrapper } from '@/composables/tools/useSvgObjectWrapper'
import { useEditorStore } from '@/stores/editorStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useImageStore } from '@/stores/imageStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

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
  object,
  isHightLighted
} = useSvgObjectWrapper(props.objectId, useImageStore(), useViewportStore(), useEditorStore(), useHistoryStore(), t)

/**
 * Compute display info for current SVG object (position and size)
 */
const objectInfo = computed(() => {
  const attrs = object.value.attrs
  if (!attrs) return null

  if (object.value.tag === 'rect') {
    return {
      x: Math.round(attrs.x),
      y: Math.round(attrs.y),
      width: Math.round(attrs.width),
      height: Math.round(attrs.height),
    }
  } else if (object.value.tag === 'ellipse') {
    return {
      x: Math.round(attrs.cx),
      y: Math.round(attrs.cy),
      width: Math.round(attrs.rx * 2),
      height: Math.round(attrs.ry * 2),
    }
  } else if (object.value.tag === 'circle') {
    return {
      x: Math.round(attrs.cx),
      y: Math.round(attrs.cy),
      width: Math.round(attrs.r * 2),
      height: Math.round(attrs.r * 2),
    }
  } else if (object.value.tag === 'text') {
    return {
      x: Math.round(attrs.x),
      y: Math.round(attrs.y),
    }
  } else if (object.value.tag === 'line') {
    return {
      x: Math.round(attrs.x1),
      y: Math.round(attrs.y1),
      width: Math.round(attrs.x2 - attrs.x1),
      height: Math.round(attrs.y2 - attrs.y1),
    }
  }

  return null
})
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
      :height="boundingBox.height" fill="none"
      :stroke="isHightLighted ? 'var(--editor-highlight-align-c)' : 'var(--editor-highlight-c)'" stroke-width="1"
      stroke-dasharray="4 2" pointer-events="none" />

    <!-- Resizers -->
    <template v-if="isSelected && object.tag !== 'text'">
      <circle v-for="(pos, i) in getResizerPositions()" :key="i" :cx="pos.x" :cy="pos.y" :r="resizerSize"
        fill="var(--text-c)" stroke="var(--editor-highlight-c)" :style="{ cursor: pos.cursor }"
        @mousedown.stop.prevent="onMouseDownResizer($event, i)" />
    </template>

    <!-- Info box -->
    <foreignObject v-if="isSelected && objectInfo && boundingBox" :x="boundingBox.x" :y="boundingBox.y - 24" width="200"
      height="20" style="pointer-events: none">
      <div class="svg-object-info">
        x: {{ objectInfo.x }}, y: {{ objectInfo.y }}
        <template v-if="'width' in objectInfo"> | w: {{ objectInfo.width }}, h: {{ objectInfo.height }}</template>
      </div>
    </foreignObject>
  </g>
</template>

<style scoped>
.svg-object-info {
  font-size: 12px;
  font-family: sans-serif;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
