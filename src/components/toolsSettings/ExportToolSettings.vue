<script setup>
import { useExportToolSettings } from '@/composables/toolsSettings/useExportToolSettings';

const {
  isVisible,
  closeExportToolSettings,
} = useExportToolSettings();
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="export-overlay">
      <div class="export-box">
        <h2>{{ $t('tools.export.settings.general.title') }}</h2>
        <button @click="closeExportToolSettings">
          {{ $t('tools.export.settings.general.cancelButton.text') }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.export-overlay{
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--overlay-c);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-index-export);
}

.export-box {
  background: var(--secondary-c);
  border: var(--border-modal);
  padding: 20px 25px;
  border-radius: 20px;
  max-width: 500px;
  box-shadow: var(--box-shadow-ui);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

</style>
