import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/home-page.vue'
import MapView from '@/views/map-view.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/map', component: MapView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
