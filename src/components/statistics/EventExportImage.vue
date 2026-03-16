<script setup>
/**
 * @file: EventExportImage.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for displaying the number of export image events by file format. It fetches the data from the API on component mount and displays it using the ProgressBar component, showing the percentage of exports for each file format compared to the total number of exports.
 */
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/common/useApi';
import ProgressBar from '@/components/statistics/ProgressBar.vue';
const { getExportImage } = useApi();

/**
 * Reactive variable to store the export image events fetched from the API
 */
const exportImageEvents = ref([]);

/**
 * Fetch export image events on component mount
 */
onMounted(async () => {
  const res = await getExportImage();
  exportImageEvents.value = res || [];
});

/**
 * Compute total number of exports across all file formats to calculate percentages for the ProgressBar component
 */
const totalExports = computed(() =>
  exportImageEvents.value.reduce((sum, item) => sum + item.numberOfExports, 0)
);
</script>

<template>
  <div class="single-event statistics-card">
    <div class="single-event-title">
      {{ $t('statistics.events.singleEvent.exportImage.title') }}
      <div class="total-number-of-event">
        <p>{{ $t('statistics.events.singleEvent.exportImage.totalEvents') }}
          {{ totalExports }}
        </p>
      </div>
    </div>

    <div class="single-event-values">
      <div class="overview-item" v-for="(item, index) in exportImageEvents" :key="index">
        <ProgressBar :progress="item.numberOfExports" :total="totalExports" :title="item.fileFormat" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.single-event-values {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.overview-item {
  width: 100%;
}
</style>
