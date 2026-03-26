<template>
  <div>
    <van-nav-bar title="物品详情" left-arrow @click-left="router.back()" />
    <div v-if="loading" style="padding:40px;text-align:center">
      <van-loading size="40px">加载中...</van-loading>
    </div>
    <template v-else-if="product">
      <van-cell-group inset style="margin-top:12px">
        <van-cell title="名称" :value="product.name" />
        <van-cell title="编码" :value="product.code" />
        <van-cell title="库位" :value="product.slot_id" />
        <van-cell title="数量" :value="String(product.quantity)" />
        <van-cell title="入库时间" :value="product.created_at?.slice(0, 10) || '-'" />
        <van-cell title="到期日" :value="product.expire_date || '-'" />
        <van-cell title="备注" :value="product.remark || '-'" />
      </van-cell-group>
      <div style="padding:16px;display:flex;gap:12px">
        <van-button type="default" block @click="router.push('/map')">地图定位</van-button>
        <van-button type="danger" block @click="confirmCheckout">出库</van-button>
      </div>
    </template>
    <van-empty v-else description="物品不存在" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { getList, updateDoc } from '@/utils/request.js'

const router = useRouter()
const route = useRoute()
const product = ref(null)
const loading = ref(true)

onMounted(async () => {
  const res = await getList('products')
  product.value = (res.data || []).find(p => p.id === route.params.id) || null
  loading.value = false
})

function confirmCheckout() {
  showConfirmDialog({ title: '确认出库', message: `确认将「${product.value.name}」出库？` })
    .then(async () => {
      await updateDoc('products', product.value.id, { status: 'out' })
      // 释放库位
      const sRes = await getList('slots')
      const slot = (sRes.data || []).find(s => s.slot_id === product.value.slot_id)
      if (slot) await updateDoc('slots', slot.id, { status: 'empty' })
      showToast('出库成功')
      setTimeout(() => router.replace('/stock'), 1000)
    })
    .catch(() => {})
}
</script>
