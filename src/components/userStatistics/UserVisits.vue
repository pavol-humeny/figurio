<script setup>
/**
 * @file: UserVisits.vue
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
      <DataCard description="Visits" :mainValue="stats.totalVisits" icon="IconAllVisits" />
      <DataCard description="Active Days" :mainValue="stats.activeDays" icon="IconCalendar" />
      <DataCard description="Longest Streak" :mainValue="stats.longestStreak" icon="IconFire" />
      <DataCard description="First Visit" :mainValue="stats.firstVisit" icon="IconFirstVisit" />
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
