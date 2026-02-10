<script setup>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { ref, onMounted, watch } from 'vue'
import { useApi } from '@/composables/common/useApi'
import { useI18n } from 'vue-i18n'

const { getVisitsByDayFullRange } = useApi()
const { t, locale } = useI18n()

// Register Chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
)

/**
 * Formats date for axis label (short form)
 * Example: 2025-02-10 -> 10. 2.
 */
const formatAxisDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getDate()}. ${date.getMonth() + 1}.`
}

/**
 * Formats date for tooltip (full form)
 * Example: 2025-02-10 -> 10. 2. 2025
 */
const formatTooltipDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`
}

/**
 * Chart data
 */
const data = ref({
  labels: [],
  datasets: [],
})

/**
 * Chart options
 */
const options = {
  responsive: true,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        title: (tooltipItems) => {
          const index = tooltipItems[0].dataIndex
          return formatTooltipDate(visitsCache[index].date)
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        autoSkip: true,
        maxTicksLimit: 10,
        maxRotation: 0,
      },
    },
    y: {
      beginAtZero: true,
    },
  },
}

// Colors
const totalColor = 'rgba(34, 197, 94, 1)'     // green
const newUsersColor = 'rgba(59, 130, 246, 1)' // blue

/**
 * Cache to avoid refetching
 */
let visitsCache = []

/**
 * Loads and transforms data into cumulative values
 */
async function loadData() {
  if (visitsCache.length === 0) {
    const visits = await getVisitsByDayFullRange()
    visits.sort((a, b) => new Date(a.date) - new Date(b.date))
    visitsCache = visits
  }

  const labels = visitsCache.map(v => formatAxisDate(v.date))

  let cumulativeAll = 0
  let cumulativeNewUsers = 0

  const cumulativeAllVisits = []
  const cumulativeNewUsersArr = []

  visitsCache.forEach(v => {
    cumulativeAll += Number(v.allVisits)
    cumulativeNewUsers += Number(v.newUsers)

    cumulativeAllVisits.push(cumulativeAll)
    cumulativeNewUsersArr.push(cumulativeNewUsers)
  })

  data.value = {
    labels,
    datasets: [
      {
        label: t('statistics.visits.fullRange.allVisits'),
        data: cumulativeAllVisits,
        borderColor: totalColor,
        backgroundColor: totalColor,
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: t('statistics.visits.fullRange.uniqueVisits'),
        data: cumulativeNewUsersArr,
        borderColor: newUsersColor,
        backgroundColor: newUsersColor,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  }
}

/**
 * Initial load
 */
onMounted(loadData)

/**
 * Reload labels on locale change
 */
watch(locale, () => {
  loadData()
})
</script>

<template>
  <div class="visits-chart statistics-card">
    <div class="single-event-title" style="margin-bottom: 30px;">
      {{ $t('statistics.visits.fullRange.title') }}
    </div>

    <Line :data="data" :options="options" />
  </div>
</template>

<style scoped>
.visits-chart {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
