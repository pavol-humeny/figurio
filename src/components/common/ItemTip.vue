<script setup>
/**
 * @file: ItemTip.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: A reusable tooltip component that can be attached to any element. The tooltip supports different positions, advanced layout with title and shortcut, and an optional video preview for tools. The tooltip visibility is managed through a composable, and it can be customized with various props.
 */
import { useItemTip } from '@/composables/common/useItemTip'
import { useUiStore } from '@/stores/uiStore'
import { computed, ref } from 'vue'
import { useVideoLoader } from '@/composables/modals/useVideoLoader'
import { useEditorStore } from '@/stores/editorStore'
const { getVideo } = useVideoLoader()
const uiStore = useUiStore()

/**
 * @typedef {Object} ItemTipProps
 * @property {string} text - Tooltip text (required)
 * @property {string} [position='top'] - Tooltip position (e.g. 'top', 'bottom-right')
 * @property {boolean} [advance=false] - Whether to use advanced layout with title and shortcut
 * @property {boolean} [advanceTool=false] - Whether this is an advanced tooltip for a tool (includes video preview)
 * @property {string} [toolKey=''] - Key of the tool for loading the video preview (required if advanceTool is true)
 * @property {string} [title=''] - Title text for advanced tooltip
 * @property {string} [shortcut=''] - Shortcut text for advanced tooltip
 * @property {number} [delay] - Optional delay in milliseconds before showing the tooltip
 */

/** @type {ItemTipProps} */
const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: 'top',
  },
  advance: {
    type: Boolean,
    default: false,
  },
  advanceTool: {
    type: Boolean,
    default: false,
  },
  toolKey: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  shortcut: {
    type: String,
    default: '',
  },
  delay: {
    type: Number,
    default: undefined,
  },
})

/**
 * Logic of the item tooltip
 */
const {
  isVisible,
  wrapperRef,
  itemTipStyle,
  handleMouseEnter,
  handleMouseLeave,
  tipRef,
  openToolVideo,
} = useItemTip({
  position: props.position,
  text: props.text,
  delay: props.delay,
}, useUiStore(), useEditorStore())

/**
 * Whether to show the tooltip (text must be non-empty)
 */
const showTip = computed(() => props.text !== '')

/**
 * Reference to the video element for advanced tooltips, used to control playback and open the video in a modal when clicked
 */
const videoRef = ref(null)
</script>

<template>
  <div class="item-tip" ref="wrapperRef" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <slot></slot>

    <teleport to="body">
      <Transition name="fade">
        <div v-if="isVisible && uiStore.isItemTipVisible && showTip" :style="itemTipStyle" ref="tipRef"
          @mouseleave="handleMouseLeave" :class="['item-tip-bubble', props.position,
            { 'item-tip-advance-tool': props.advanceTool }]">
          <template v-if="props.advanceTool">
            <div class="tip-video">
              <video ref="videoRef" class="video-preview" :src="getVideo(props.toolKey)" autoplay loop muted playsinline
                @click="openToolVideo(props.toolKey)"></video>
            </div>
            <div class="item-tip-title-row">
              <span class="tip-title">{{ props.title }}</span>
              <span v-if="props.shortcut" class="tip-shortcut">{{ props.shortcut }}</span>
            </div>
            <div class="tip-description">{{ props.text }}</div>
          </template>

          <template v-else-if="props.advance">
            <div class="item-tip-title-row">
              <span class="tip-title">{{ props.title }}</span>
              <span v-if="props.shortcut" class="tip-shortcut">{{ props.shortcut }}</span>
            </div>
            <div class="tip-description">{{ props.text }}</div>
          </template>

          <template v-else>
            {{ props.text }}
          </template>
          <div v-if="!props.advanceTool" class="item-tip-arrow" :class="props.position"></div>
        </div>
      </Transition>
    </teleport>
  </div>
</template>

<style scoped>
.item-tip-bubble {
  background: var(--secondary-c);
  color: var(--text-c);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: var(--tip-font-size);
  box-shadow: var(--box-shadow-ui);
  text-align: center;
}

.item-tip-advance-tool {
  text-align: left;
  padding: 10px;
}

.item-tip-bubble {
  position: absolute;
  transform: translate(-50%, -50%);
}

.item-tip-bubble.top {
  transform: translate(-50%, -100%);
}

.item-tip-bubble.top-right {
  transform: translate(0, -100%);
}

.item-tip-bubble.top-left {
  transform: translate(-100%, -100%);
}

.item-tip-bubble.bottom {
  transform: translate(-50%, 0);
}

.item-tip-bubble.left {
  transform: translate(-100%, -50%);
}

.item-tip-bubble.right {
  transform: translate(0, -50%);
}

.item-tip-bubble.bottom-right {
  transform: translate(0, 0);
}

.item-tip-bubble.bottom-left {
  transform: translate(-100%, 0);
}

.item-tip-arrow {
  position: absolute;
  width: 0;
  height: 0;
}

.item-tip-arrow.top {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--secondary-c);
}

.item-tip-arrow.top-right {
  bottom: -6px;
  left: 20px;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--secondary-c);
}

.item-tip-arrow.top-left {
  bottom: -6px;
  right: 20px;
  transform: translateX(50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--secondary-c);
}

.item-tip-arrow.bottom {
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid var(--secondary-c);
}

.item-tip-arrow.left {
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid var(--secondary-c);
}

.item-tip-arrow.right {
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid var(--secondary-c);
}

.item-tip-arrow.bottom-right {
  left: 20px;
  top: -6px;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid var(--secondary-c);
}

.item-tip-arrow.bottom-left {
  right: 20px;
  top: -6px;
  transform: translateX(50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid var(--secondary-c);
}

/* Advance tip */
.item-tip-title-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;

  font-size: calc(var(--tip-font-size) + 2px);
  margin-bottom: 4px;
  white-space: nowrap;
}

.tip-title {
  font-weight: var(--tip-title-font-weight);
  color: var(--text-c);
}

.tip-shortcut {
  background-color: var(--border-c);
  color: var(--text-c);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
  font-family: monospace;
}

.tip-description {
  color: var(--text-c);
  font-size: var(--tip-font-size);
  text-align: left;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Advance tool tip */
.tip-video {
  aspect-ratio: 16 / 9;
  background: var(--background-c);
  border-radius: 6px;
  margin-bottom: 8px;
  overflow: hidden;
}

.video-preview {
  width: 100%;
  height: 100%;
  object-fit: fill;
  background: var(--background-c);
  cursor: pointer;

}
</style>
