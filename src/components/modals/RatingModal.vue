<script setup>
/**
 * @file: RatingModal.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Modal component for rating the application after export.
 */
import { useRatingModal } from '@/composables/modals/useRatingModal'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import DefaultButton from '@/components/common/DefaultButton.vue'
import { useShaking } from '@/composables/common/useShaking'
import { useUiStore } from '@/stores/uiStore'
import { useEditorStore } from '@/stores/editorStore'

/**
 * Logic of the shaking animation (used when clicking outside modal)
 */
const { isShaking, triggerShake } = useShaking()

/**
 * Logic of the rating modal state and actions
 */
const {
  isVisible,
  rating,
  feedback,
  setRating,
  submitFeedback,
  closeRatingModal,
  isSubmitDisabled
} = useRatingModal(useUiStore(), useEditorStore())

/**
 * Generate array of 5 stars
 */
const stars = [1, 2, 3, 4, 5]
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="rating-modal-overlay modal-overlay" @click.self="triggerShake">
      <div class="modal-box" :class="{ shake: isShaking }">
        <!-- Title -->
        <div class="title-wrapper">
          <p>{{ $t('tools.export.rating.title') }}</p>
        </div>

        <!-- Subtitle -->
        <p class="subtitle">
          {{ $t('tools.export.rating.subtitle') }}
        </p>

        <!-- Stars -->
        <div class="stars-wrapper">
          <BaseIcon v-for="star in stars" :key="star" name="IconStar" size="36"
            :color="star <= rating ? '#FFC107' : 'var(--border-c)'" class="star" @click="setRating(star)" />
        </div>

        <!-- Feedback -->
        <div class="feedback-wrapper">
          <p>{{ $t('tools.export.rating.feedbackLabel') }}</p>
          <textarea v-model="feedback" :placeholder="$t('tools.export.rating.placeholder')"></textarea>
        </div>

        <!-- Buttons -->
        <div class="button-wrapper">
          <DefaultButton :text="$t('tools.export.rating.skip')" @click="closeRatingModal" onlyText />
          <DefaultButton :text="$t('tools.export.rating.submit')" @click="submitFeedback" main
            :disabled="isSubmitDisabled" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.rating-modal-overlay {
  z-index: var(--z-index-modal);
  background: var(--background-overlay-modal);
  backdrop-filter: var(--backdrop-filter-modal);
}

.modal-box {
  background: var(--background-c);
  border: var(--border-modal);
  padding: 22px 26px;
  border-radius: 20px;
  width: 500px;
  box-shadow: var(--box-shadow-ui);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* Title */
.title-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.title-wrapper p {
  font-size: var(--title-font-size);
  font-weight: var(--title-font-weight);
  color: var(--primary-c);
}

/* Subtitle */
.subtitle {
  font-size: var(--text-font-size);
  color: var(--text-secondary-c);
  text-align: center;
}

/* Stars */
.stars-wrapper {
  display: flex;
  gap: 10px;
}

.star {
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.star:hover {
  transform: scale(1.1);
}

/* Feedback */
.feedback-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 15px;
  text-align: center;
}

.feedback-wrapper p {
  font-size: var(--subtitle-font-size);
  font-weight: var(--subtitle-font-weight);
}

textarea {
  width: 100%;
  min-height: 80px;
  border-radius: 10px;
  border: 1px solid var(--border-c);
  padding: 8px 10px;
  resize: none;
  font-family: inherit;
}

/* Buttons */
.button-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 8px;
}
</style>
