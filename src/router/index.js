import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/home-page.vue'

const routes = [
  { path: '/', component: HomePage, meta: { showTabbar: true } },
  { path: '/map', component: () => import('@/views/map-page.vue'), meta: { showTabbar: true } },
  { path: '/scan', component: () => import('@/views/scan-page.vue'), meta: { showTabbar: true } },
  { path: '/stock', component: () => import('@/views/stock-page.vue'), meta: { showTabbar: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
