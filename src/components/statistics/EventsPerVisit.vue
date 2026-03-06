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

const { getAvgEventsPerVisitByDay } = useApi()
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
 * Chart options with dual axis
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
const uploadColor = 'rgba(59, 130, 246, 0.6)'
const exportColor = 'rgba(34, 197, 94, 0.6)'
const operationColor = 'rgba(168, 85, 247, 0.6)'
const visitsColor = 'rgba(239, 68, 68, 1)'

let cache = []

/**
 * Load data from API
 */
async function loadData() {
  if (cache.length === 0) {
    const rows = await getAvgEventsPerVisitByDay()
    rows.sort((a, b) => new Date(a.date) - new Date(b.date))
    cache = rows
  }

  const labels = cache.map(v => v.date.split('T')[0])

  data.value = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: t('statistics.visits.avgPerVisit.uploadImage'),
        data: cache.map(v => v.avgUploadImage),
        backgroundColor: uploadColor,
        borderRadius: 4,
        yAxisID: 'y',
      },
      {
        type: 'bar',
        label: t('statistics.visits.avgPerVisit.exportImage'),
        data: cache.map(v => v.avgExportImage),
        backgroundColor: exportColor,
        borderRadius: 4,
        yAxisID: 'y',
      },
      {
        type: 'bar',
        label: t('statistics.visits.avgPerVisit.applyOperation'),
        data: cache.map(v => v.avgApplyOperation),
        backgroundColor: operationColor,
        borderRadius: 4,
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: t('statistics.visits.avgPerVisit.visits'),
        data: cache.map(v => v.allVisits),
        borderColor: visitsColor,
        backgroundColor: visitsColor,
        tension: 0.3,
        pointRadius: 3,
        yAxisID: 'yVisits',
      },
    ],
  }

  // Update axis titles after locale change
  options.value.scales.y.title.text =
    t('statistics.visits.avgPerVisit.axisLeft')

  options.value.scales.yVisits.title.text =
    t('statistics.visits.avgPerVisit.axisRight')

  scrollToRight()
}

/**
 * Auto scroll to latest day
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
      {{ $t('statistics.visits.avgPerVisit.title') }}
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
