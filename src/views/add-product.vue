<template>
  <div>
    <van-nav-bar title="入库登记" left-arrow @click-left="router.back()" />
    <van-cell-group inset style="margin-top:12px">
      <van-field v-model="form.name" label="名称" placeholder="请输入名称" required />
      <van-field v-model="form.code" label="编码" placeholder="请输入编码" required />
      <van-field
        v-model="form.slot_id"
        label="库位"
        placeholder="请选择库位"
        readonly
        is-link
        @click="slotPickerShow = true"
      />
      <van-field v-model.number="form.quantity" label="数量" type="number" placeholder="1" />
      <van-field v-model="form.expire_date" label="过期日期" placeholder="YYYY-MM-DD（可选）" />
      <van-field v-model="form.remark" label="备注" placeholder="可选" />
    </van-cell-group>
    <div style="padding:16px">
      <van-button type="primary" block @click="submit">提交入库</van-button>
    </div>

    <!-- 库位选择器 -->
    <van-popup v-model:show="slotPickerShow" position="bottom" round>
      <van-picker
        :columns="emptySlotOptions"
        show-toolbar
        @confirm="onSlotConfirm"
        @cancel="slotPickerShow = false"
        title="选择空库位"
      >
        <template v-if="emptySlotOptions.length === 0" #columns-top>
          <van-empty description="暂无空闲库位，请先在区域管理中添加" />
        </template>
      </van-picker>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getList, addDoc, updateDoc } from '@/utils/request.js'

const router = useRouter()
const route = useRoute()

const form = ref({ name: '', code: '', slot_id: '', quantity: 1, expire_date: '', remark: '' })
const slotPickerShow = ref(false)
const emptySlots = ref([])
const emptySlotOptions = ref([])

onMounted(async () => {
  if (route.query.code) form.value.code = route.query.code
  const res = await getList('slots')
  emptySlots.value = (res.data || []).filter(s => s.status === 'empty')
  emptySlotOptions.value = emptySlots.value.map(s => ({ text: s.slot_id, value: s.slot_id }))
})

function onSlotConfirm({ selectedOptions }) {
  form.value.slot_id = selectedOptions[0]?.value || ''
  slotPickerShow.value = false
}

async function submit() {
  if (!form.value.name) { showToast('请填写名称'); return }
  if (!form.value.code) { showToast('请填写编码'); return }
  if (!form.value.slot_id) { showToast('请选择库位'); return }

  const data = {
    name: form.value.name,
    code: form.value.code,
    slot_id: form.value.slot_id,
    quantity: form.value.quantity || 1,
    expire_date: form.value.expire_date || '',
    remark: form.value.remark || '',
    status: 'in',
    created_at: new Date().toISOString(),
  }
  await addDoc('products', data)

  // 把库位改为 occupied
  const slot = emptySlots.value.find(s => s.slot_id === form.value.slot_id)
  if (slot) await updateDoc('slots', slot.id, { status: 'occupied' })

  showToast('入库成功')
  setTimeout(() => router.back(), 1000)
}
</script>
