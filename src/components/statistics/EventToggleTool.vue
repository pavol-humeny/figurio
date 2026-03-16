<script setup>
/**
 * @file: EventToggleTool.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for displaying the number of times different tools were toggled. It fetches the toggle tool events from the API on component mount, computes the total number of toggles, and displays each tool's toggles using the ProgressBar component to show their proportion relative to the total toggles.
 */
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/common/useApi';
import ProgressBar from '@/components/statistics/ProgressBar.vue';
const { getToggleTool } = useApi();

/**
 * Reactive variable to store the toggle tool events fetched from the API
 */
const toggleToolEvents = ref([]);

/**
 * Fetch toggle tool events on component mount
 */
onMounted(async () => {
  const res = await getToggleTool();
  toggleToolEvents.value = res || [];
});

/**
 * Compute total number of toggles
 */
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
