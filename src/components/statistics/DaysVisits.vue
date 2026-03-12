<script setup>
/**
 * @file: DaysVisits.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/common/useApi'

const { getDaysVisits } = useApi()

/**
 * Reactive array for visits data
 */
const visits = ref([])

/**
 * Sorting and filtering state
 */
const sortKey = ref('')
const sortAsc = ref(true)
const fromDate = ref('')
const toDate = ref('')

/**
 * Fetch visits data on component mount
 */
onMounted(async () => {
  const data = await getDaysVisits()

  // Map API fields to table fields
  visits.value = data.map(v => ({
    date: v.date.split('T')[0], // format YYYY-MM-DD
    total: v.allVisits,
    unique: v.newUsers,
  }))
})

/**
 * Computed properties for filtered and sorted visits
 */
const filteredVisits = computed(() => {
  const from = fromDate.value ? parseInt(fromDate.value.replace(/-/g, ''), 10) : null
  const to = toDate.value ? parseInt(toDate.value.replace(/-/g, ''), 10) : null

  return visits.value.filter(v => {
    const vDate = parseInt(v.date.replace(/-/g, ''), 10)
    if (from !== null && vDate < from) return false
    if (to !== null && vDate > to) return false
    return true
  })
})

/**
 * Computed property for sorted visits
 */
const sortedVisits = computed(() => {
  const base = filteredVisits.value
  if (!sortKey.value) return base
  return [...base].sort((a, b) => {
    const valA = sortKey.value === 'sum' ? a.total + a.unique : a[sortKey.value]
    const valB = sortKey.value === 'sum' ? b.total + b.unique : b[sortKey.value]
    if (valA < valB) return sortAsc.value ? -1 : 1
    if (valA > valB) return sortAsc.value ? 1 : -1
    return 0
  })
})

/**
 * Methods for sorting
 */
const sortBy = (key) => {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value
  else {
    sortKey.value = key
    sortAsc.value = true
  }
}

/**
 * Reset date filters
 */
const resetFilter = () => {
  fromDate.value = ''
  toDate.value = ''
}
</script>

<template>
  <div class="days-visits statistics-card">
    <div class="single-event-title" style="margin-bottom: 30px;">
      {{ $t('statistics.visits.allDaysVisits') }}
    </div>

    <div class="date-filter">
      <label>
        {{ $t('statistics.visits.table.from') }}:
        <input type="date" v-model="fromDate" />
      </label>
      <label>
        {{ $t('statistics.visits.table.to') }}:
        <input type="date" v-model="toDate" />
      </label>
      <button class="reset-btn" @click="resetFilter">{{ $t('statistics.visits.table.reset') }}</button>
    </div>

    <div class="table-scroll">
      <table class="days-visits-table">
        <thead>
          <tr>
            <th @click="sortBy('date')" class="sortable">
              {{ $t('statistics.visits.table.date') }}
              <span class="sort-indicator">
                <span v-if="sortKey === 'date'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>
            <th @click="sortBy('total')" class="sortable">
              {{ $t('statistics.visits.table.allVisits') }}
              <span class="sort-indicator">
                <span v-if="sortKey === 'total'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>
            <th @click="sortBy('unique')" class="sortable">
              {{ $t('statistics.visits.table.uniqueVisits') }}
              <span class="sort-indicator">
                <span v-if="sortKey === 'unique'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="visit in sortedVisits" :key="visit.date">
            <td>{{ visit.date }}</td>
            <td>{{ visit.total }}</td>
            <td>{{ visit.unique }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* (styles unchanged) */
.days-visits {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Date range filter styling */
.date-filter {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-c);
}

.date-filter label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.date-filter input {
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--border-c);
  background-color: var(--background-c);
  color: var(--text-c);
}

/* Reset button */
.reset-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 15px;
  font-weight: 600;
  background-color: var(--primary-c);
  border: 1px solid var(--primary-c);
  color: var(--secondary-c);
  cursor: pointer;
  font-size: 0.85rem;
  transition: var(--default-transition);
}

.reset-btn:hover {
  background-color: var(--secondary-c);
  color: var(--primary-c);
  transition: var(--default-transition);
}

.table-scroll {
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.days-visits-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  table-layout: fixed;
}

.days-visits-table thead {
  background-color: var(--primary-c);
  color: var(--text-c);
  position: sticky;
  top: 0;
}

.days-visits-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: var(--secondary-c);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.sort-indicator {
  display: inline-block;
  width: 1em;
  text-align: center;
}

.sortable:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.days-visits-table td {
  padding: 0.65rem 1rem;
  color: var(--text-c);
  text-overflow: ellipsis;
  overflow: hidden;
}

.days-visits-table tbody tr:nth-child(even) {
  background-color: var(--background-c);
}

.table-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--statistics-title-c);
}
</style>
