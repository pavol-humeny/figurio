/**
 * @file: index.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Router configuration for the application. Sets up Vue Router with hash-based history mode and defines routes for home, editor, maintenance, and statistics views. Includes a global navigation guard that enforces maintenance mode when the application is not running, redirecting users to the maintenance view and preventing access to other routes.
 */
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
      path: '/UserStatistics',
      name: 'user-statistics',
      component: () => import('@/views/UserStatisticsView.vue'),
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

  // If app is running again, prevent staying on maintenance
  if (globalConfig.isRunning && to.name === 'maintenance') {
    return { name: 'home', replace: true }
  }
})

export default router
