<script setup>
import { ref, computed } from 'vue'

const visits = ref([
  { date: '2025-10-01', total: 120, unique: 90 },
  { date: '2025-10-02', total: 150, unique: 110 },
  { date: '2025-10-03', total: 130, unique: 100 },
  { date: '2025-10-04', total: 170, unique: 140 },
  { date: '2025-10-05', total: 160, unique: 120 },
  { date: '2025-10-06', total: 90, unique: 80 },
  { date: '2025-10-07', total: 70, unique: 60 },
  // More data can be added here
])

const sortKey = ref('')
const sortAsc = ref(true)
const fromDate = ref('')
const toDate = ref('')

const filteredVisits = computed(() => {
  const from = fromDate.value ? parseInt(fromDate.value.replace(/-/g, ''), 10) : null
  const to = toDate.value ? parseInt(toDate.value.replace(/-/g, ''), 10) : null

  console.log('Filtering visits from', from, 'to', to)

  return visits.value.filter(v => {
    const vDate = parseInt(v.date.replace(/-/g, ''), 10)
    if (from !== null && vDate < from) return false
    if (to !== null && vDate > to) return false
    return true
  })
})

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

const sortBy = (key) => {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value
  else {
    sortKey.value = key
    sortAsc.value = true
  }
}

const resetFilter = () => {
  fromDate.value = ''
  toDate.value = ''
}
</script>

<template>
  <div class="days-visits statistics-card">
    <div class="date-filter">
      <label>
        Od:
        <input type="date" v-model="fromDate" />
      </label>
      <label>
        Do:
        <input type="date" v-model="toDate" />
      </label>
      <button class="reset-btn" @click="resetFilter">Resetovať</button>
    </div>

    <div class="table-scroll">
      <table class="days-visits-table">
        <thead>
          <tr>
            <th @click="sortBy('date')" class="sortable">
              Dátum
              <span class="sort-indicator">
                <span v-if="sortKey === 'date'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>
            <th @click="sortBy('total')" class="sortable">
              Celkový počet
              <span class="sort-indicator">
                <span v-if="sortKey === 'total'">{{ sortAsc ? '▲' : '▼' }}</span>
              </span>
            </th>
            <th @click="sortBy('unique')" class="sortable">
              Unikátne návštevy
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
</style>
