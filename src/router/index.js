import { createRouter, createWebHashHistory  } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

/**
 * App router with views:
 * - HomeView ("/")
 * - EditorView ("/Editor")
 * - MaintenanceView ("/Maintenance")
 */
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
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/MaintenanceView.vue'),
    },
  ],
})

export default router
