<script setup>
import { useWarningList } from '@/composables/modals/useWarningList'
import BaseIcon from '../icons/BaseIcon.vue'
import ItemTip from '../common/ItemTip.vue'
import { computed } from 'vue'
import { useImageStore } from '@/stores/imageStore.js'
import { useUiStore } from '@/stores/uiStore'

const imageStore = useImageStore()

const {
  // warnings,
  // expandedIds,
  removeWarning,
  openByClick,
  closeByArrow,
} = useWarningList(useImageStore(), useUiStore())

/**
 * Computed properties for warnings and expanded IDs from imageStore
 */
const activeWarnings = computed(() => imageStore.imageWarnings)
const expandedIds = computed(() => imageStore.expandedImageWarningIds)

/**
 * Get color based on warning type
 * @param {string} type - Warning type ('info', 'error', 'warning')
 * @returns {string} - Corresponding color value
 */
const getColor = (type) => {
  switch (type) {
    case 'info': return 'var(--notification-background-c)'
    case 'error': return 'var(--error-background-c)'
    default: return 'var(--warning-background-c)'
  }
}

/**
 * Get background color based on warning type
 * @param {string} type - Warning type ('info', 'error', 'warning')
 * @returns {string} - Corresponding background color value
 */
const getBackgroundColor = (type) => {
  switch (type) {
    case 'info': return 'var(--notification-c)'
    case 'error': return 'var(--error-c)'
    default: return 'var(--warning-c)'
  }
}

/**
 * Get icon name based on warning type
 * @param {string} type - Warning type ('info', 'error', 'warning')
 * @returns {string} - Corresponding icon component name
 */
const getMessageIcon = (type) => {
  switch (type) {
    case 'info': return 'IconInfo'
    case 'error': return 'IconError'
    default: return 'IconWarning'
  }
}
</script>

<template>
  <div class="warning-list" id="warning-list">
    <div v-for="warning in activeWarnings" :key="warning.id" class="warning-item" @click="openByClick(warning.id)"
      :class="{ collapsed: !expandedIds.has(warning.id) }"
      :style="{ color: getColor(warning.type), backgroundColor: getBackgroundColor(warning.type) }">

      <ItemTip advance :text="$t(warning.tipText)" :title="$t(warning.tipTitle)" position="bottom-left"
        class="warning-tip-wrapper">

        <!-- Arrow icon -->
        <button v-if="expandedIds.has(warning.id)" class="arrow-button" @click.stop="closeByArrow(warning.id)">
          <BaseIcon name="IconArrowRight" size="23" :color="getColor(warning.type)" />
        </button>

        <!-- Message icon -->
        <BaseIcon :name="getMessageIcon(warning.type)" size="20" :color="getColor(warning.type)" />

        <!-- Message text -->
        <div class="warning-text" v-if="expandedIds.has(warning.id)" :style="{ color: getColor(warning.type) }">
          <p>{{ $t(warning.message) }}</p>
        </div>

        <!-- Close button -->
        <button v-if="expandedIds.has(warning.id)" class="warning-close-button" @click.stop="removeWarning(warning.id)"
          :style="{ color: getColor(warning.type) }">
          ✕
        </button>
      </ItemTip>
    </div>
  </div>
</template>

<style scoped>
.warning-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

.warning-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: width 0.2s ease;
  height: 36px;
  width: auto;
}

.warning-tip-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Collapsed state: only icon, centered */
.warning-item.collapsed {
  justify-content: center;
  width: 36px;
}

.arrow-button {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.warning-text {
  flex: 1;
}

.warning-close-button {
  border: none;
  background: transparent;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 3px;
}
</style>
