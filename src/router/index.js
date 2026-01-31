import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { globalConfig } from '@/config/globalConfig.js'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/Editor',
      name: 'editor',
      component: () => import('@/views/EditorView.vue'),
    },
    {
      path: '/Maintenance',
      name: 'maintenance',
      component: () => import('@/views/MaintenanceView.vue'),
    },
    {
      path: '/Statistics',
      name: 'statistics',
      component: () => import('@/views/StatisticsView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/MaintenanceView.vue'),
    },
  ],
})

/**
 * Global maintenance guard
 */
router.beforeEach((to) => {
  if (!globalConfig.isRunning && to.name !== 'maintenance') {
    return { name: 'maintenance', replace: true }
  }

  // Optional: if app is running again, prevent staying on maintenance
  if (globalConfig.isRunning && to.name === 'maintenance') {
    return { name: 'home', replace: true }
  }
})

export default router
