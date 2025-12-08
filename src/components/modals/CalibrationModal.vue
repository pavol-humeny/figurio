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
  calibrationFactor,
  cardWidthPx,
  cardHeightPx,
  resetCalibration,
  minCalibrationFactor,
  maxCalibrationFactor,
  stepCalibrationFactor,
} = useCalibrationModal(useViewportStore());

</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="calibration-modal-overlay modal-overlay" @mousedown.self="closeCalibrationModal">
      <div class="modal-box">
        <div class="title-wrapper">
          <BaseIcon name="IconCalibration" size="28" color="var(--primary-c)" />
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
          <div class="instruction-wrapper">
            <p>{{ $t('calibration.instructions.step4') }}</p>
          </div>
        </div>

        <!-- Credit card visual -->
        <div class="card-container">
          <div class="credit-card" :style="{ width: cardWidthPx + 'px', height: cardHeightPx + 'px' }"></div>
        </div>

        <!-- Slider -->
        <div class="slider-wrapper">
          <input type="range" :min="minCalibrationFactor" :max="maxCalibrationFactor" :step="stepCalibrationFactor"
            v-model.number="calibrationFactor" @dblclick="resetCalibration" />
          <span>{{ round(calibrationFactor, 3) }} ×</span>
        </div>

        <div class="button-wrapper">
          <DefaultButton :text="$t('calibration.closeButton.text')" @click="closeCalibrationModal" />
          <DefaultButton :text="$t('calibration.button.text')" @click="calibrate" main />
        </div>
      </div>
    </div>
  </Teleport>
</template>


<style scoped>
.calibration-modal-overlay {
  z-index: var(--z-index-privacy);
}

.modal-box {
  background: var(--background-c);
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
  color: var(--primary-c);
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
  align-items: center;
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

/* Slider for WebKit + Firefox */
/* Track - WebKit (Chrome, Edge, Safari) */
input[type='range']::-webkit-slider-runnable-track {
  background-color: var(--secondary-c);
  border-radius: 10px;
  height: 10px;
}

/* Thumb - WebKit */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--primary-c);
  border-radius: 50%;
  cursor: pointer;
  margin-top: -5px;
}

/* Track - Firefox */
input[type="range"]::-moz-range-track {
  background-color: var(--secondary-c);
  border-radius: 10px;
  height: 10px;
}

/* Thumb - Firefox */
input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: var(--primary-c);
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

/* Fix for Firefox focus outline */
input[type="range"]::-moz-focus-outer {
  border: 0;
}
</style>
