<template>
  <div class="home-page">
    <van-nav-bar title="实物管家" />

    <div v-if="loading" class="center-loading">
      <van-loading size="40px">加载中...</van-loading>
    </div>

    <template v-else>
      <!-- 统计卡片 -->
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-num">{{ stockCount }}</div>
          <div class="stat-label">当前库存</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">{{ zoneCount }}</div>
          <div class="stat-label">总区域数</div>
        </div>
        <div class="stat-card warn">
          <div class="stat-num">{{ expireCount }}</div>
          <div class="stat-label">临期预警</div>
        </div>
      </div>

      <!-- 临期预警列表 -->
      <div class="section">
        <div class="section-title">临期预警（7天内到期）</div>
        <van-empty v-if="expireList.length === 0" description="暂无临期物品" />
        <van-cell
          v-for="item in expireList"
          :key="item.id"
          :title="item.name"
          :label="'编码：' + item.code"
          :value="'到期：' + item.expire_date"
          class="expire-cell"
        />
      </div>

      <!-- 快捷按钮 -->
      <div class="section">
        <div class="section-title">快捷操作</div>
        <div class="quick-btns">
          <van-button type="primary" block @click="$router.push('/scan')">扫码入库</van-button>
          <van-button type="success" block @click="$router.push('/stock')">查看库存</van-button>
          <van-button type="default" block @click="$router.push('/zone-manage')">区域管理</van-button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getList } from '../utils/request'

const loading = ref(true)
const stockCount = ref(0)
const zoneCount = ref(0)
const expireCount = ref(0)
const expireList = ref([])

onMounted(async () => {
  try {
    const [productsRes, zonesRes] = await Promise.all([
      getList('products'),
      getList('zones'),
    ])

    const products = productsRes.data || []
    const zones = zonesRes.data || []

    stockCount.value = products.filter(p => p.status === 'in').length
    zoneCount.value = zones.length

    const now = new Date()
    const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    expireList.value = products.filter(p => {
      if (!p.expire_date || p.status !== 'in') return false
      const d = new Date(p.expire_date)
      return d >= now && d <= in7days
    })
    expireCount.value = expireList.value.length
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}
.center-loading {
  display: flex;
  justify-content: center;
  padding-top: 100px;
}
.stat-cards {
  display: flex;
  gap: 12px;
  padding: 16px;
}
.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 16px 8px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
.stat-card.warn .stat-num {
  color: #ee0a24;
}
.stat-num {
  font-size: 28px;
  font-weight: bold;
  color: #1989fa;
}
.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
.section {
  margin: 0 16px 16px;
}
.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}
.expire-cell {
  border-radius: 8px;
  margin-bottom: 4px;
}
:deep(.expire-cell .van-cell__value) {
  color: #ee0a24;
}
.quick-btns {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
