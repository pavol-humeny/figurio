<script setup>
/**
 * @file: UserComparison.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: User comparison stats (ranking vs others). This component fetches the user's comparison data from the API on mount and displays various metrics comparing the user's performance to other users. The metrics include visits, operations, operations per session, import/export count, total session time, and events per minute. Each metric shows the user's value, their rank among other users, the best value for that metric, and how far the user is from the best value (positive or negative).
 */
import { ref, onMounted, computed } from 'vue'
import { useApi } from '@/composables/common/useApi'
import { useUiStore } from '@/stores/uiStore'
import { useI18n } from 'vue-i18n'

const { getUserComparison } = useApi()
const uiStore = useUiStore()
const { t } = useI18n()

/**
 * User comparison stats
 */
const stats = ref(null)

/**
 * Get user comparison stats on component mount
 */
onMounted(async () => {
  stats.value = await getUserComparison(uiStore.userUuid)
})

/**
 * Prepare metrics
 */
const metricsList = computed(() => {
  if (!stats.value) return []

  return [
    { key: 'visits', label: t('statistics.userStatistics.userComparison.visits') },
    { key: 'operations', label: t('statistics.userStatistics.userComparison.operations') },
    { key: 'sessionTimeTotal', label: t('statistics.userStatistics.userComparison.sessionDuration') },
    { key: 'operationPerSession', label: t('statistics.userStatistics.userComparison.operationPerSession') },
    { key: 'importCount', label: t('statistics.userStatistics.userComparison.importCount') },
    { key: 'exportCount', label: t('statistics.userStatistics.userComparison.exportCount') },
    { key: 'eventsPerMinute', label: t('statistics.userStatistics.userComparison.eventsPerMinute') },
    { key: 'exportRate', label: t('statistics.userStatistics.userComparison.exportSuccessRate') },
  ].map((m) => {
    const data = stats.value.metrics[m.key]

    return {
      ...m,
      ...data,
      diff: Number((data.value - data.best).toFixed(2)),
    }
  })
})

/**
 * Rank label
 */
const getRankLabel = (rank) => {
  if (!rank) return '-'
  if (rank === 1) return '🥇 #1'
  if (rank === 2) return '🥈 #2'
  if (rank === 3) return '🥉 #3'
  return `#${rank}`
}

/**
 * Diff label (how far from best)
 * @param {number} diff - Difference from best value
 * @returns {string} Label for the difference ("-3", "Best")
 */
const getDiffLabel = (diff) => {
  if (diff === 0) return t('statistics.userStatistics.userComparison.best')
  return diff < 0 ? `${diff}` : `+${diff}`
}
</script>

<template>
  <div class="tools-stats statistics-card">
    <div class="tools-stats-content" v-if="stats">

      <!-- HEADER -->
      <div class="header">
        <div class="title">{{ $t('statistics.userStatistics.userComparison.title') }}</div>
        <div class="subtitle">
          {{ $t('statistics.userStatistics.userComparison.subtitle', { count: stats.usersCount }) }}
        </div>
      </div>

      <!-- METRICS -->
      <div class="metrics">
        <div class="metric" v-for="metric in metricsList" :key="metric.key">

          <!-- TOP ROW -->
          <div class="metric-top">
            <div class="metric-title">
              {{ metric.label }}
            </div>
            <div class="metric-rank">
              {{ getRankLabel(metric.rank) }}
            </div>
          </div>

          <!-- MAIN VALUE -->
          <div class="metric-main">
            {{ metric.value }}
          </div>

          <!-- COMPARISON -->
          <div class="metric-bottom">
            <span class="best">
              {{ t('statistics.userStatistics.userComparison.best') }}: {{ metric.best }}
            </span>

            <span class="diff" :class="{ negative: metric.diff < 0, positive: metric.diff > 0 || metric.diff === 0 }">
              {{ getDiffLabel(metric.diff) }}
            </span>
          </div>
        </div>
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
  flex-direction: column;
  gap: 20px;
}

/* HEADER */
.header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  font-size: 20px;
  font-weight: 600;
}

.subtitle {
  font-size: 13px;
  opacity: 0.7;
}

/* GRID */
.metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

/* CARD */
.metric {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 15px;
  border-radius: 12px;
  background: var(--highlight-card-c);
  transition: 0.2s;
}

.metric:hover {
  background: var(--highlight-card-hover-c);
}

/* TOP */
.metric-top {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.metric-title {
  font-size: 12px;
  opacity: 0.7;
}

.metric-rank {
  opacity: 0.7;
}

/* MAIN */
.metric-main {
  font-size: 20px;
  font-weight: 700;
}

/* BOTTOM */
.metric-bottom {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.best {
  opacity: 0.7;
}

.diff {
  font-weight: 500;
}

.diff.negative {
  color: var(--error-c);
}

.diff.positive {
  color: var(--success-c);
}
</style>
