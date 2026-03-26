<template>
  <div>
    <van-search v-model="searchText" placeholder="搜索物品名称" />
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div v-if="loading" style="padding:40px;text-align:center">
        <van-loading size="40px">加载中...</van-loading>
      </div>
      <van-empty v-else-if="filtered.length === 0" description="暂无库存" />
      <van-cell
        v-for="p in filtered"
        :key="p.id"
        :title="p.name"
        :label="`编码：${p.code} · 库位：${p.slot_id}`"
        is-link
        @click="router.push(`/detail/${p.id}`)"
      >
        <template #value>
          <span>×{{ p.quantity }}</span>
          <van-tag v-if="isExpiringSoon(p.expire_date)" type="danger" style="margin-left:4px">临期</van-tag>
        </template>
      </van-cell>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getList } from '@/utils/request.js'

const router = useRouter()
const searchText = ref('')
const products = ref([])
const loading = ref(true)
const refreshing = ref(false)

const filtered = computed(() => {
  const kw = searchText.value.trim()
  return products.value.filter(p =>
    p.status === 'in' && (!kw || p.name?.includes(kw))
  )
})

function isExpiringSoon(dateStr) {
  if (!dateStr) return false
  const diff = new Date(dateStr) - new Date()
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000
}

async function loadData() {
  const res = await getList('products')
  products.value = res.data || []
}

async function onRefresh() {
  await loadData()
  refreshing.value = false
}

onMounted(async () => {
  await loadData()
  loading.value = false
})
</script>
