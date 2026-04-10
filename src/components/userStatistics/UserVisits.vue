<script setup>
/**
 * @file: UserVisits.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for displaying user visit statistics. It fetches the user's visit data from the API on component mount and displays it in a series of data cards, showing total visits, active days, longest streak, and first visit date.
 */
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/common/useApi'
import { useUiStore } from '@/stores/uiStore'
import DataCard from './DataCard.vue'

const { getUserStats } = useApi()
const uiStore = useUiStore()

/**
 * Variable for storing user stats
 */
const stats = ref(null)

/**
 * Get user stats on component mount
 */
onMounted(async () => {
  stats.value = await getUserStats(uiStore.userUuid)
})
</script>

<template>
  <div class="user-visits">

    <div class="basic-info">
      <DataCard :description="$t('statistics.userStatistics.visits.total')" :mainValue="stats.totalVisits"
        icon="IconAllVisits" />
      <DataCard :description="$t('statistics.userStatistics.visits.activeDays')" :mainValue="stats.activeDays"
        icon="IconCalendar" />
      <DataCard :description="$t('statistics.userStatistics.visits.longestStreak')" :mainValue="stats.longestStreak"
        icon="IconFire" />
      <DataCard :description="$t('statistics.userStatistics.visits.firstVisit')" :mainValue="stats.firstVisit"
        icon="IconFirstVisit" />
    </div>

  </div>
</template>

<style scoped>
.user-visits {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.basic-info {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 25px;
}
</style>
