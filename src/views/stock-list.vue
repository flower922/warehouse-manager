<template>
  <div class="stock-list">
    <van-search v-model="keyword" placeholder="搜索物品名称" @update:model-value="onSearch" />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-loading v-if="loading" size="40px" class="center-loading" />

      <template v-else>
        <van-empty v-if="filtered.length === 0" description="暂无库存物品" />

        <van-cell
          v-for="item in filtered"
          :key="item.id"
          :class="['item-cell', isExpiringSoon(item) ? 'expiring' : '']"
          @click="$router.push('/detail/' + item.id)"
        >
          <template #title>
            <span :style="isExpiringSoon(item) ? 'color:#ee0a24;font-weight:bold' : ''">
              {{ item.name }}
            </span>
          </template>
          <template #label>
            <span>编码：{{ item.code }} | 库位：{{ item.slot_id || '-' }} | 数量：{{ item.quantity }}</span>
            <br />
            <span :style="isExpiringSoon(item) ? 'color:#ee0a24' : 'color:#999'">
              到期日：{{ item.expire_date || '未填写' }}
            </span>
          </template>
          <template #right-icon>
            <van-icon name="arrow" />
          </template>
        </van-cell>
      </template>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getList } from '../utils/request'

const keyword = ref('')
const loading = ref(true)
const refreshing = ref(false)
const allItems = ref([])
const filtered = ref([])

function isExpiringSoon(item) {
  if (!item.expire_date) return false
  const now = new Date()
  const d = new Date(item.expire_date)
  return d >= now && d <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
}

function onSearch(val) {
  filtered.value = allItems.value.filter(p =>
    p.name.includes(val)
  )
}

async function loadData() {
  const res = await getList('products')
  allItems.value = (res.data || []).filter(p => p.status === 'in')
  filtered.value = keyword.value
    ? allItems.value.filter(p => p.name.includes(keyword.value))
    : allItems.value
}

async function onRefresh() {
  await loadData()
  refreshing.value = false
}

onMounted(async () => {
  try {
    await loadData()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.stock-list {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}
.center-loading {
  display: flex;
  justify-content: center;
  padding-top: 100px;
}
.item-cell {
  margin-bottom: 2px;
}
.expiring {
  border-left: 3px solid #ee0a24;
}
</style>
