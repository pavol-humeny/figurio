<script setup>
/**
 * @file: SessionStats.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for displaying user session statistics. It fetches the data from the API on component mount. The component is divided into three sections: Session Overview, Session Duration, and Events Per Session. Each section displays relevant statistics such as total sessions, total events, events per minute, keyboard shortcuts used, session duration (min, max, avg, total), and the number of different types of events (import, export, tool toggle, operation) that occurred per session.
 */
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/common/useApi'
import { useUiStore } from '@/stores/uiStore'
import { useI18n } from 'vue-i18n'

const { getUserSessionStats } = useApi()
const uiStore = useUiStore()
const { t } = useI18n()

/**
 * Variable for storing user stats
 */
const stats = ref(null)

/**
 * Get user stats on component mount
 */
onMounted(async () => {
  stats.value = await getUserSessionStats(uiStore.userUuid)
})
</script>

<template>
  <div class="tools-stats statistics-card">
    <div class="tools-stats-content" v-if="stats">

      <!-- SESSION OVERVIEW -->
      <div class="section">
        <div class="section-title">{{ t('statistics.userStatistics.sessionStats.session.title') }}</div>

        <div class="grid">
          <div class="item">
            <div class="label">{{ t('statistics.userStatistics.sessionStats.session.totalSessions') }}</div>
            <div class="value">{{ stats.sessionCount }}</div>
          </div>

          <div class="item">
            <div class="label">{{ t('statistics.userStatistics.sessionStats.session.totalEvents') }}</div>
            <div class="value">{{ stats.totalEvents }}</div>
          </div>

          <div class="item">
            <div class="label">{{ t('statistics.userStatistics.sessionStats.session.eventsPerMinute') }}</div>
            <div class="value">{{ stats.eventsPerMinute }}</div>
          </div>

          <div class="item">
            <div class="label">{{ t('statistics.userStatistics.sessionStats.session.keyboardShortcuts') }}</div>
            <div class="value">{{ stats.keyboardShortcuts }}</div>
          </div>
        </div>
      </div>

      <!-- SESSION DURATION -->
      <div class="section">
        <div class="section-title">{{ t('statistics.userStatistics.sessionStats.sessionDuration.title') }}</div>

        <div class="grid">
          <div class="item">
            <div class="label">{{ t('statistics.userStatistics.sessionStats.sessionDuration.min') }}</div>
            <div class="value">{{ stats.sessionDuration.min }} min</div>
          </div>

          <div class="item">
            <div class="label">{{ t('statistics.userStatistics.sessionStats.sessionDuration.max') }}</div>
            <div class="value">{{ stats.sessionDuration.max }} min</div>
          </div>

          <div class="item">
            <div class="label">{{ t('statistics.userStatistics.sessionStats.sessionDuration.avg') }}</div>
            <div class="value">{{ stats.sessionDuration.avg }} min</div>
          </div>

          <div class="item">
            <div class="label">{{ t('statistics.userStatistics.sessionStats.sessionDuration.total') }}</div>
            <div class="value">{{ stats.sessionDuration.total }} min</div>
          </div>
        </div>
      </div>

      <!-- EVENTS PER SESSION -->
      <div class="section">
        <div class="section-title">{{ t('statistics.userStatistics.sessionStats.eventsPerSession.title') }}</div>

        <div class="grid">
          <div class="item">
            <div class="label">{{ t('statistics.userStatistics.sessionStats.eventsPerSession.import') }}</div>
            <div class="value">{{ stats.perSession.import }}</div>
          </div>

          <div class="item">
            <div class="label">{{ t('statistics.userStatistics.sessionStats.eventsPerSession.export') }}</div>
            <div class="value">{{ stats.perSession.export }}</div>
          </div>

          <div class="item">
            <div class="label">{{ t('statistics.userStatistics.sessionStats.eventsPerSession.toolToggle') }}</div>
            <div class="value">{{ stats.perSession.toolToggle }}</div>
          </div>

          <div class="item">
            <div class="label">{{ t('statistics.userStatistics.sessionStats.eventsPerSession.operation') }}</div>
            <div class="value">{{ stats.perSession.operation }}</div>
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
  gap: 25px;
  width: 100%;
}

/* SECTION */
.section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
}

/* GRID 2x4 */
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

/* ITEM */
.item {
  border-radius: 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: var(--highlight-card-c);
  transition: 0.2s;
}

.item:hover {
  background: var(--highlight-card-hover-c);
}

.label {
  font-size: 12px;
  opacity: 0.7;
}

.value {
  font-size: 20px;
  font-weight: 700;
}
</style>
