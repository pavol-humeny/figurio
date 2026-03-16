<script setup>
/**
 * @file: EventKeyboardShortcuts.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for displaying the number of keyboard shortcut events by tool/tab. It fetches the data from the API on component mount and displays it using the ProgressBar component, showing the percentage of keyboard shortcut uses for each tool/tab compared to the total number of keyboard shortcut uses.
 */
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/common/useApi';
import ProgressBar from '@/components/statistics/ProgressBar.vue';
const { getKeyboardShortcuts } = useApi();

/**
 * Reactive variable to store the keyboard shortcut events fetched from the API
 */
const keyboardShortcutEvents = ref([]);

/**
 * Fetch keyboard shortcut events on component mount
 */
onMounted(async () => {
  const res = await getKeyboardShortcuts();
  keyboardShortcutEvents.value = res || [];
});

/**
 * Compute total number of keyboard shortcuts
 */
const totalKeyboardShortcuts = computed(() =>
  keyboardShortcutEvents.value.reduce((sum, item) => sum + item.numberOfShortcuts, 0)
);
</script>

<template>
  <div class="single-event statistics-card">
    <div class="single-event-title">
      {{ $t('statistics.events.singleEvent.keyboardShortcuts.title') }}
      <div class="total-number-of-event">
        <p>{{ $t('statistics.events.singleEvent.keyboardShortcuts.totalEvents') }}
          {{ totalKeyboardShortcuts }}
        </p>
      </div>
    </div>

    <div class="single-event-values">
      <div class="overview-item" v-for="(item, index) in keyboardShortcutEvents" :key="index">
        <ProgressBar :progress="item.numberOfShortcuts" :total="totalKeyboardShortcuts" :title="item.keys" />
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
