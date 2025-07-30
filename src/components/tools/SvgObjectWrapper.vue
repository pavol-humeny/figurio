<script setup>
import { useSvgObjectWrapper } from '@/composables/tools/useSvgObjectWrapper'
import { useEditorStore } from '@/stores/editorStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useImageStore } from '@/stores/imageStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useI18n } from 'vue-i18n'
import BaseIcon from '@/components/icons/BaseIcon.vue'

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
  isSymmetricalObject,
  objectInfo,
  activeResizerIndex,
  showResizers,
  controlIconSize,
  boundingBoxStrokeWidth,
  onMouseDownRotate
} = useSvgObjectWrapper(props.objectId, useImageStore(), useViewportStore(), useEditorStore(), useHistoryStore(), t)


</script>

<template>
  <g @mousedown="onMouseDown" @mousedown.right.prevent.stop>
    <!-- SVG object except text -->
    <g v-if="isSelected" @mousedown="onMouseDownDrag" @dblclick="showResizers = !showResizers" style="cursor: move">
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

    <g v-if="isSelected && boundingBox" :transform="object?.attrs?.transform">
      <!-- Bounding box -->
      <rect :x="boundingBox.x" :y="boundingBox.y" :width="boundingBox.width" :height="boundingBox.height" fill="none"
        :stroke="isSymmetricalObject ? 'var(--editor-highlight-align-c)' : 'var(--editor-highlight-c)'"
        :stroke-width="boundingBoxStrokeWidth"
        :stroke-dasharray="[boundingBoxStrokeWidth * 4, boundingBoxStrokeWidth * 2]" pointer-events="none" />

      <!-- Icon to turn on resize -->
      <foreignObject v-if="object.tag !== 'text'" :x="boundingBox.x + boundingBox.width / 2 - controlIconSize * 0.5"
        :y="boundingBox.y - controlIconSize" :width="controlIconSize" :height="controlIconSize"
        @mousedown.stop.prevent="showResizers = !showResizers" style="cursor: pointer">
        <BaseIcon v-if="showResizers" :name="'IconCross'" :tip="t('tools.svgObject.resizeObject.tipStopResize')"
          :size="controlIconSize" :color="'var(--primary-c)'" />
        <BaseIcon v-else :name="'IconResizeObject'" :tip="t('tools.svgObject.resizeObject.tipStartResize')"
          :size="controlIconSize" :color="'var(--primary-c)'" />
      </foreignObject>

      <!-- Resizers -->
      <template v-if="showResizers && object.tag !== 'text'">
        <circle v-for="(pos, i) in getResizerPositions()" :key="i" :cx="pos.x" :cy="pos.y" :r="resizerSize / 2"
          fill="var(--text-c)" stroke="var(--editor-highlight-c)" :style="{ cursor: pos.cursor }"
          @mousedown.stop.prevent="onMouseDownResizer($event, i)" />
      </template>

      <!-- Rotate resizer -->
      <circle v-if="!showResizers" :cx="boundingBox.x + boundingBox.width + resizerSize"
        :cy="boundingBox.y + boundingBox.height / 2" :r="resizerSize / 2" fill="var(--primary-c)" stroke="var(--text-c)"
        style="cursor: grab" @mousedown.stop.prevent="onMouseDownRotate($event)" />

      <!-- Info box -->
      <!-- <foreignObject v-if="showResizers && activeResizerIndex !== null && objectInfo && boundingBox"
        :x="(boundingBox.y < 0 || boundingBox.x < 0) ? boundingBox.x + boundingBox.width + 5 : boundingBox.x + 5"
        :y="(boundingBox.y < 0 || boundingBox.x < 0) ? boundingBox.y + boundingBox.height + 5 : boundingBox.y + 5"
        width="200" :height="50" style="pointer-events: none">
        <div class="svg-object-info">
          <template v-if="'width' in objectInfo">{{ objectInfo.width }} px x {{ objectInfo.height }} px</template>
        </div>
      </foreignObject> -->
    </g>
  </g>
</template>

<style scoped>
.svg-object-info {
  font-size: 50px;
  font-family: sans-serif;
  background: var(--overlay-c);
  color: var(--text-c);
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
}
</style>
