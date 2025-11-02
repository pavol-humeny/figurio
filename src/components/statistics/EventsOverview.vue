<script setup>
import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/common/useApi';

const { getEventsOverview } = useApi();


const eventsOverview = ref({});
/**
 * Fetch total visits on component mount
 */
onMounted(async () => {
  const res = await getEventsOverview();
  eventsOverview.value = res;
});
</script>

<template>
  <div class="events-overview statistics-card">
    <div class="events-overview-title">
      {{ $t('statistics.events.overview.title') }}
    </div>
    <div class="events-overview-values">
      <div class="overview-item" v-for="(value, key) in eventsOverview" :key="key">
        <div class="item-label">
          {{
            key === 'totalEvents' ? $t('statistics.events.overview.totalEvents') :
              key === 'numberOfUploads' ? $t('statistics.events.overview.numberOfUploads') :
                key === 'numberOfExport' ? $t('statistics.events.overview.numberOfExport') :
                  key === 'numberOfUseTool' ? $t('statistics.events.overview.numberOfUseTool') :
                    key === 'numberOfKeyboardShortcuts' ? $t('statistics.events.overview.numberOfKeyboardShortcuts') :
                      key
          }}
        </div>
        <div class="item-value">
          {{ value }}
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
.events-overview {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 30px 50px;
}

.events-overview-title {
  font-size: 22px;
  font-weight: bold;
  color: var(--statistics-title-c);
}

.events-overview-values {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  border-top: solid 1px var(--border-c);
  padding-top: 20px;
}

.item-label {
  opacity: 0.7;
}

.item-value {
  font-size: 29px;
  font-weight: bold;
  color: var(--primary-c);
}
</style>
