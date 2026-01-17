<script setup>
import { useViewportWrapper } from '@/composables/editor/useViewportWrapper'
import { useViewportStore } from '@/stores/viewportStore'
import { useImageRenderer } from '@/composables/editor/useImageRenderer'
import { useImageStore } from '@/stores/imageStore'
import { useEditorStore } from '@/stores/editorStore'
import { computed, ref, watch } from 'vue'
import CropTool from '@/components/tools/CropTool.vue'
import PresetCropTool from '../tools/PresetCropTool.vue'
import { useHistoryStore } from '@/stores/historyStore'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/uiStore'
import LoadingSpinner from '../common/LoadingSpinner.vue'
import SvgObjectWrapper from '../tools/SvgObjectWrapper.vue'
import { useSvgObjects } from '@/composables/tools/useSvgObjects'
import { useBlurTool } from '@/composables/tools/useBlurTool'
import ContextMenu from '../common/ContextMenu.vue'
import { useDragAndDropArea } from '@/composables/editor/useDragAndDropArea'
import router from '@/router'
import BackgroundRemovalCanvas from '../tools/BackgroundRemovalCanvas.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useFrameTool } from '@/composables/tools/useFrameTool'
import ItemTip from '../common/ItemTip.vue'
import BaseIcon from '../icons/BaseIcon.vue'
import BrushToolCanvas from '../tools/BrushToolCanvas.vue'
import { editorConfig } from '@/config/editorConfig'
import { useImageAnalysis } from '@/composables/tools/useImageAnalysis'
import WarningList from '../modals/WarningList.vue'
import { useUserModeStore } from '@/stores/userModeStore'

const { t } = useI18n()
const uiStore = useUiStore()
const editorStore = useEditorStore()
const imageStore = useImageStore()

/**
 * Reference to the viewport content element
 * @type {import('vue').Ref<HTMLElement | null>}
 */
const contentRef = ref(null)

/**
 * Logic of the image renderer (canvas, SVG, frame)
 */
const { imageRef, svgRef, frameSvgRef, pdfContainerRef } = useImageRenderer(
  useImageStore(),
  useHistoryStore(),
  useEditorStore(),
  useViewportStore(),
  useUiStore(),
  contentRef,
  t
)

/**
 * Logic of the viewport wrapper (zoom, pan, rulers, sliders)
 */
const {
  zoomLevel,
  setZoomAndScroll,
  startPan,
  panX,
  startDrag,
  isDraggingHorizontal,
  isDraggingVertical,
  isMiddleDragging,
  panY,
  wrapperRef,
  verticalSliderTop,
  horizontalSliderLeft,
  verticalSliderHeight,
  horizontalSliderWidth,
  horizontalRulerMarks,
  verticalRulerMarks,
  onMouseMove,
  mouseX,
  mouseY,
  cursorPosX,
  cursorPosY,
  cursorPosXSameAsImageWidth,
  cursorPosYSameAsImageHeight,
  guideLines,
  cursorPos,
  showCursor,
  onMouseLeave,
  onMouseEnter,
  backgroundModeValues,
  backgroundMode,
  switchBackgroundMode,
  backgroundModePadding,
  viewportPixelateMode,
  switchViewportPixelateMode,
} = useViewportWrapper(useViewportStore(), useImageStore(), useEditorStore(), useUiStore(), contentRef, t)

/**
 * Logic for svg objects
 */
const {
  onClickImageSvg,
  onMouseDownImageSvg,
  onMouseDownSelect,
  selectBox,
  copySelectedSvgObject,
  pasteSvgObjectToCenter,
  duplicateSelectedSvgObject,
  cutSelectedSvgObject,
  deleteSelectedSvgObjects,
} = useSvgObjects(
  useImageStore(),
  useHistoryStore(),
  useViewportStore(),
  useEditorStore(),
  useUiStore(),
  useWorkspaceStore(),
  t
)

/**
 * Logic for the blur tool
 */
const { svgDefsString } = useBlurTool(
  useImageStore(),
  useHistoryStore(),
  useEditorStore(),
  t,
)

/**
 * Logic of the drag-and-drop area
 */
const {
  handleDragOver,
  handleDragLeave,
  handleDrop,
} = useDragAndDropArea(useImageStore(), useEditorStore(), t, router, useUserModeStore(), useWorkspaceStore(), useUiStore(), useViewportStore(), useHistoryStore())

/**
 * Start image analysis
 */
useImageAnalysis(
  useImageStore(),
  useWorkspaceStore(),
  useUiStore(),
  t,
)

/**
 * Whether to show the context menu
 */
const hideContextMenu = computed(() => {
  return editorStore.selectedToolKey !== 'shape' && editorStore.selectedToolKey !== 'text' && editorStore.selectedToolKey !== 'select' && editorStore.selectedToolKey !== 'blur' && editorStore.selectedToolKey !== 'magnifyArea'
})

/**
 * Whether to disable the context menu
 */
const disableContextMenu = computed(() => {
  return imageStore.selectedSvgObjectId === null || editorStore.selectedToolKey === 'magnifyArea'
})

/**
 * Border radius of background for phone frames
 */
const phoneFrameBorderRadius = ref(0)

/**
 * Watch for changes in the frame to determine if it's a phone frame
 */
watch(
  () => imageStore.frame,
  () => {
    const isPhoneFrame = useFrameTool(imageStore, useHistoryStore(), useViewportStore(), t).isPhoneFrame(
      imageStore.frame.type,
    )

    if (isPhoneFrame) {
      phoneFrameBorderRadius.value = Math.floor(Math.min(imageStore.fileDimensions.width, imageStore.fileDimensions.height) * 0.06) // 6% of the smaller dimension + a bit of padding (100% of frame height)
    } else {
      phoneFrameBorderRadius.value = 0
    }
  },
  { immediate: true, deep: true }
)

/**
 * Cursor style
 */
const cursorStyleVars = computed(() => {
  return {
    '--cursor-border': editorConfig.cursorBorder,
  }
})

/**
 * Whether to show the drawing cursor (for brush and background removal tools)
 */
const drawingCursor = computed(() => {
  return (editorStore.selectedToolKey === 'backgroundRemoval' && editorStore.selectedTabPerTool['backgroundRemoval'] === 'manual') || editorStore.selectedToolKey === 'brush'
})

/**
 * Cursor style based on the selected tool
 */
const cursorStyle = computed(() => {
  let cursor = 'default'
  if (drawingCursor.value && !uiStore.cursorOverViewportSettings) {
    cursor = 'none'
  } else if (editorStore.selectedToolKey === 'backgroundRemoval' && editorStore.selectedTabPerTool['backgroundRemoval'] === 'auto') {
    cursor = 'crosshair'
  }
  return cursor
})

</script>

<template>
  <div class="viewport-wrapper" id="viewport" @mousedown="onMouseDownSelect" @dragover="handleDragOver"
    @dragleave="handleDragLeave" @drop="handleDrop" @mouseleave="onMouseLeave" @mouseenter="onMouseEnter"
    :style="{ cursor: cursorStyle }">
    <LoadingSpinner />

    <div class="viewport-content-wrapper" ref="wrapperRef" @wheel.passive="setZoomAndScroll" @mousedown="startPan"
      @mousemove="onMouseMove" :class="{
        'middle-dragging': isMiddleDragging,
        'hide': uiStore.isApplying,
      }" :style="{
        '--viewport-wrapper-background': backgroundModeValues[backgroundMode],
      }">
      <ContextMenu :items="[
        {
          label: $t('contextMenu.paste'),
          action: pasteSvgObjectToCenter,
          disabled: !imageStore.clipboardSvgObject || editorStore.selectedToolKey === 'magnifyArea',
          hide: hideContextMenu,
        },
        {
          label: $t('contextMenu.copy'),
          action: copySelectedSvgObject,
          disabled: disableContextMenu,
          hide: hideContextMenu,
        },
        {
          label: $t('contextMenu.cut'),
          action: cutSelectedSvgObject,
          disabled: disableContextMenu,
          hide: hideContextMenu,
        },
        {
          label: $t('contextMenu.duplicate'),
          action: duplicateSelectedSvgObject,
          disabled: disableContextMenu,
          hide: hideContextMenu,
        },
        {
          label: $t('contextMenu.delete'),
          action: () => deleteSelectedSvgObjects(t),
          disabled: disableContextMenu && imageStore.selectedSvgObjectIds.length === 0,
          hide: hideContextMenu,
        },
      ]">
        <div id="viewport-content" :class="{ 'hide': uiStore.isLoading }" class="viewport-content" ref="contentRef"
          :style="{
            transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
            boxShadow: backgroundMode === 'normal' ? 'var(--box-shadow-content)' : 'none',
            '--phone-frame-border-radius': phoneFrameBorderRadius + 'px',
          }">
          <img v-if="imageStore.fileType === 'image' || imageStore.showPdfAsImage" ref="imageRef"
            class="image-canvas" />
          <div v-else-if="imageStore.fileType === 'pdf'" ref="pdfContainerRef" class="pdf-viewer"></div>

          <!-- Canvas for artifacts -->
          <canvas v-if="imageStore.fileType === 'image'" ref="overlayCanvasRef" class="overlay-canvas"></canvas>

          <svg ref="frameSvgRef" class="frame-svg"></svg>

          <!-- Brush Tool Canvas -->
          <BrushToolCanvas :style="{
            pointerEvents: editorStore.selectedToolKey === 'brush' ? 'auto' : 'none'
          }" />

          <!-- SVG objects -->
          <svg ref="svgRef" class="image-svg" id="image-svg" xmlns="http://www.w3.org/2000/svg"
            :width="imageStore.fileDimensions.width" :height="imageStore.fileDimensions.height"
            @mousedown="onMouseDownImageSvg" @click="onClickImageSvg">
            <!-- DEFS -->
            <!-- // UPDATE svg string -->
            <defs>
              <!-- Arrows -->
              <marker id="arrow-end" markerWidth="10" markerHeight="10" refX="3" refY="3" orient="auto"
                markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L6,3 z" fill="context-stroke" />
              </marker>
            </defs>

            <!-- Dynamic SVG Definitions -->
            <defs v-html="svgDefsString" />

            <template v-for="(img, index) in imageStore.blurImages" :key="index">
              <g v-html="img"></g>
            </template>

            <SvgObjectWrapper v-for="object in imageStore.svgObjects" :key="object.id" :objectId="object.id" />

            <SvgObjectWrapper v-for="object in imageStore.blurObjects" :key="object.id" :objectId="object.id" />

            <rect v-if="selectBox" :x="selectBox.x" :y="selectBox.y" :width="selectBox.width" :height="selectBox.height"
              fill="var(--editor-highlight-with-opacity-c)" />
          </svg>

          <CropTool v-if="editorStore.selectedToolKey === 'crop'" />
          <PresetCropTool v-if="
            editorStore.selectedToolKey === 'preset' && editorStore.selectedSubToolKey === 'crop'" />

          <BackgroundRemovalCanvas v-if="editorStore.selectedToolKey === 'backgroundRemoval'" :style="{
            pointerEvents: editorStore.selectedToolKey === 'backgroundRemoval' ? 'auto' : 'none'
          }" />
        </div>
      </ContextMenu>
    </div>

    <!-- Contrast mode -->
    <div class="contrast-mode-wrapper" :style="{
      '--viewport-wrapper-background-top': backgroundModePadding,
    }" @mouseenter="uiStore.cursorOverViewportSettings = true"
      @mouseleave="uiStore.cursorOverViewportSettings = false">
      <ItemTip advance :text="t('tools.viewportBackgroundMode.tip.text')"
        :title="$t('tools.viewportBackgroundMode.tip.title')" position="bottom-left"
        class="contrast-mode-button button-clickable" @click="switchBackgroundMode()">
        <!-- Change icon based on mode -->
        <BaseIcon :name="backgroundMode === 'normal'
          ? 'IconNormalMode'
          : backgroundMode === 'lightContrast'
            ? 'IconLightMode'
            : 'IconDarkMode'" size="26" />
      </ItemTip>
    </div>

    <!-- Pixelate Mode -->
    <div class="pixelate-mode-wrapper" :style="{
      '--viewport-wrapper-background-top': backgroundModePadding,
    }" @mouseenter="uiStore.cursorOverViewportSettings = true"
      @mouseleave="uiStore.cursorOverViewportSettings = false">
      <ItemTip advance
        :text="(imageStore.fileType === 'pdf' && !imageStore.showPdfAsImage) ? t('tools.viewportPixelateMode.tipDisabled.text') : t('tools.viewportPixelateMode.tip.text')"
        :title="$t('tools.viewportPixelateMode.tip.title')" position="bottom-left"
        class="pixelate-mode-button button-clickable" @click="switchViewportPixelateMode()"
        :class="{ 'pixelate-mode-button-hover': !(imageStore.fileType === 'pdf' && !imageStore.showPdfAsImage) }">
        <!-- Change icon based on mode -->
        <BaseIcon :class="{ disabled: imageStore.fileType === 'pdf' && !imageStore.showPdfAsImage }" :name="viewportPixelateMode === 'auto'
          ? 'IconAutoMode'
          : viewportPixelateMode === 'always'
            ? 'IconPixelsOnMode'
            : 'IconPixelsOffMode'" size="26" />
      </ItemTip>
    </div>

    <!-- Warning List -->
    <WarningList class="warning-list" :style="{
      '--viewport-wrapper-background-top': backgroundModePadding,
    }" @mouseenter="uiStore.cursorOverViewportSettings = true"
      @mouseleave="uiStore.cursorOverViewportSettings = false" />

    <!-- Cursor -->
    <div
      v-if="showCursor && ((editorStore.selectedToolKey === 'backgroundRemoval' && editorStore.selectedTabPerTool['backgroundRemoval'] === 'manual') || editorStore.selectedToolKey === 'brush') && !uiStore.cursorOverViewportSettings"
      class="custom-cursor" :style="{
        ...cursorStyleVars,
        width: editorStore.cursorSize * zoomLevel + 'px',
        height: editorStore.cursorSize * zoomLevel + 'px',
        left: cursorPos.x + 'px',
        top: cursorPos.y + 'px'
      }" :class="{
        isAltResizing: editorStore.isCursorResizing,
      }"></div>

    <!-- Sliders -->
    <div class="vertical-slider-wrapper">
      <div class="slider" @mousedown="(e) => startDrag('y', e)" :style="{
        top: verticalSliderTop + 'px',
        height: verticalSliderHeight + 'px',
      }" :class="{ active: isDraggingVertical }"></div>
    </div>

    <div class="horizontal-slider-wrapper">
      <div class="slider" @mousedown="(e) => startDrag('x', e)" :style="{
        left: horizontalSliderLeft + 'px',
        width: horizontalSliderWidth + 'px',
      }" :class="{ active: isDraggingHorizontal }"></div>
    </div>

    <!-- Rulers -->
    <div v-if="uiStore.rulersEnabled" class="horizontal-ruler-wrapper">
      <div class="ruler">
        <div v-for="(mark, i) in horizontalRulerMarks" :key="'h' + i"
          :class="['ruler-mark', 'horizontal', { 'sub-mark': mark.isSub }]" :style="{ left: mark.left + 'px' }">
          <span v-if="!mark.isSub" class="ruler-label">{{ mark.label }}</span>
        </div>
        <div v-if="mouseX !== null" class="ruler-cursor-mark horizontal" :style="{ left: mouseX + 'px' }">
          <span class="ruler-cursor-label horizontal" :class="{ 'active': cursorPosXSameAsImageWidth }">{{ cursorPosX
          }}</span>
        </div>

      </div>
    </div>
    <div v-if="uiStore.rulersEnabled" class="vertical-ruler-wrapper">
      <div class="ruler">
        <div v-for="(mark, i) in verticalRulerMarks" :key="'v' + i"
          :class="['ruler-mark', 'vertical', { 'sub-mark': mark.isSub }]" :style="{ top: mark.top + 'px' }">
          <span v-if="!mark.isSub" class="ruler-label">{{ mark.label }}</span>
        </div>
        <div v-if="mouseY !== null" class="ruler-cursor-mark vertical" :style="{ top: mouseY + 'px' }">
          <span class="ruler-cursor-label vertical" :class="{ 'active': cursorPosYSameAsImageHeight }">{{ cursorPosY
          }}</span>
        </div>
      </div>
    </div>
    <div v-if="uiStore.rulersEnabled" class="ruler-padding"></div>

    <!-- Universal guide line rendered as a rotated div -->
    <div v-for="(line, i) in guideLines" :key="i" class="guide-line-rotated" :style="{
      transform: `translate(${line.x * zoomLevel + panX}px, ${line.y * zoomLevel + panY}px) rotate(${line.angle}deg)`,
    }">
    </div>
  </div>
</template>

<style scoped>
.viewport-wrapper {
  position: relative;
  width: 100%;
  height: calc(100% - 30px - 20px);
  display: flex;
  z-index: var(--z-index-viewport);
  cursor: none;
}

.viewport-content-wrapper {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  overflow: hidden;
  z-index: var(--z-index-viewport);
  background: var(--viewport-wrapper-background);
}

.viewport-content {
  position: relative;
  transform-origin: top left;
  display: block;

  border-radius: var(--phone-frame-border-radius);

  /* Background - Checkerboard */
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><rect width='10' height='10' fill='%23ccc'/><rect x='10' width='10' height='10' fill='%23fff'/><rect y='10' width='10' height='10' fill='%23fff'/><rect x='10' y='10' width='10' height='10' fill='%23ccc'/></svg>");
  background-repeat: repeat;
  background-size: 20px 20px;
}

.viewport-content.hide {
  background: none;
}

.image-canvas,
.image-svg,
.frame-svg,
.overlay-canvas,
.pdf-viewer,
.overlay-image-canvas {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
}

.overlay-canvas {
  opacity: 0;
  animation: overlayBlink 2s infinite;
  /* image-rendering: pixelated; */
}

@keyframes overlayBlink {
  0% {
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

/* Contrast Mode */
.contrast-mode-wrapper {
  position: absolute;
  top: var(--viewport-wrapper-background-top);
  right: 15px;
  height: 36px;
  width: 36px;
  border-radius: 8px;
  background: var(--secondary-c);
  z-index: var(--z-index-sliders);
  color: var(--primary-c);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pixelate-mode-wrapper {
  position: absolute;
  top: var(--viewport-wrapper-background-top);
  right: 60px;
  height: 36px;
  width: 36px;
  border-radius: 8px;
  background: var(--secondary-c);
  z-index: var(--z-index-sliders);
  color: var(--primary-c);
  display: flex;
  align-items: center;
  justify-content: center;
}

.contrast-mode-button,
.pixelate-mode-button {
  padding: 2px;
  border-radius: 7px;
  border: 1px solid transparent;
}

.contrast-mode-button-hover:hover,
.pixelate-mode-button-hover:hover {
  border: var(--border-ui);
  cursor: pointer;
}

/* .contrast-mode-button.selected,
.pixelate-mode-button.selected {
  background-color: var(--background-c);
} */

/* Warning List */
.warning-list {
  position: absolute;
  top: calc(var(--viewport-wrapper-background-top) + 46px);
  right: 15px;
  z-index: var(--z-index-sliders);
}

/* Sliders */
.vertical-slider-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  width: var(--ruler-size);
  height: calc(100% - var(--ruler-size));
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  z-index: var(--z-index-sliders);
}

.horizontal-slider-wrapper {
  position: absolute;
  left: calc(var(--ruler-size) * -1);
  bottom: 0;
  width: 100%;
  height: var(--ruler-size);
  overflow: hidden;
  display: flex;
  align-items: center;
  z-index: var(--z-index-sliders);
}

.slider {
  position: absolute;
  background: var(--scrollbar-c);
  border: solid 1px var(--border-c);
  border-radius: 10px;
}

.slider.active,
.slider:hover {
  border: solid 1px var(--primary-c);
  cursor: pointer;
}

.vertical-slider-wrapper .slider {
  height: 200px;
  width: 70%;
  top: 50%;
}

.horizontal-slider-wrapper .slider {
  width: 200px;
  height: 70%;
  left: 50%;
  /* Center slider horizontally */
  margin-left: var(--ruler-size);
}

.middle-dragging {
  cursor: move;
}

/* Rulers */
.horizontal-ruler-wrapper {
  position: absolute;
  left: 0px;
  top: 0;
  background-color: var(--secondary-c);
  width: 100%;
  height: var(--ruler-size);
  z-index: var(--z-index-rulers);
  overflow: hidden;
}

.vertical-ruler-wrapper {
  position: absolute;
  top: 0px;
  left: 0;
  background-color: var(--secondary-c);
  width: var(--ruler-size);
  height: 100%;
  z-index: var(--z-index-rulers);
  overflow: hidden;
}

.ruler-padding {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--ruler-size);
  height: var(--ruler-size);
  background: var(--secondary-c);
  z-index: var(--z-index-rulers-padding);
}

.ruler-mark.horizontal {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background-color: var(--border-c);
}

.ruler-mark.vertical {
  position: absolute;
  left: 0;
  height: 2px;
  width: 100%;
  background-color: var(--border-c);
}

.ruler-label {
  position: absolute;
  color: var(--text-c);
  font-size: 10px;
  transform: translateX(2px);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0.7;
}

.ruler-mark.horizontal .ruler-label {
  top: 0px;
  left: 2px;
}

.ruler-mark.vertical .ruler-label {
  top: 2px;
  left: 0px;
  writing-mode: vertical-rl;
  transform: translateY(2px) rotate(180deg);
}

/* SubMarks */
.ruler-mark.sub-mark.horizontal {
  height: 30%;
  background-color: var(--border-c);
  top: 70%;
}

.ruler-mark.sub-mark.vertical {
  width: 30%;
  background-color: var(--border-c);
  left: 70%;
}

/* Cursor Marks */
.ruler-cursor-mark.horizontal {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background-color: var(--primary-c);
  z-index: 2;
  pointer-events: none;
}

.ruler-cursor-mark.vertical {
  position: absolute;
  left: 0;
  height: 2px;
  width: 100%;
  background-color: var(--primary-c);
  z-index: 2;
  pointer-events: none;
}

/* Ruler cursor label */
.ruler-cursor-label {
  position: absolute;
  font-size: 10px;
  color: var(--primary-c);
  background: var(--background-c);
  border-radius: 4px;
  pointer-events: none;
  opacity: 0.8;
}

.ruler-cursor-label.horizontal {
  top: 0;
  left: 4px;
  padding: 1px 4px;
}

.ruler-cursor-label.vertical {
  top: 4px;
  left: 0;
  padding: 4px 1px;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}

.ruler-cursor-label.active {
  background: var(--primary-c);
  color: var(--background-c);
}

.guide-line-rotated {
  position: absolute;
  width: 1000000px;
  height: 1px;
  background-color: var(--editor-highlight-align-c);
  opacity: 0.6;
  left: -500000px;
  top: 0;
  pointer-events: none;
  z-index: var(--z-index-guide-lines);
}

.custom-cursor {
  position: absolute;
  border: 1px solid transparent;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: var(--z-index-cursors);
  border-color: var(--cursor-border);
}

.isAltResizing {
  background: red;
}
</style>
