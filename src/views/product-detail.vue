<template>
  <div class="product-detail">
    <van-nav-bar
      title="物品详情"
      left-arrow
      @click-left="$router.back()"
    />

    <van-loading v-if="loading" size="40px" class="center-loading" />

    <template v-else-if="product">
      <van-cell-group inset style="margin-top:12px">
        <van-cell title="名称" :value="product.name" />
        <van-cell title="编码" :value="product.code" />
        <van-cell title="库位" :value="product.slot_id || '-'" />
        <van-cell title="数量" :value="String(product.quantity)" />
        <van-cell title="入库时间" :value="product.created_at || '-'" />
        <van-cell title="到期日" :value="product.expire_date || '未填写'" />
        <van-cell title="备注" :value="product.remark || '-'" />
      </van-cell-group>

      <div class="btns">
        <van-button block type="primary" @click="goMap">地图定位</van-button>
        <van-button block type="danger" @click="confirmOutbound">出库</van-button>
      </div>
    </template>

    <van-empty v-else description="物品不存在" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { getList, updateDoc } from '../utils/request'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const product = ref(null)
const slotRecord = ref(null)

onMounted(async () => {
  try {
    const res = await getList('products')
    product.value = (res.data || []).find(p => p.id === route.params.id) || null

    if (product.value?.slot_id) {
      const sRes = await getList('slots')
      slotRecord.value = (sRes.data || []).find(s => s.slot_id === product.value.slot_id) || null
    }
  } finally {
    loading.value = false
  }
})

function goMap() {
  router.push({ path: '/map', query: { highlight: product.value.slot_id } })
}

async function confirmOutbound() {
  await showConfirmDialog({ title: '确认出库', message: `确认将「${product.value.name}」出库？` })
  await updateDoc('products', product.value.id, { status: 'out' })
  if (slotRecord.value) {
    await updateDoc('slots', slotRecord.value.id, { status: 'empty' })
  }
  showToast('出库成功')
  router.back()
}
</script>

<style scoped>
.product-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}
.center-loading {
  display: flex;
  justify-content: center;
  padding-top: 100px;
}
.btns {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
