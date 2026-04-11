<script setup>
/**
 * @file: EventsStats.vue
 */
import { ref, onMounted, computed, watch } from 'vue'
import { useApi } from '@/composables/common/useApi'
import { useUiStore } from '@/stores/uiStore'
import { useI18n } from 'vue-i18n'

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Radar } from 'vue-chartjs'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const { getUserEventsStats } = useApi()
const uiStore = useUiStore()
const { t } = useI18n()

const stats = ref(null)
const themeVersion = ref(0)

/**
 * All supported import formats
 */
const availableImportFormats = computed(() => [
  { format: 'png', name: 'PNG' },
  { format: 'jpg', name: 'JPG' },
  { format: 'jpeg', name: 'JPEG' },
  { format: 'webp', name: 'WEBP' },
  { format: 'pdf', name: 'PDF' },
])

/**
 * All supported export formats
 */
const availableExportFormats = computed(() => [
  { format: 'png', name: 'PNG' },
  { format: 'jpg', name: 'JPG' },
  { format: 'jpeg', name: 'JPEG' },
  { format: 'webp', name: 'WEBP' },
  { format: 'pdf', name: 'PDF' },
  { format: 'copyToClipboard', name: 'Clipboard' },
])

/**
 * Merge import formats
 */
const mergedImportFormats = computed(() => {
  if (!stats.value?.import?.formats) return []

  return availableImportFormats.value.map((f) => {
    const found = stats.value.import.formats.find((x) => x.format === f.format)

    return {
      ...f,
      count: found?.count || 0,
    }
  })
})

/**
 * Merge export formats
 */
const mergedExportFormats = computed(() => {
  if (!stats.value?.export?.formats) return []

  return availableExportFormats.value.map((f) => {
    const found = stats.value.export.formats.find((x) => x.format === f.format)

    return {
      ...f,
      count: found?.count || 0,
    }
  })
})

const sortedImportFormats = computed(() =>
  [...mergedImportFormats.value].sort((a, b) => b.count - a.count),
)

const sortedExportFormats = computed(() =>
  [...mergedExportFormats.value].sort((a, b) => b.count - a.count),
)

onMounted(async () => {
  stats.value = await getUserEventsStats(uiStore.userUuid)
})

watch(() => uiStore.theme, () => {
  themeVersion.value++
})

/**
 * Helpers
 */
const getCssVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

const buildChartData = (formats) => {
  const safeFormats = formats || []
  themeVersion.value
  const primary = getCssVar('--primary-c')

  return {
    labels: safeFormats.map((f) => f.name),
    datasets: [
      {
        data: safeFormats.map((f) => f.count),
        fill: true,
        backgroundColor: primary + '33',
        borderColor: primary,
        borderWidth: 2,
        pointBackgroundColor: primary,
        pointRadius: 2,
      },
    ],
  }
}

const buildChartOptions = (formats) => {
  const safeFormats = formats || []
  themeVersion.value
  const textColor = getCssVar('--text-c')

  const max = Math.max(...safeFormats.map((f) => f.count), 1)

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      r: {
        beginAtZero: true,
        max,
        ticks: { display: false },
        grid: { color: textColor + '22' },
        angleLines: { color: textColor + '33' },
        pointLabels: { color: textColor },
      },
    },
  }
}

const importData = computed(() => stats.value?.import || null)
const exportData = computed(() => stats.value?.export || null)
</script>

<template>
  <div class="tools-stats">

    <!-- IMPORT -->
    <div class="statistics-card">
      <div class="tools-stats-content">

        <div class="top-tools">
          <div class="top-tools-header">
            {{ t('statistics.userStatistics.eventsStats.import.title') }}
          </div>

          <div class="summary">
            <div>{{ t('statistics.userStatistics.eventsStats.import.totalImports') }}: <b>{{ importData?.total }}</b>
            </div>
            <div v-if="importData?.smallest">
              {{ t('statistics.userStatistics.eventsStats.import.smallestImportedImage') }}: <b>{{
                importData.smallest.width }}×{{
                  importData.smallest.height }}</b>
            </div>
            <div v-if="importData?.largest">
              {{ t('statistics.userStatistics.eventsStats.import.largestImportedImage') }}: <b>{{
                importData.largest.width }}×{{
                  importData.largest.height }}</b>
            </div>
          </div>

          <div class="tools-list">
            <div v-for="(f, i) in sortedImportFormats" :key="f.format" class="tool-item">
              <div class="tool-rank">#{{ i + 1 }}</div>

              <div class="tool-info">
                <div class="tool-name">{{ f.name }}</div>
              </div>

              <div class="tool-usage">{{ f.count }}</div>
            </div>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-wrapper">
            <Radar v-if="importData" :data="buildChartData(mergedImportFormats)"
              :options="buildChartOptions(mergedImportFormats)" />
          </div>
        </div>

      </div>
    </div>

    <!-- EXPORT -->
    <div class="statistics-card">
      <div class="tools-stats-content">

        <div class="top-tools">
          <div class="top-tools-header">
            {{ t('statistics.userStatistics.eventsStats.export.title') }}
          </div>

          <div class="summary">
            <div>{{ t('statistics.userStatistics.eventsStats.export.totalExports') }}: <b>{{ exportData?.total }}</b>
            </div>
            <div v-if="exportData?.smallest">
              {{ t('statistics.userStatistics.eventsStats.export.smallestExportedImage') }}: <b>{{
                exportData.smallest.width }}×{{
                  exportData.smallest.height }}</b>
            </div>
            <div v-if="exportData?.largest">
              {{ t('statistics.userStatistics.eventsStats.export.largestExportedImage') }}: <b>{{
                exportData.largest.width }}×{{
                  exportData.largest.height }}</b>
            </div>
          </div>

          <div class="tools-list">
            <div v-for="(f, i) in sortedExportFormats" :key="f.format" class="tool-item">
              <div class="tool-rank">#{{ i + 1 }}</div>

              <div class="tool-info">
                <div class="tool-name">{{ f.name }}</div>
              </div>

              <div class="tool-usage">{{ f.count }}</div>
            </div>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-wrapper">
            <Radar v-if="exportData" :data="buildChartData(mergedExportFormats)"
              :options="buildChartOptions(mergedExportFormats)" />
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
.tools-stats {
  display: flex;
  flex-direction: column;
  gap: 25px;
  width: 100%;
}

.tools-stats-content {
  display: flex;
  gap: 20px;
  align-items: stretch;
}

.top-tools {
  width: 30%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.top-tools-header {
  font-size: 20px;
  font-weight: 600;
}

.summary {
  font-size: 13px;
  opacity: 0.8;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tools-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding-right: 4px;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  background: var(--highlight-card-c);
  transition: 0.2s;
}

.tool-item:hover {
  background: var(--highlight-card-hover-c);
}

.tool-rank {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.5;
  width: 20px;
}

.tool-info {
  flex: 1;
}

.tool-name {
  font-size: 13px;
  font-weight: 600;
}

.tool-usage {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.8;
}

.chart-container {
  flex: 1;
  position: relative;
  min-width: 0;
  display: flex;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 250px;
}
</style>
