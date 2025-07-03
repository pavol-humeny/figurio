<script setup>
import { watch, ref } from 'vue'
import DropdownSelect from './DropdownSelect.vue'
import ColorPicker from './ColorPicker.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  operation: {
    type: Object,
    required: true,
  },
})

const presetRotationOptions = [
  { label: '90°', value: 90 },
  { label: '-90°', value: -90 },
]

const presetFlipOptions = [
  {
    label: t('tools.preset.settings.myPresets.presetValues.transformations.horizontalFlip'),
    value: 'horizontal',
  },
  {
    label: t('tools.preset.settings.myPresets.presetValues.transformations.verticalFlip'),
    value: 'vertical',
  },
]

const emit = defineEmits(['update:operation'])

const localOperation = ref({ ...props.operation })

watch(
  () => props.operation,
  (newOp) => {
    localOperation.value = { ...newOp }
  },
  { immediate: true, deep: true },
)

const update = () => {
  emit('update:operation', { ...localOperation.value })
}
</script>

<template>
  <div class="operation-details">
    <div class="content-title" :style="{ padding: '10px 0' }">
      <p>
        {{ t('tools.preset.settings.myPresets.modifyOperation') }}
      </p>
    </div>

    <template v-if="localOperation.type === 'rotation'">
      <div class="content-aligned two-items">
        <p>
          {{ t('tools.preset.settings.myPresets.presetValues.transformations.rotation') }}
        </p>
        <DropdownSelect
          v-model="localOperation.angle"
          :options="presetRotationOptions"
          @update="update"
        />
      </div>
    </template>

    <template v-else-if="localOperation.type === 'flip'">
      <div class="content-aligned two-items">
        <p>
          {{ t('tools.preset.settings.myPresets.presetValues.transformations.flip') }}
        </p>
        <DropdownSelect
          v-model="localOperation.direction"
          :options="presetFlipOptions"
          @update="update"
        />
      </div>
    </template>

    <template v-else-if="localOperation.type === 'smartCrop'">
      <div class="content-aligned two-items">
        <p>
          {{ t('tools.preset.settings.myPresets.presetValues.smartCrop.label') }}
        </p>
        <ColorPicker v-model="localOperation.color" @update="update" />
      </div>
    </template>

    <!-- UPDATE - add new template -->
  </div>
</template>

<style scoped>
.operation-details {
  width: 80%;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.content-aligned {
  width: 100%;
}
</style>
