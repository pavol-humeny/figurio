<script setup>
/**
 * @file: SelectPdfPageModal.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { ref, watch } from 'vue'
import { useGeneralModal } from '@/composables/modals/useGeneralModal'
import { useI18n } from 'vue-i18n'
import NumberSpinner from '@/components/common/NumberSpinner.vue'

const { t } = useI18n()
const { payload } = useGeneralModal()

/**
 * Selected page number (default 1)
 */
const selectedPage = ref(1)

/**
 * Set default to 1 when modal is shown
 */
watch(
  () => payload.value?.numberOfPages,
  (newVal) => {
    if (newVal) selectedPage.value = 1
  },
  { immediate: true }
)

/**
 * Syncs selected page with modal payload
 */
watch(selectedPage, (value) => {
  if (payload.value) payload.value = { ...payload.value, selectedPage: value },
    { immediate: true }
})
</script>

<template>
  <div class="select-pdf-page-modal">
    <div class="title-wrapper">
      <p>{{ t('imageStore.modal.selectPdfPage.title') }}</p>
    </div>
    <p class="modal-text">{{ t('imageStore.modal.selectPdfPage.message') }}</p>
    <div class="page-selection">
      <NumberSpinner v-model="selectedPage" :min="1" :max="payload?.numberOfPages || 1" :step="1"
        :style="{ width: '100px' }" />

      <p class="page-range">
        {{ t('imageStore.modal.selectPdfPage.pageRange', { from: 1, to: payload?.numberOfPages || 1 }) }}
      </p>

    </div>
  </div>
</template>

<style scoped>
.select-pdf-page-modal {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px 0;
}

.modal-text {
  font-size: var(--text-font-size);
}

.page-selection {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-range {
  font-size: var(--text-font-size);
  color: var(--text-secondary-c);
}


.title-wrapper {
  width: 100%;
  display: flex;
  justify-content: left;
}

.title-wrapper p {
  font-size: var(--title-font-size);
  font-weight: var(--title-font-weight);
}
</style>
