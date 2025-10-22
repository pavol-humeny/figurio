<script setup>
import { useCalibrationModal } from '@/composables/modals/useCalibrationModal';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import DefaultButton from '@/components/common/DefaultButton.vue';

/**
 * Logic of the calibration modal state
 */
const {
  isVisible,
  closeCalibrationModal,
  calibrate
} = useCalibrationModal();
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
</style>
