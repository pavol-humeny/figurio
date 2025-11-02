<script setup>
import { useSvgObjectWrapper } from '@/composables/tools/useSvgObjectWrapper'
import { useEditorStore } from '@/stores/editorStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useImageStore } from '@/stores/imageStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useI18n } from 'vue-i18n'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useUiStore } from '@/stores/uiStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';

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
  onMouseDownResizer,
  onMouseDownDrag,
  getResizerPositions,
  boundingBox,
  resizerSize,
  resizerBorderSize,
  object,
  isSymmetricalObject,
  hideResizers,
  controlIconSize,
  boundingBoxStrokeWidth,
  onMouseDownRotate,
  isRotating,
  cursorOnSvgObject,
  isInMultiSelection,
  // isResizerIconInside,
  isRotateIconInside,
  onObjectMouseUp,
} = useSvgObjectWrapper(props.objectId, useImageStore(), useViewportStore(), useEditorStore(), useHistoryStore(), useUiStore(), useWorkspaceStore(), t)

</script>

<template>
  <g @mouseup="onObjectMouseUp" @mousedown.right.prevent.stop>
    <!-- SVG object except text -->
    <g v-if="isSelected" @mousedown="onMouseDownDrag" :style="{ cursor: cursorOnSvgObject }">
      <component v-if="object.tag !== 'text'" :is="object.tag" v-bind="object.attrs" :data-id="object.id"
        :style="{ visibility: object.attrs.visibility }" />
      <text v-else v-bind="object.attrs" style="user-select: none" ref="textRef" :data-id="object.id">
        {{ object.content || '' }}
      </text>
    </g>

    <!-- SVG text object -->
    <g v-else :style="{ cursor: cursorOnSvgObject }">
      <component v-if="object.tag !== 'text'" :is="object.tag" v-bind="object.attrs" :data-id="object.id"
        :style="{ visibility: object.attrs.visibility }" />
      <text v-else v-bind="object.attrs" style="user-select: none" :data-id="object.id">
        {{ object.content || '' }}
      </text>
    </g>

    <g v-if="((isSelected && boundingBox) || isInMultiSelection) && !hideResizers"
      :transform="object?.attrs?.transform">
      <!-- Bounding box -->
      <rect :x="boundingBox.x" :y="boundingBox.y" :width="boundingBox.width" :height="boundingBox.height"
        :data-id="object.id" fill="#00000001" :style="{ cursor: cursorOnSvgObject }" @mousedown="onMouseDownDrag"
        :stroke="isSymmetricalObject ? 'var(--editor-highlight-align-c)' : 'var(--editor-highlight-c)'"
        :stroke-width="boundingBoxStrokeWidth"
        :stroke-dasharray="[boundingBoxStrokeWidth * 4, boundingBoxStrokeWidth * 2]" />

      <!-- Icon to turn on resize -->
      <!--
      <foreignObject v-if="object.tag !== 'text' && !isInMultiSelection && object.class !== 'magnifyArea'"
        :x="boundingBox.x + boundingBox.width / 2 - controlIconSize * 0.5"
        :y="isResizerIconInside ? boundingBox.y - controlIconSize : boundingBox.y + boundingBox.height"
        :width="controlIconSize" :height="controlIconSize" @mousedown.stop.prevent="showResizers = !showResizers"
        style="cursor: pointer">
        <BaseIcon v-if="showResizers" :name="'IconCross'" :tip="t('tools.svgObject.resizeObject.tipStopResize')"
          :size="controlIconSize" :color="'var(--primary-c)'" />
        <BaseIcon v-else :name="'IconResizeObject'" :tip="t('tools.svgObject.resizeObject.tipStartResize')"
          :size="controlIconSize" :color="'var(--primary-c)'" />
      </foreignObject>
      -->

      <!-- Resizers -->
      <template v-if="isSelected && object.tag !== 'text' && object.class !== 'magnifyArea'">
        <template v-for="(pos, i) in getResizerPositions()" :key="i">
          <!-- Circle -->
          <circle v-if="pos.type === 'circle'" :cx="pos.x" :cy="pos.y" :r="resizerSize / 2" fill="var(--text-c)"
            stroke="var(--editor-highlight-c)" :stroke-width="resizerBorderSize"
            :style="{ cursor: pos.cursor, display: pos.visible ? 'block' : 'none' }"
            @mousedown.stop.prevent="onMouseDownResizer($event, i)" />

          <!-- Rectangle -->
          <rect v-else :x="pos.x - pos.width / 2" :y="pos.y - pos.height / 2" :width="pos.width" :height="pos.height"
            fill="var(--text-c)" stroke="var(--editor-highlight-c)" :stroke-width="resizerBorderSize"
            :style="{ cursor: pos.cursor, display: pos.visible ? 'block' : 'none' }"
            @mousedown.stop.prevent="onMouseDownResizer($event, i)" />
        </template>
      </template>

      <!-- Rotate icon  -->
      <foreignObject
        v-if="!isRotating && !isInMultiSelection && object.tag !== 'line' && object.class !== 'magnifyArea' && object.class !== 'blur'"
        :x="isRotateIconInside ? boundingBox.x + boundingBox.width : boundingBox.x - controlIconSize"
        :y="boundingBox.y + boundingBox.height / 2 - controlIconSize / 2" :width="controlIconSize"
        :height="controlIconSize" @mousedown.stop.prevent="onMouseDownRotate($event)" style="cursor: grab">
        <BaseIcon :name="'IconRotate'" :tip="t('tools.svgObject.rotateObject.tip')" :size="controlIconSize"
          :color="'var(--primary-c)'" />
      </foreignObject>
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
