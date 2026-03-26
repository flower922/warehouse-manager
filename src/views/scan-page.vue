<template>
  <div class="scan-page">
    <van-nav-bar title="扫码入库" />
    <div id="qr-reader" class="qr-reader" />
    <div class="manual-area">
      <van-field
        v-model="manualCode"
        label="手动输入"
        placeholder="扫不了？在这里输入编码"
        clearable
      />
      <van-button type="primary" block @click="goAdd(manualCode)">确认</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Html5Qrcode } from 'html5-qrcode'
import { showToast } from 'vant'

const router = useRouter()
const manualCode = ref('')
let scanner = null

function goAdd(code) {
  if (!code?.trim()) { showToast('请输入编码'); return }
  router.push(`/add?code=${encodeURIComponent(code.trim())}`)
}

onMounted(() => {
  scanner = new Html5Qrcode('qr-reader')
  scanner.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 250, height: 250 } },
    (decodedText) => {
      scanner.stop().then(() => goAdd(decodedText)).catch(() => goAdd(decodedText))
    },
    () => {}
  ).catch(() => showToast('无法启动摄像头，请手动输入'))
})

onBeforeUnmount(() => {
  scanner?.stop().catch(() => {})
})
</script>

<style scoped>
.scan-page { display: flex; flex-direction: column; min-height: 100vh; background: #000; }
.qr-reader { width: 100%; }
.manual-area { background: #fff; padding: 16px; margin-top: auto; }
</style>
