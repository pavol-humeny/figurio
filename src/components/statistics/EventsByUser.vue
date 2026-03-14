<script setup>
/**
 * @file: EventsByUser.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/common/useApi'

const { getEventsByUser } = useApi()

/**
 * Reactive array for events grouped by user
 */
const events = ref([])

/**
 * Sorting state
 */
const sortKey = ref('')
const sortAsc = ref(true)

/**
 * Fetch events data on component mount
 */
onMounted(async () => {
  const data = await getEventsByUser()

  events.value = data.map(e => ({
    userId: e.userId,
    importCount: e.importCount,
    exportCount: e.exportCount,
    operationCount: e.operationCount,
    toolToggleCount: e.toolToggleCount,
    keyboardShortcutsCount: e.keyboardShortcutsCount,
    allEventsCount: e.allEventsCount,
  }))

  // Sort by allEventsCount descending by default
  sortKey.value = 'allEventsCount'
  sortAsc.value = false
})

/**
 * Computed property for sorted events
 */
const sortedEvents = computed(() => {
  if (!sortKey.value) return events.value

  return [...events.value].sort((a, b) => {
    const valA = a[sortKey.value]
    const valB = b[sortKey.value]

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
  <div class="events-by-user statistics-card">
    <div class="single-event-title" style="margin-bottom: 30px;">
      {{ $t('statistics.visits.eventsByUser.title') }}
    </div>

    <div class="table-scroll">
      <table class="events-table">
        <colgroup>
          <col style="width: 30%" /> <!-- userId -->
          <col style="width: 11.66%" />
          <col style="width: 11.66%" />
          <col style="width: 11.66%" />
          <col style="width: 11.66%" />
          <col style="width: 11.66%" />
          <col style="width: 11.66%" />
        </colgroup>
        <thead>
          <tr>
            <th @click="sortBy('userId')" class="sortable">
              {{ $t('statistics.visits.eventsByUser.userId') }}
              <span class="sort-indicator">
                <span v-if="sortKey === 'userId'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>

            <th @click="sortBy('importCount')" class="sortable">
              {{ $t('statistics.visits.eventsByUser.imports') }}
              <span class="sort-indicator">
                <span v-if="sortKey === 'importCount'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>

            <th @click="sortBy('exportCount')" class="sortable">
              {{ $t('statistics.visits.eventsByUser.exports') }}
              <span class="sort-indicator">
                <span v-if="sortKey === 'exportCount'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>

            <th @click="sortBy('operationCount')" class="sortable">
              {{ $t('statistics.visits.eventsByUser.operations') }}
              <span class="sort-indicator">
                <span v-if="sortKey === 'operationCount'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>

            <th @click="sortBy('toolToggleCount')" class="sortable">
              {{ $t('statistics.visits.eventsByUser.toolToggles') }}
              <span class="sort-indicator">
                <span v-if="sortKey === 'toolToggleCount'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>

            <th @click="sortBy('keyboardShortcutsCount')" class="sortable">
              {{ $t('statistics.visits.eventsByUser.keyboardShortcuts') }}
              <span class="sort-indicator">
                <span v-if="sortKey === 'keyboardShortcutsCount'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>

            <th @click="sortBy('allEventsCount')" class="sortable">
              {{ $t('statistics.visits.eventsByUser.allEvents') }}
              <span class="sort-indicator">
                <span v-if="sortKey === 'allEventsCount'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="event in sortedEvents" :key="event.userId">
            <td>{{ event.userId }}</td>
            <td>{{ event.importCount }}</td>
            <td>{{ event.exportCount }}</td>
            <td>{{ event.operationCount }}</td>
            <td>{{ event.toolToggleCount }}</td>
            <td>{{ event.keyboardShortcutsCount }}</td>
            <td>{{ event.allEventsCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.events-by-user {
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
.events-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  table-layout: fixed;
}

.events-table thead {
  background-color: var(--primary-c);
  position: sticky;
  top: 0;
}

.events-table th {
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

.events-table td {
  padding: 0.65rem 1rem;
  color: var(--text-c);
  user-select: text;
}

.events-table tbody tr:nth-child(even) {
  background-color: var(--background-c);
}
</style>
