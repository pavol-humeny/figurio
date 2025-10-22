<script setup>
import { useCalibrationModal } from '@/composables/modals/useCalibrationModal';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import DefaultButton from '@/components/common/DefaultButton.vue';
import { useViewportStore } from '@/stores/viewportStore';
import { useMath } from '@/composables/common/useMath';

const { round } = useMath();

/**
 * Logic of the calibration modal state
 */
const {
  isVisible,
  closeCalibrationModal,
  calibrate,
  cardWidthPx,
  cardHeightPx,
  minWidthCm,
  maxWidthCm,
  PxPerCm,
  resetCalibration,
  originalCardWidthPx
} = useCalibrationModal(useViewportStore());
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="calibration-modal-overlay" @mousedown.self="closeCalibrationModal">
      <div class="modal-box">
        <div class="title-wrapper">
          <BaseIcon name="IconCalibration" size="28" color="var(--text-c)" />
          <p>{{ $t('calibration.title') }}</p>
        </div>

        <div class="description-wrapper">
          <p>{{ $t('calibration.description') }}</p>
        </div>

        <div class="instructions-wrapper">
          <p>{{ $t('calibration.instructions.title') }}</p>
          <div class="instruction-wrapper">
            <p>{{ $t('calibration.instructions.step1') }}</p>
          </div>
          <div class="instruction-wrapper">
            <p>{{ $t('calibration.instructions.step2') }}</p>
          </div>
          <div class="instruction-wrapper">
            <p>{{ $t('calibration.instructions.step3') }}</p>
          </div>
        </div>

        <!-- Credit card visual -->
        <div class="card-container">
          <div class="credit-card" :style="{ width: cardWidthPx + 'px', height: cardHeightPx + 'px' }"></div>
        </div>

        <!-- Slider -->
        <div class="slider-wrapper">
          <input type="range" :min="minWidthCm * PxPerCm" :max="maxWidthCm * PxPerCm" step="1" v-model="cardWidthPx"
            @dblclick="resetCalibration" />
          <span>{{ round(cardWidthPx / originalCardWidthPx, 2) }} x</span>
        </div>

        <div class="button-wrapper">
          <DefaultButton :text="$t('calibration.button.text')" @click="calibrate" />
        </div>
      </div>
    </div>
  </Teleport>
</template>


<style scoped>
.calibration-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--overlay-c);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-index-privacy);
}

.modal-box {
  background: var(--secondary-c);
  border: var(--border-modal);
  padding: 20px 25px;
  border-radius: 20px;
  width: 60%;
  box-shadow: var(--box-shadow-ui);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.title-wrapper {
  width: 100%;
  display: flex;
  justify-content: left;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.title-wrapper p {
  font-size: var(--title-font-size);
  font-weight: var(--title-font-weight);
}

.description-wrapper {
  width: 100%;
  display: flex;
  justify-content: left;
  margin-bottom: 10px;
}

.instructions-wrapper {
  width: 100%;
  display: flex;
  justify-content: left;
  flex-direction: column;
  gap: 5px;
}

.instructions-wrapper p {
  color: var(--primary-c);
  margin-bottom: 5px;

}

.instruction-wrapper {
  margin-left: 15px;
  display: flex;
}

.instruction-wrapper p {
  color: var(--text-c);
}

/* add dots at beginning */

.instruction-wrapper::before {
  content: '•';
  font-weight: var(--bold-font-weight);
  margin-right: 5px;
  color: var(--text-c);
}

.button-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
}

.card-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 15px 0;
}

.credit-card {
  background: var(--primary-c);
  border-radius: 8px;
  /* box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); */
}

.slider-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.slider-wrapper input[type="range"] {
  width: 80%;
}

/* slider track */
input[type='range']::-webkit-slider-runnable-track {
  background-color: var(--background-c);
  border-radius: 10px;
  height: 10px;
}
</style>
