<script setup>
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/common/useApi';
import ProgressBar from '@/components/statistics/ProgressBar.vue';

const { getKeyboardShortcuts } = useApi();
const keyboardShortcutEvents = ref([]);

// Fetch data on mount
onMounted(async () => {
  const res = await getKeyboardShortcuts();
  keyboardShortcutEvents.value = res || [];
});

// Compute total number of keyboard shortcuts
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
