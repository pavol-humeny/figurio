<script setup>
/**
 * @file: UserStatisticsView.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: User statistics page of the application. This component provides information about user interactions with the app, such as visits and events. It features a toggle to switch between visits and events statistics, and displays various charts and data visualizations to help understand how users are using the app and which features are most popular.
 */
import UserVisits from '@/components/userStatistics/UserVisits.vue';
import ToolsStats from '@/components/userStatistics/ToolsStats.vue'
import EventsStats from '@/components/userStatistics/EventsStats.vue'

</script>

<template>
  <div class="user-statistics-view">
    <div class="user-statistics-wrapper">
      <div class="title">
        <p>{{ $t('statistics.userStatistics.title') }}</p>
      </div>
      <UserVisits />
      <ToolsStats />
      <EventsStats />
    </div>
  </div>
</template>

<style scoped>
.user-statistics-view {
  position: relative;
  width: 100%;
  min-width: var(--min-window-width);
  height: 100%;
  background: var(--background-c);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0 100px 0;
  gap: 25px;
  overflow: auto;
}

.user-statistics-wrapper {
  width: 100%;
  padding: 0 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 25px;
}

.title p {
  font-size: 28px;
  font-weight: 700;
}
</style>
