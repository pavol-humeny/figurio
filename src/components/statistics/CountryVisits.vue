<script setup>
/**
 * @file: CountryVisits.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut } from 'vue-chartjs';
import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/common/useApi';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const { getVisitsByCountry } = useApi();

/**
 * Reactive array for visits by country
 */
const countries = ref([]);

/**
 * Base colors for the chart segments
 */
const baseColors = [
  'rgba(220, 38, 38, 0.6)',   // red
  'rgba(34, 197, 94, 0.6)',   // green
  'rgba(59, 130, 246, 0.6)',  // blue
  'rgba(245, 158, 11, 0.6)',  // yellow/orange
  'rgba(168, 85, 247, 0.6)',  // purple
  'rgba(6, 182, 212, 0.6)',   // turquoise
  'rgba(249, 115, 22, 0.6)',  // warm orange
  'rgba(16, 185, 129, 0.6)',  // emerald
  'rgba(234, 179, 8, 0.6)',   // amber
  'rgba(14, 165, 233, 0.6)',  // sky blue
  'rgba(236, 72, 153, 0.6)',  // pink
  'rgba(107, 114, 128, 0.6)', // gray
  'rgba(251, 191, 36, 0.6)',  // yellow
  'rgba(132, 204, 22, 0.6)',  // lime
];

/**
 * Generate an array of colors for the chart segments
 */
const generateColors = (n) => {
  const colors = [];
  for (let i = 0; i < n; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

/**
 * Data for the doughnut chart
 */
const data = ref({
  labels: [],
  datasets: [
    {
      data: [],
      backgroundColor: [],
      borderWidth: 1,
    },
  ],
});

/**
 * Chart options
 */
const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '0%',
  plugins: {
    legend: { position: 'bottom' },
    tooltip: { enabled: true },
  },
};

/**
 * Fetch visits by country on component mount
 */
onMounted(async () => {
  const res = await getVisitsByCountry();
  countries.value = res;

  data.value = {
    labels: countries.value.map(c => c.country),
    datasets: [
      {
        data: countries.value.map(c => c.visitCount),
        backgroundColor: generateColors(countries.value.length),
        borderWidth: 1,
      },
    ],
  };
});
</script>

<template>
  <div class="country-chart statistics-card">
    <div class="single-event-title" style="margin-bottom: 30px;">
      {{ $t('statistics.visits.countryVisits') }}
    </div>

    <div class="chart-fixed-height">
      <Doughnut :data="data" :options="options" />
    </div>
  </div>
</template>

<style scoped>
.country-chart {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.chart-fixed-height {
  height: 400px;
}
</style>
