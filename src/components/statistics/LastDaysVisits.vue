<script setup>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { Bar } from 'vue-chartjs';
import { ref, onMounted, watch } from 'vue';
import { useApi } from '@/composables/common/useApi';
import { useI18n } from 'vue-i18n';

const { getLastSevenDaysVisits } = useApi();
const { t, locale } = useI18n();

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

/**
 * Data and options for the bar chart
 */
const data = ref({
  labels: [],
  datasets: [],
});

/**
 * Chart options
 */
const options = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    tooltip: { mode: 'index', intersect: false },
  },
};

// Colors
const totalColor = 'rgba(34, 197, 94, 0.6)'; // green
const uniqueColor = 'rgba(59, 130, 246, 0.6)'; // blue

/**
 * Cache for visits data to avoid refetching
 */
let visitsCache = []; // cache fetched data

async function loadData() {
  if (visitsCache.length === 0) {
    const visits = await getLastSevenDaysVisits();
    visits.sort((a, b) => new Date(a.date) - new Date(b.date));
    visitsCache = visits;
  }

  const labels = visitsCache.map(v => v.date.split('T')[0]);

  data.value = {
    labels,
    datasets: [
      {
        label: t('statistics.visits.lastDaysVisits.allVisits'),
        data: visitsCache.map(v => v.allVisits),
        backgroundColor: totalColor,
        borderRadius: 4,
      },
      {
        label: t('statistics.visits.lastDaysVisits.uniqueVisits'),
        data: visitsCache.map(v => v.newUsers),
        backgroundColor: uniqueColor,
        borderRadius: 4,
      },
    ],
  };
}

/**
 * Load data on component mount
 */
onMounted(loadData);

/**
 * Reload data when locale changes
 */
watch(locale, () => {
  loadData();
});
</script>

<template>
  <div class="visits-chart statistics-card">
    <div class="single-event-title" style="margin-bottom: 30px;">
      {{ $t('statistics.visits.lastDaysVisits.allVisits') }}
    </div>
    <Bar :data="data" :options="options" />
  </div>
</template>

<style scoped>
.visits-chart {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
</style>
