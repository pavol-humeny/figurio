<script setup>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut } from 'vue-chartjs';

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement);

// Example data
const countries = [
  { country: 'Slovensko', visits: 250 },
  { country: 'Česko', visits: 180 },
  { country: 'Poľsko', visits: 120 },
  { country: 'Nemecko', visits: 90 },
  { country: 'Ostatné', visits: 60 },
];

/**
 * Generates an array of distinct colors for the chart segments.
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
 * Generates an array of colors for the chart segments based on the number of segments.
 * If there are more segments than base colors, colors will repeat.
 * @param {number} n - Number of segments
 * @returns {string[]} Array of color strings
 */
const generateColors = (n) => {
  const colors = [];
  for (let i = 0; i < n; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

/**
 * Chart data 
 */
const data = {
  labels: countries.map(c => c.country),
  datasets: [
    {
      data: countries.map(c => c.visits),
      backgroundColor: generateColors(countries.length),
      borderWidth: 1,
    },
  ],
};

/**
 * Chart options
 */
const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '0%',
  plugins: {
    legend: { position: 'right' },
    tooltip: { enabled: true },
  },
};
</script>

<template>
  <div class="country-chart statistics-card">
    <Doughnut :data="data" :options="options" />
  </div>
</template>

<style scoped>
.country-chart {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
