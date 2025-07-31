<script setup>
import { useShapeTool } from '@/composables/tools/useShapeTool';
import DropdownSelect from '../common/DropdownSelect.vue';
import { useEditorStore } from '@/stores/editorStore';
import { useImageStore } from '@/stores/imageStore';


const { objectSettings, objectTypeOptions } = useShapeTool(useEditorStore(), useImageStore())

</script>

<template>
  <div class="tool-settings">
    <div class="settings-wrapper">
      <div class="specific-settings">
        <!-- Object type -->
        <div class="settings-content-wrapper">
          <div class="content-title">
            <p>Object type</p>
          </div>
          <div class="content-wrapper">
            <DropdownSelect v-model="objectSettings.type" :options="objectTypeOptions" />
          </div>
        </div>

        <!-- Fill color -->
        <!-- <div class="settings-content-wrapper">
          <div class="content-title">
            <p>Object type</p>
          </div>
          <div class="content-wrapper">
            <DropdownSelect v-model="objectType" :options="[
              { label: 'Rectangle', value: 'rect' },
              { label: 'Ellipse', value: 'ellipse' },
              { label: 'Line', value: 'line' }
            ]" />
          </div>
        </div> -->

        <!-- Empty space -->
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
