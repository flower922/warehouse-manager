import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/home-page.vue'
import MapView from '@/views/map-view.vue'
import ScanPage from '@/views/scan-page.vue'
import StockList from '@/views/stock-list.vue'
import AddProduct from '@/views/add-product.vue'
import ProductDetail from '@/views/product-detail.vue'
import ZoneManage from '@/views/zone-manage.vue'

const routes = [
  { path: '/',            component: HomePage,      meta: { showTabbar: true } },
  { path: '/map',         component: MapView,        meta: { showTabbar: true } },
  { path: '/scan',        component: ScanPage,       meta: { showTabbar: true } },
  { path: '/stock',       component: StockList,      meta: { showTabbar: true } },
  { path: '/add',         component: AddProduct,     meta: { showTabbar: false } },
  { path: '/detail/:id',  component: ProductDetail,  meta: { showTabbar: false } },
  { path: '/zone-manage', component: ZoneManage,     meta: { showTabbar: false } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
