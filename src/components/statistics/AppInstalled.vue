<script setup>
/**
 * @file: AppInstalled.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for displaying the number of times the app has been installed as a PWA.
 */
import { ref, onMounted } from 'vue';
import VisitCard from './VisitCard.vue';
import { useApi } from '@/composables/common/useApi';
const { getAppInstalledCount } = useApi();

/**
 * Reactive variable to store the total number of app installations fetched from the API
 */
const appInstalledCount = ref(0);

/**
 * Fetch app installed count on component mount
 */
onMounted(async () => {
  appInstalledCount.value = await getAppInstalledCount();
});
</script>

<template>
  <div class="all-visits">
    <VisitCard :visitCount="appInstalledCount" icon="IconAppInstalled" visitType="appInstalled" />
  </div>

</template>

<style scoped>
.all-visits {
  width: 100%;
}
</style>
