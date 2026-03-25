<template>
  <router-view />
  <van-tabbar
    v-if="showTabbar"
    v-model="active"
    route
    fixed
    placeholder
  >
    <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
    <van-tabbar-item icon="location-o" to="/map">地图</van-tabbar-item>
    <van-tabbar-item icon="scan" to="/scan">扫码</van-tabbar-item>
    <van-tabbar-item icon="apps-o" to="/stock">库存</van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref(0)
const showTabbar = computed(() => !!route.meta.showTabbar)
</script>
