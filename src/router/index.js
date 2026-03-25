import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/home-page.vue'
import MapView from '@/views/map-view.vue'
import ZoneManage from '@/views/zone-manage.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/map', component: MapView },
  { path: '/zone-manage', component: ZoneManage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
