<template>
  <div>
    <van-nav-bar title="区域管理" left-arrow @click-left="router.back()" />

    <van-tabs v-model:active="activeTab">
      <!-- ========== 区域管理 Tab ========== -->
      <van-tab title="区域管理">
        <van-button
          type="primary"
          size="small"
          icon="plus"
          style="margin: 12px 16px"
          @click="openZoneForm(null)"
        >
          添加区域
        </van-button>

        <van-empty v-if="zones.length === 0" description="暂无区域" />

        <van-swipe-cell v-for="zone in zones" :key="zone._id">
          <van-cell @click="openZoneForm(zone)">
            <template #title>
              <span
                class="color-dot"
                :style="{ background: zone.color || '#ccc' }"
              />
              {{ zone.name }}
            </template>
            <template #label>编码：{{ zone.code }}</template>
          </van-cell>
          <template #right>
            <van-button
              square
              type="danger"
              text="删除"
              style="height: 100%"
              @click="confirmDeleteZone(zone)"
            />
          </template>
        </van-swipe-cell>
      </van-tab>

      <!-- ========== 库位管理 Tab ========== -->
      <van-tab title="库位管理">
        <div style="padding: 12px 16px">
          <van-field
            v-model="batchZoneCode"
            label="区域编码"
            placeholder="如 A"
            style="margin-bottom: 8px"
          />
          <van-field
            v-model="batchCount"
            label="数量"
            type="number"
            placeholder="如 10"
          />
          <van-button
            type="primary"
            block
            style="margin-top: 8px"
            @click="batchAddSlots"
          >
            批量添加库位
          </van-button>
        </div>

        <van-empty v-if="slots.length === 0" description="暂无库位" />

        <template v-for="zone in zonesWithSlots" :key="zone.code">
          <van-cell-group :title="zone.name">
            <van-cell
              v-for="slot in zone.slots"
              :key="slot._id"
              :title="slot.slot_id"
            >
              <template #right-icon>
                <van-tag :type="slot.status === 'occupied' ? 'danger' : 'success'">
                  {{ slot.status === 'occupied' ? '占用' : '空闲' }}
                </van-tag>
              </template>
            </van-cell>
          </van-cell-group>
        </template>
      </van-tab>
    </van-tabs>

    <!-- 区域表单弹窗 -->
    <van-popup
      v-model:show="zoneFormShow"
      position="bottom"
      round
      :style="{ height: '70%' }"
    >
      <div style="padding: 16px">
        <div class="form-title">{{ editingZone ? '编辑区域' : '添加区域' }}</div>
        <van-field v-model="zoneForm.name" label="名称" placeholder="如 原料区" required />
        <van-field v-model="zoneForm.code" label="编码" placeholder="如 A" required />
        <van-field v-model="zoneForm.color" label="颜色" placeholder="如 #00D4AA" />
        <van-field v-model.number="zoneForm.x" label="X" type="number" placeholder="0" />
        <van-field v-model.number="zoneForm.y" label="Y" type="number" placeholder="0" />
        <van-field v-model.number="zoneForm.w" label="宽" type="number" placeholder="100" />
        <van-field v-model.number="zoneForm.h" label="高" type="number" placeholder="100" />
        <van-button type="primary" block style="margin-top: 12px" @click="submitZoneForm">
          保存
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { getList, addDoc, updateDoc, removeDoc } from '@/utils/request.js'

const router = useRouter()
const activeTab = ref(0)

// 区域数据
const zones = ref([])
const slots = ref([])

// 区域表单
const zoneFormShow = ref(false)
const editingZone = ref(null)
const zoneForm = ref({ name: '', code: '', color: '', x: 0, y: 0, w: 100, h: 100 })

// 批量添加库位
const batchZoneCode = ref('')
const batchCount = ref('')

// 按区域分组的库位
const zonesWithSlots = computed(() => {
  return zones.value.map(zone => ({
    ...zone,
    slots: slots.value.filter(s => s.zone_code === zone.code),
  })).filter(z => z.slots.length > 0)
})

async function loadData() {
  ;[zones.value, slots.value] = await Promise.all([
    getList('zones'),
    getList('slots'),
  ])
}

function openZoneForm(zone) {
  editingZone.value = zone
  zoneForm.value = zone
    ? { name: zone.name, code: zone.code, color: zone.color || '', x: zone.x, y: zone.y, w: zone.w, h: zone.h }
    : { name: '', code: '', color: '', x: 0, y: 0, w: 100, h: 100 }
  zoneFormShow.value = true
}

async function submitZoneForm() {
  if (!zoneForm.value.name || !zoneForm.value.code) {
    showToast('名称和编码为必填项')
    return
  }
  if (editingZone.value) {
    await updateDoc('zones', editingZone.value._id, zoneForm.value)
  } else {
    await addDoc('zones', zoneForm.value)
  }
  zoneFormShow.value = false
  await loadData()
}

function confirmDeleteZone(zone) {
  showConfirmDialog({ title: '确认删除', message: `删除区域「${zone.name}」？` })
    .then(async () => {
      await removeDoc('zones', zone._id)
      await loadData()
    })
    .catch(() => {})
}

async function batchAddSlots() {
  const code = batchZoneCode.value.trim().toUpperCase()
  const count = parseInt(batchCount.value)
  if (!code || !count || count <= 0) {
    showToast('请填写区域编码和数量')
    return
  }
  const tasks = []
  for (let i = 1; i <= count; i++) {
    const slot_id = `${code}-${String(i).padStart(2, '0')}`
    tasks.push(addDoc('slots', { slot_id, zone_code: code, x: 0, y: 0, status: 'empty' }))
  }
  await Promise.all(tasks)
  showToast('添加成功')
  batchZoneCode.value = ''
  batchCount.value = ''
  await loadData()
}

onMounted(loadData)
</script>

<style scoped>
.color-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  margin-right: 6px;
  vertical-align: middle;
}

.form-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
}
</style>
