<template>
  <div class="map-page">
    <!-- 顶部搜索框 -->
    <van-search
      v-model="searchText"
      placeholder="搜索物品名称"
      @search="handleSearch"
      @clear="clearSearch"
    />

    <!-- 地图容器 -->
    <div ref="mapEl" class="map-container" />

    <!-- 无区域时占位 -->
    <div v-if="zones.length === 0 && !loading" class="empty-wrap">
      <van-empty description="暂无区域，请先添加" />
    </div>

    <!-- 底部弹窗：区域物品列表 -->
    <van-popup
      v-model:show="popupShow"
      position="bottom"
      round
      :style="{ height: '50%' }"
    >
      <div class="popup-header">
        <span class="popup-title">{{ activeZone?.name }} · 物品列表</span>
      </div>
      <van-list class="popup-list">
        <van-empty v-if="zoneProducts.length === 0" description="该区域暂无物品" />
        <van-cell
          v-for="p in zoneProducts"
          :key="p._id"
          :title="p.name"
          :label="p.code"
          :value="`×${p.quantity}`"
        />
      </van-list>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getList } from '@/utils/request.js'

const mapEl = ref(null)
const searchText = ref('')
const zones = ref([])
const loading = ref(true)
const popupShow = ref(false)
const activeZone = ref(null)
const zoneProducts = ref([])

let map = null
const rectLayers = new Map() // zone._id -> { rect, label }

function initMap() {
  map = L.map(mapEl.value, {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 2,
    zoomSnap: 0.5,
  })

  // 纯色背景占位
  const bounds = [[0, 0], [600, 1000]]
  L.imageOverlay('', bounds).addTo(map)

  // 占位文字
  L.divIcon({ className: '' })
  L.marker([300, 500], {
    icon: L.divIcon({
      className: 'map-placeholder',
      html: '<div class="placeholder-text">厂区平面图</div>',
      iconSize: [200, 40],
      iconAnchor: [100, 20],
    }),
  }).addTo(map)

  map.fitBounds(bounds)
}

function drawZones() {
  zones.value.forEach(zone => {
    const bounds = [
      [zone.y, zone.x],
      [zone.y + zone.h, zone.x + zone.w],
    ]

    const rect = L.rectangle(bounds, {
      color: zone.color || '#1989fa',
      fillColor: zone.color || '#1989fa',
      fillOpacity: 0.3,
      weight: 2,
    }).addTo(map)

    const center = [(zone.y + zone.h / 2), (zone.x + zone.w / 2)]
    const label = L.marker(center, {
      icon: L.divIcon({
        className: 'zone-label',
        html: `<div class="zone-name">${zone.name}</div>`,
        iconSize: [80, 24],
        iconAnchor: [40, 12],
      }),
      interactive: false,
    }).addTo(map)

    rect.on('click', () => openZonePopup(zone))
    rectLayers.set(zone._id, { rect, label })
  })
}

async function openZonePopup(zone) {
  activeZone.value = zone
  popupShow.value = true
  const allProducts = await getList('products')
  zoneProducts.value = allProducts.filter(p => p.slot_id?.startsWith(zone.code + '-'))
}

async function handleSearch() {
  const keyword = searchText.value.trim()
  if (!keyword) return

  const allProducts = await getList('products')
  const matched = allProducts.find(p => p.name?.includes(keyword))
  if (!matched) {
    return
  }

  // 找到对应区域
  const zoneCode = matched.slot_id?.split('-')[0]
  const zone = zones.value.find(z => z.code === zoneCode)
  if (!zone) return

  // 高亮该区域
  rectLayers.forEach(({ rect }) => {
    rect.setStyle({ fillOpacity: 0.3, weight: 2 })
  })
  const layer = rectLayers.get(zone._id)
  if (layer) {
    layer.rect.setStyle({ fillOpacity: 0.7, weight: 4 })
    map.fitBounds(layer.rect.getBounds())
  }
}

function clearSearch() {
  rectLayers.forEach(({ rect, label }) => {
    rect.setStyle({ fillOpacity: 0.3, weight: 2 })
  })
}

onMounted(async () => {
  initMap()
  try {
    zones.value = await getList('zones')
    drawZones()
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  map?.remove()
})
</script>

<style scoped>
.map-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.map-container {
  flex: 1;
  background: #e8f0e8;
}

.empty-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.popup-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.popup-title {
  font-size: 16px;
  font-weight: bold;
}

.popup-list {
  overflow-y: auto;
  height: calc(100% - 57px);
}
</style>

<style>
.placeholder-text {
  font-size: 20px;
  color: #aaa;
  font-weight: bold;
  white-space: nowrap;
}

.zone-name {
  font-size: 12px;
  color: #333;
  font-weight: bold;
  white-space: nowrap;
  text-align: center;
}
</style>
