<script setup>
/**
 * @file: ToolsStats.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for displaying user tool usage statistics. It fetches the data from the API on component mount and displays it in a radar chart using Chart.js, showing the usage count of each tool. The left side of the component lists all tools with their usage count, while the right side displays the radar chart for a visual comparison of tool usage.
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
import BaseIcon from '../icons/BaseIcon.vue'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const { getUserToolUsage } = useApi()
const uiStore = useUiStore()
const { t } = useI18n()

/**
 * Variable for storing user stats
 */
const stats = ref(null)

/**
 * Array of all available tools
 */
const availableTools = computed(() => [
  { tool: 'noiseAnalysis', name: t('tools.imageAnalysis.label'), icon: 'IconImageAnalysisTool' },
  { tool: 'crop', name: t('tools.crop.label'), icon: 'IconCropTool' },
  { tool: 'frame', name: t('tools.frame.label'), icon: 'IconFrameTool' },
  { tool: 'grayscale', name: t('tools.grayscale.label'), icon: 'IconGrayscaleTool' },
  { tool: 'backgroundRemoval', name: t('tools.backgroundRemoval.label'), icon: 'IconBackgroundRemovalTool' },
  { tool: 'brush', name: t('tools.brush.label'), icon: 'IconBrush' },
  { tool: 'select', name: t('tools.select.label'), icon: 'IconSelectTool' },
  { tool: 'shape', name: t('tools.shape.label'), icon: 'IconShapeTool' },
  { tool: 'text', name: t('tools.text.label'), icon: 'IconTextTool' },
  { tool: 'blur', name: t('tools.blur.label'), icon: 'IconBlurTool' },
  { tool: 'magnifyArea', name: t('tools.magnifyArea.label'), icon: 'IconMagnifyAreaTool' },
  { tool: 'rotate', name: t('tools.transform.subTools.rotate.label'), icon: 'IconRotateTool' },
  { tool: 'flip', name: t('tools.transform.subTools.flip.label'), icon: 'IconFlipVertical' },
  { tool: 'resize', name: t('tools.transform.subTools.resize.label'), icon: 'IconResizeTool' },
  { tool: 'Presets', name: t('tools.preset.label'), icon: 'IconPresetTool' },
])

/**
 * Merge API data with available tools
 */
const mergedTools = computed(() => {
  if (!stats.value?.tools) return []

  return availableTools.value.map((tool) => {
    const found = stats.value.tools.find((t) => t.tool === tool.tool)

    return {
      ...tool,
      usage: found?.usage || 0,
      percentage: found?.percentage || 0,
    }
  })
})

/**
 * All tools sorted by usage (desc)
 */
const sortedTools = computed(() => {
  return [...mergedTools.value].sort((a, b) => b.usage - a.usage)
})

/**
 * Max usage (for radar scale)
 */
const maxUsage = computed(() => {
  return Math.max(...mergedTools.value.map(t => t.usage), 0)
})

/**
 * Get CSS variable value
 * @param {string} name - Name of the CSS variable (e.g. '--primary-c')
 * @returns {string} Value of the CSS variable
 */
const getCssVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

/**
 * Theme version to trigger re-computation of chart data and options on theme change
 */
const themeVersion = ref(0)

/**
 * Radar chart data (USES COUNT)
 */
const chartData = computed(() => {
  themeVersion.value
  const primary = getCssVar('--primary-c')

  return {
    labels: mergedTools.value.map((t) => t.name),
    datasets: [
      {
        data: mergedTools.value.map((t) => t.usage),

        fill: true,

        // CSS variable
        backgroundColor: primary + '33', // 20% opacity
        borderColor: primary,
        borderWidth: 2,

        pointBackgroundColor: primary,
        pointRadius: 2,
      },
    ],
  }
})

/**
 * Chart options
 */
const chartOptions = computed(() => {
  themeVersion.value

  const textColor = getCssVar('--text-c')

  return {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ctx.raw,
        },
      },
    },

    scales: {
      r: {
        beginAtZero: true,
        max: maxUsage.value || 1,

        ticks: {
          display: false,
          color: textColor,
        },

        grid: {
          color: textColor + '22',
        },

        angleLines: {
          color: textColor + '33',
        },

        pointLabels: {
          color: textColor,
          font: { size: 11 },
        },
      },
    },
  }
})

/**
 * Get user stats on component mount
 */
onMounted(async () => {
  stats.value = await getUserToolUsage(uiStore.userUuid)
})

/**
 * Update colors on theme change
 */
watch(
  () => uiStore.theme,
  () => {
    themeVersion.value++ // Force recompute
  },
)
</script>

<template>
  <div class="tools-stats statistics-card">
    <div class="tools-stats-content">

      <!-- LEFT - TOOLS LIST -->
      <div class="top-tools">
        <div class="top-tools-header">
          {{ t('statistics.userStatistics.toolUsage.title') }}
        </div>

        <div class="tools-list">
          <div v-for="(tool, index) in sortedTools" :key="tool.tool" class="tool-item">
            <!-- Rank -->
            <div class="tool-rank">#{{ index + 1 }}</div>

            <!-- Icon -->
            <BaseIcon :name="tool.icon" :size="20" color="var(--primary-c)" class="tool-icon" />

            <!-- Info -->
            <div class="tool-info">
              <div class="tool-name">{{ tool.name }}</div>
            </div>

            <!-- Usage -->
            <div class="tool-usage">{{ tool.usage }}</div>
          </div>
        </div>
      </div>

      <!-- RIGHT - RADAR CHART -->
      <div class="chart-container">
        <Radar :data="chartData" :options="chartOptions" />
      </div>

    </div>
  </div>
</template>

<style scoped>
.tools-stats {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.tools-stats-content {
  display: flex;
  gap: 20px;
  align-items: stretch;
}

/* LEFT SIDE */
.top-tools {
  width: 30%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

/* Header */
.top-tools-header {
  font-size: 20px;
  font-weight: 600;
  padding: 0 4px;
}

/* Scroll container */
.tools-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding-right: 4px;
}

/* Item */
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

/* Rank */
.tool-rank {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.5;
  width: 20px;
}

/* Icon */
.tool-icon {
  width: 18px;
  height: 18px;
  opacity: 0.8;
}

/* Info */
.tool-info {
  flex: 1;
}

.tool-name {
  font-size: 13px;
  font-weight: 500;
}

/* Usage (right aligned) */
.tool-usage {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.8;
}

/* RIGHT SIDE */
.chart-container {
  flex: 1;
  position: relative;
  min-width: 0;
}
</style>
