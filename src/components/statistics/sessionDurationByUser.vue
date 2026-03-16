<script setup>
/**
 * @file: SessionDurationByUser.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for displaying session duration statistics by user. It fetches the data from the API on component mount and displays it in a sortable table, showing minimum, maximum, average session duration, and total session time for each user.
 */
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/common/useApi'
const { getSessionDurationByUser } = useApi()

/**
 * Reactive array for session durations
 */
const sessions = ref([])

/**
 * Sorting state
 */
const sortKey = ref('')
const sortAsc = ref(true)

/**
 * Fetch data on mount
 */
onMounted(async () => {
  const data = await getSessionDurationByUser()

  if (!data) return

  sessions.value = data.map(s => ({
    userId: s.userId,
    minSession: s.minSession,
    maxSession: s.maxSession,
    avgSession: s.avgSession,
    totalSessionsTime: s.totalSessionsTime,
  }))
})

/**
 * Computed sorted sessions
 */
const sortedSessions = computed(() => {
  if (!sortKey.value) return sessions.value

  return [...sessions.value].sort((a, b) => {
    let valA = a[sortKey.value]
    let valB = b[sortKey.value]

    // Convert numeric values
    if (!isNaN(valA) && !isNaN(valB)) {
      valA = Number(valA)
      valB = Number(valB)
    }

    if (valA < valB) return sortAsc.value ? -1 : 1
    if (valA > valB) return sortAsc.value ? 1 : -1
    return 0
  })
})

/**
 * Sorting method
 */
const sortBy = (key) => {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value
  else {
    sortKey.value = key
    sortAsc.value = true
  }
}
</script>

<template>
  <div class="session-duration-by-user statistics-card">
    <div class="single-event-title" style="margin-bottom: 30px;">
      {{ $t('statistics.visits.sessionDurationByUser.title') }}
    </div>

    <div class="table-scroll">
      <table class="sessions-table">

        <colgroup>
          <col style="width:30%">
          <col style="width:17.5%">
          <col style="width:17.5%">
          <col style="width:17.5%">
          <col style="width:17.5%">
        </colgroup>

        <thead>
          <tr>
            <th @click="sortBy('userId')" class="sortable">
              {{ $t('statistics.visits.sessionDurationByUser.userId') }}
              <span class="sort-indicator">
                <span v-if="sortKey === 'userId'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>

            <th @click="sortBy('minSession')" class="sortable">
              {{ $t('statistics.visits.sessionDurationByUser.min') }}
              <span class="sort-indicator">
                <span v-if="sortKey === 'minSession'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>

            <th @click="sortBy('maxSession')" class="sortable">
              {{ $t('statistics.visits.sessionDurationByUser.max') }}
              <span class="sort-indicator">
                <span v-if="sortKey === 'maxSession'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>

            <th @click="sortBy('avgSession')" class="sortable">
              {{ $t('statistics.visits.sessionDurationByUser.avg') }}
              <span class="sort-indicator">
                <span v-if="sortKey === 'avgSession'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>

            <th @click="sortBy('totalSessionsTime')" class="sortable">
              {{ $t('statistics.visits.sessionDurationByUser.total') }}
              <span class="sort-indicator">
                <span v-if="sortKey === 'totalSessionsTime'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="session in sortedSessions" :key="session.userId">
            <td>{{ session.userId }}</td>
            <td>{{ session.minSession }}</td>
            <td>{{ session.maxSession }}</td>
            <td>{{ session.avgSession }}</td>
            <td>{{ session.totalSessionsTime }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.session-duration-by-user {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Scroll container */
.table-scroll {
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* Table */
.sessions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  table-layout: fixed;
}

.sessions-table thead {
  background-color: var(--primary-c);
  position: sticky;
  top: 0;
}

.sessions-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: var(--secondary-c);
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
}

.sortable:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.sort-indicator {
  display: inline-block;
  width: 1em;
  text-align: center;
}

.sessions-table td {
  padding: 0.65rem 1rem;
  color: var(--text-c);
  user-select: text;
}

.sessions-table tbody tr:nth-child(even) {
  background-color: var(--background-c);
}

.sessions-table td:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
