<script setup>
/**
 * @file: VisitsByUser.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for displaying the number of visits by user. It fetches the data from the API on component mount and displays it in a sortable table, showing the user ID and the count of visits for each user.
 */
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/common/useApi'

const { getVisitsByUser } = useApi()

/**
 * Reactive array for visits grouped by user
 */
const visits = ref([])

/**
 * Sorting state
 */
const sortKey = ref('')
const sortAsc = ref(true)

/**
 * Fetch visits data on component mount
 */
onMounted(async () => {
  const data = await getVisitsByUser()

  visits.value = data.map(v => ({
    userId: v.userId,
    visitCount: v.visitCount,
  }))
})

/**
 * Computed property for sorted visits
 */
const sortedVisits = computed(() => {
  if (!sortKey.value) return visits.value

  return [...visits.value].sort((a, b) => {
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
  <div class="visits-by-user statistics-card">
    <div class="single-event-title" style="margin-bottom: 30px;">
      {{ $t('statistics.visits.visitsByUser.title') }}
    </div>

    <div class="table-scroll">
      <table class="visits-table">
        <thead>
          <tr>
            <th @click="sortBy('userId')" class="sortable">
              {{ $t('statistics.visits.visitsByUser.userId') }}
              <span class="sort-indicator">
                <span v-if="sortKey === 'userId'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>

            <th @click="sortBy('visitCount')" class="sortable">
              {{ $t('statistics.visits.visitsByUser.visits') }}
              <span class="sort-indicator">
                <span v-if="sortKey === 'visitCount'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="visit in sortedVisits" :key="visit.userId">
            <td>{{ visit.userId }}</td>
            <td>{{ visit.visitCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.visits-by-user {
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
.visits-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  table-layout: fixed;
}

.visits-table thead {
  background-color: var(--primary-c);
  position: sticky;
  top: 0;
}

.visits-table th {
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

.visits-table td {
  padding: 0.65rem 1rem;
  color: var(--text-c);
  user-select: text;
}

.visits-table tbody tr:nth-child(even) {
  background-color: var(--background-c);
}
</style>
