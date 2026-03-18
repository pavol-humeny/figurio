<script setup>
/**
 * @file: StatisticsView.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { ref } from 'vue';
import AllVisits from '../components/statistics/AllVisits.vue';
import UniqueVisits from '../components/statistics/UniqueVisits.vue';
import LastDaysVisits from '../components/statistics/LastDaysVisits.vue';
import CountryVisits from '../components/statistics/CountryVisits.vue';
// import DaysVisits from '@/components/statistics/DaysVisits.vue';
import EventsOverview from '@/components/statistics/EventsOverview.vue';
import { globalConfig } from '@/config/globalConfig.js';
import EventToggleTool from '@/components/statistics/EventToggleTool.vue';
import EventUploadImage from '@/components/statistics/EventUploadImage.vue';
import EventExportImage from '@/components/statistics/EventExportImage.vue';
import EventOpenModal from '@/components/statistics/EventOpenModal.vue';
import EventKeyboardShortcuts from '@/components/statistics/EventKeyboardShortcuts.vue';
import EventApplyOperation from '@/components/statistics/EventApplyOperation.vue';
import VisitsByDayFullRange from '@/components/statistics/VisitsByDayFullRange.vue';
import SessionsByDay from '@/components/statistics/SessionsByDay.vue';
import EventsPerVisit from '@/components/statistics/EventsPerVisit.vue';
import VisitsByUser from '@/components/statistics/VisitsByUser.vue';
import EventsByUser from '@/components/statistics/EventsByUser.vue';
import SessionDurationByUser from '@/components/statistics/sessionDurationByUser.vue';
import AppInstalled from '@/components/statistics/AppInstalled.vue';
import NumberOfPWA from '@/components/statistics/NumberOfPWA.vue';

const statisticsView = ref(localStorage.getItem(`${globalConfig.LOCAL_STORAGE_PREFIX}statisticsView`) || 'visits'); // 'visits' | 'events'

const selectStatistics = (view) => {
  localStorage.setItem(
    `${globalConfig.LOCAL_STORAGE_PREFIX}statisticsView`,
    view
  )
  statisticsView.value = view;
};

</script>

<template>
  <div class="statistics-view">
    <div class="visits-events-wrapper">
      <div class="visits-events-background">
        <div :class="['visits-event-button', statisticsView === 'visits' ? 'active' : '']"
          @click="selectStatistics('visits')">
          {{ $t('statistics.visits.buttonText.text') }}
        </div>
        <div :class="['visits-event-button', statisticsView === 'events' ? 'active' : '']"
          @click="selectStatistics('events')">
          {{ $t('statistics.events.buttonText.text') }}
        </div>
      </div>
    </div>
    <div v-if="statisticsView === 'visits'" class="visits-wrapper">
      <div class="all-unique-visits">
        <AllVisits />
        <NumberOfPWA />
        <UniqueVisits />
        <AppInstalled />
      </div>
      <LastDaysVisits />
      <VisitsByDayFullRange />
      <SessionsByDay />
      <EventsPerVisit />
      <CountryVisits />
      <VisitsByUser />
      <EventsByUser />
      <SessionDurationByUser />
    </div>
    <div v-else-if="statisticsView === 'events'" class="events-wrapper">
      <EventsOverview />
      <EventToggleTool />
      <EventApplyOperation />
      <EventUploadImage />
      <EventExportImage />
      <EventOpenModal />
      <EventKeyboardShortcuts />
    </div>
  </div>
</template>

<style scoped>
.statistics-view {
  position: relative;
  width: 100vw;
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

.visits-events-wrapper {
  width: 100%;
  padding: 0 10%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.visits-events-background {
  background: var(--secondary-c);
  width: 100%;
  height: 40px;
  border-radius: 20px;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 5px;
}

.visits-event-button {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  font-weight: 600;
  color: var(--text-secondary-c);
  border-radius: 20px;
}

.visits-event-button:hover {
  background: var(--background-c);
}

.visits-event-button.active {
  background: var(--primary-c);
  color: var(--secondary-c);
  box-shadow: var(--box-shadow-hover);
}

/* visits */
.visits-wrapper {
  width: 100%;
  padding: 0 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 25px;
}

.all-unique-visits {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 25px;
}

.all-unique-visits>* {
  flex: 1;
  /* Each child takes up equal space */
}

/* events */
.events-wrapper {
  width: 100%;
  padding: 0 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 25px;
}
</style>
