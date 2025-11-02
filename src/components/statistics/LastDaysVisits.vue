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
import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/common/useApi';
import { useI18n } from 'vue-i18n';

const { getLastSevenDaysVisits } = useApi();
const { t } = useI18n();

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
    title: {
      display: true,
      text: t('statistics.visits.lastDaysVisits.title'),
      font: { size: 18 },
    },
  },
};

// Colors
const totalColor = 'rgba(34, 197, 94, 0.6)'; // green
const uniqueColor = 'rgba(59, 130, 246, 0.6)'; // blue

/**
 * Fetch and prepare data on component mount
 */
onMounted(async () => {
  const visits = await getLastSevenDaysVisits();

  visits.sort((a, b) => new Date(a.date) - new Date(b.date));

  const labels = visits.map(v => v.date.split('T')[0]);

  const totalData = visits.map(v => v.allVisits);
  const uniqueData = visits.map(v => v.newUsers);

  data.value = {
    labels,
    datasets: [
      {
        label: t('statistics.visits.lastDaysVisits.allVisits'),
        data: totalData,
        backgroundColor: totalColor,
        borderRadius: 4,
      },
      {
        label: t('statistics.visits.lastDaysVisits.uniqueVisits'),
        data: uniqueData,
        backgroundColor: uniqueColor,
        borderRadius: 4,
      },
    ],
  };
});
</script>

<template>
  <div class="visits-chart statistics-card">
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
}
</style>
