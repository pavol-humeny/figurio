<script setup>
/**
 * @file: EventUploadImage.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/common/useApi';
import ProgressBar from '@/components/statistics/ProgressBar.vue';

const { getUploadImage } = useApi();
const uploadImageEvents = ref([]);

// Fetch data on mount
onMounted(async () => {
  const res = await getUploadImage();
  uploadImageEvents.value = res || [];
});

// Compute total number of uploads
const totalUploads = computed(() =>
  uploadImageEvents.value.reduce((sum, item) => sum + item.numberOfUploads, 0)
);
</script>

<template>
  <div class="single-event statistics-card">
    <div class="single-event-title">
      {{ $t('statistics.events.singleEvent.uploadImage.title') }}
      <div class="total-number-of-event">
        <p>{{ $t('statistics.events.singleEvent.uploadImage.totalEvents') }}
          {{ totalUploads }}
        </p>
      </div>
    </div>

    <div class="single-event-values">
      <div class="overview-item" v-for="(item, index) in uploadImageEvents" :key="index">
        <ProgressBar :progress="item.numberOfUploads" :total="totalUploads" :title="item.fileFormat"
          />
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
