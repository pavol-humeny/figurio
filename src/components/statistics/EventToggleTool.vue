<script setup>
/**
 * @file: EventToggleTool.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/common/useApi';
import ProgressBar from '@/components/statistics/ProgressBar.vue';

const { getToggleTool } = useApi();
const toggleToolEvents = ref([]);

// Fetch data on mount
onMounted(async () => {
  const res = await getToggleTool();
  toggleToolEvents.value = res || [];
});

// Compute total number of toggles
const totalToggles = computed(() =>
  toggleToolEvents.value.reduce((sum, item) => sum + item.numberOfToggles, 0)
);
</script>

<template>
  <div class="single-event statistics-card">
    <div class="single-event-title">
      {{ $t('statistics.events.singleEvent.toggleTool.title') }}
      <div class="total-number-of-event">
        <p>{{ $t('statistics.events.singleEvent.toggleTool.totalEvents') }}
          {{ totalToggles }}
        </p>
      </div>
    </div>

    <div class="single-event-values">
      <div class="overview-item" v-for="(item, index) in toggleToolEvents" :key="index">
        <ProgressBar :progress="item.numberOfToggles" :total="totalToggles" :title="item.tool"
          :subtitle="item.tab !== 'null' ? item.tab : ''" />
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
