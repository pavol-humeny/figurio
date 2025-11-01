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

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Example data
const visits = [
  { day: 'Pon', total: 120, unique: 90 },
  { day: 'Uto', total: 150, unique: 110 },
  { day: 'Str', total: 130, unique: 100 },
  { day: 'Štv', total: 170, unique: 140 },
  { day: 'Pia', total: 160, unique: 120 },
  { day: 'Sob', total: 90, unique: 80 },
  { day: 'Ned', total: 70, unique: 60 },
];

/**
 * Chart colors
 */
const totalColor = 'rgba(34, 197, 94, 0.6)'; // green
const uniqueColor = 'rgba(59, 130, 246, 0.6)'; // blue

/**
 * Chart data
 */
const data = {
  labels: visits.map(v => v.day),
  datasets: [
    {
      label: 'Celkový počet',
      data: visits.map(v => v.total),
      backgroundColor: totalColor,
      borderRadius: 4,
    },
    {
      label: 'Unikátne návštevy',
      data: visits.map(v => v.unique),
      backgroundColor: uniqueColor,
      borderRadius: 4,
    },
  ],
};

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
