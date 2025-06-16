import { createRouter, createWebHistory } from 'vue-router'
import DragAndDropView from '../views/DragAndDropView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'DragAndDrop',
      component: DragAndDropView,
    },
    {
      path: '/Editor',
      name: 'Editor',
      component: () => import('../views/EditorView.vue'),
    },
  ],
})

export default router
