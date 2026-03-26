import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/home-page.vue'
import ScanPage from '@/views/scan-page.vue'
import AddProduct from '@/views/add-product.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/scan', component: ScanPage },
  { path: '/add', component: AddProduct },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
