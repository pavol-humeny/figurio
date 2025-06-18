<script setup>
import { ref } from 'vue';
import { useExportToolSettings } from '@/composables/toolsSettings/useExportToolSettings';
import DefaultButton from '../common/DefaultButton.vue';
import BaseIcon from '../icons/BaseIcon.vue';
import { useShaking } from '@/composables/common/useShaking';

const isDimensionsLinked = ref(true);

const {
  isShaking,
  triggerShake
} = useShaking();

const {
  isVisible,
  closeExportToolSettings,
} = useExportToolSettings();

</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="export-overlay" @click.self="triggerShake">
      <div class="export-box" :class="{ shake: isShaking }">
        <div class="export-settings">
          <div class="title-wrapper">
            <BaseIcon name="IconExportTool" size="32" color="var(--text-c)" />
            <p>{{ $t('tools.export.settings.general.title') }}</p>
          </div>

          <div class="export-settings-item">
            <label for="file-format">{{ $t('tools.export.settings.general.fileFormat') }}</label>
            <select id="file-format">
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="xml">XML</option>
            </select>
          </div>

          <div class="export-settings-item">
            <label for="file-name">{{ $t('tools.export.settings.general.fileName.label') }}</label>
            <input type="text" id="file-name" :placeholder="$t('tools.export.settings.general.fileName.placeholder')" />
          </div>

          <div class="export-settings-item">
            <label for="file-dimensions">{{ $t('tools.export.settings.general.fileDimensions.label') }}</label>
            <div class="file-dimensions-inputs">
              <div class="width">
                <label for="file-dimensions-width">{{ $t('tools.export.settings.general.fileDimensions.width') }}</label>
                <input type="number" id="file-dimensions-width"/>
              </div>

              <div class="link-icon-wrapper">
                <BaseIcon
                :name="isDimensionsLinked ? 'IconLinkValues' : 'IconUnLinkValues'"
                size="30"
                color="var(--primary-c)"
                @click="isDimensionsLinked = !isDimensionsLinked"
                />
              </div>

              <div class="height">
                <label for="file-dimensions-height">{{ $t('tools.export.settings.general.fileDimensions.height') }}</label>
                <input type="number" id="file-dimensions-height"/>
              </div>
            </div>
          </div>

          <div class="buttons-wrapper">
            <DefaultButton
              :text="$t('tools.export.settings.general.cancelButton.text')"
              :onClick="closeExportToolSettings"
              onlyText
            />
            <DefaultButton
              :text="$t('tools.export.settings.general.exportButton.text')"
              :onClick="closeExportToolSettings"
            />
          </div>
        </div>
        <div class="export-preview">
          <div class="tmp">
a
          </div>
        </div>

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
  padding: 40px 50px;
  border-radius: 20px;
  min-width: 900px;
  height: 500px;
  box-shadow: var(--box-shadow-ui);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 50px;
}

.export-settings{
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
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

.export-settings-item{
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.export-settings-item label {
  font-size: var(--subtitle-font-size);
  font-weight: var(--subtitle-font-weight);
  user-select: none;
}

.export-settings-item select,
.export-settings-item input {
  width: 100%;
  padding: 7px 10px;
  border-radius: 10px;
  border: none;
  background: var(--background-c);
  color: var(--text-c);
}

.file-dimensions-inputs{
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 10px;
}
.file-dimensions-inputs .width,
.file-dimensions-inputs .height {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.file-dimensions-inputs .width label,
.file-dimensions-inputs .height label {
  font-size: var(--text-font-size);
}
.link-icon-wrapper{
  padding-top: 20px;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.buttons-wrapper{
  width: 100%;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.export-preview{
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgb(255, 255, 255);

}

</style>
