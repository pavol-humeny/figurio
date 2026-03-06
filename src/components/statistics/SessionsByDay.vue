<script setup>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import { ref, onMounted, watch, nextTick } from 'vue'
import { useApi } from '@/composables/common/useApi'
import { useI18n } from 'vue-i18n'

const { getSessionsByDay } = useApi()
const { t, locale } = useI18n()

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
)

/**
 * Scroll wrapper reference
 */
const scrollWrapper = ref(null)

/**
 * Chart reactive data
 */
const data = ref({
  labels: [],
  datasets: [],
})

/**
 * Chart options
 */
const options = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    y: {
      type: 'linear',
      position: 'left',
      beginAtZero: true,
      title: {
        display: true,
        text: '',
      },
    },
    yVisits: {
      type: 'linear',
      position: 'right',
      beginAtZero: true,
      grid: {
        drawOnChartArea: false,
      },
      title: {
        display: true,
        text: '',
      },
    },
  },
})

// Colors
const minColor = 'rgba(59, 130, 246, 0.6)'
const avgColor = 'rgba(34, 197, 94, 0.6)'
const maxColor = 'rgba(168, 85, 247, 0.6)'
const visitsColor = 'rgba(239, 68, 68, 1)'

let cache = []

/**
 * Load data
 */
async function loadData() {
  if (cache.length === 0) {
    const rows = await getSessionsByDay()
    rows.sort((a, b) => new Date(a.date) - new Date(b.date))
    cache = rows
  }

  const labels = cache.map(v => v.date.split('T')[0])

  data.value = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: t('statistics.visits.sessions.min'),
        data: cache.map(v => v.minSession),
        backgroundColor: minColor,
        borderRadius: 4,
        yAxisID: 'y',
      },
      {
        type: 'bar',
        label: t('statistics.visits.sessions.avg'),
        data: cache.map(v => v.avgSession),
        backgroundColor: avgColor,
        borderRadius: 4,
        yAxisID: 'y',
      },
      {
        type: 'bar',
        label: t('statistics.visits.sessions.max'),
        data: cache.map(v => v.maxSession),
        backgroundColor: maxColor,
        borderRadius: 4,
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: t('statistics.visits.sessions.visits'),
        data: cache.map(v => v.allVisits),
        borderColor: visitsColor,
        backgroundColor: visitsColor,
        tension: 0.3,
        pointRadius: 3,
        yAxisID: 'yVisits',
      },
    ],
  }

  options.value.scales.y.title.text =
    t('statistics.visits.sessions.axisLeft')

  options.value.scales.yVisits.title.text =
    t('statistics.visits.sessions.axisRight')

  scrollToRight()
}

/**
 * Scroll to newest data
 */
async function scrollToRight() {
  await nextTick()

  if (scrollWrapper.value) {
    scrollWrapper.value.scrollLeft =
      scrollWrapper.value.scrollWidth
  }
}

onMounted(loadData)

watch(locale, () => {
  loadData()
})
</script>

<template>
  <div class="visits-chart statistics-card">
    <div class="single-event-title" style="margin-bottom: 30px;">
      {{ $t('statistics.visits.sessions.title') }}
    </div>

    <div class="chart-scroll-wrapper" ref="scrollWrapper">
      <div class="chart-inner" :style="{ width: data.labels.length * 60 + 'px' }">
        <Bar :data="data" :options="options" />
      </div>
    </div>
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

.chart-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
}

.chart-inner {
  min-height: 400px;
}

.chart-inner canvas {
  width: 100% !important;
  height: 400px !important;
}
</style>
