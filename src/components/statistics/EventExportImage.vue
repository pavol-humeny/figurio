<script setup>
/**
 * @file: EventExportImage.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/common/useApi';
import ProgressBar from '@/components/statistics/ProgressBar.vue';

const { getExportImage } = useApi();
const exportImageEvents = ref([]);

// Fetch data on mount
onMounted(async () => {
  const res = await getExportImage();
  exportImageEvents.value = res || [];
});

// Compute total number of exports
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
