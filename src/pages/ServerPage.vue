<script setup lang="ts">
import { onUnmounted, ref, watch, onBeforeMount } from 'vue'
// import { useStore } from 'stores/store'
import ServerCluster from 'components/Federation/ServerCluster.vue'
// import { navigateToUrl } from 'single-spa'
// import { useRoute, useRouter } from 'vue-router'
import monitor from '../api/index'
import { i18n } from 'boot/i18n'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

// const store = useStore()
// const route = useRoute()
// const router = useRouter()
const { tc } = i18n.global
const divNodes = ref<typeof ServerCluster[]>([])
const monitorUnits = ref([])
const isRefreshShow = ref(true)
const filterSelection = ref({
  label: '每30s刷新',
  labelEn: 'Refresh every 30 seconds',
  value: 30
})
const filterOptions = [
  {
    label: '每30s刷新',
    labelEn: 'Refresh every 30 seconds',
    value: 30
  },
  {
    label: '每1min刷新',
    labelEn: 'Refresh every 1 minute',
    value: 60
  },
  {
    label: '每10min刷新',
    labelEn: 'Refresh every 10 minutes',
    value: 600
  },
  {
    label: '每30min刷新',
    labelEn: 'Refresh every 30 minutes',
    value: 1800
  },
  {
    label: '每1h刷新',
    labelEn: 'Refresh every 1 hour',
    value: 3600
  }
]
let timer = setInterval(() => {
  isRefreshShow.value = false
  divNodes.value.forEach((node) => {
    node.intervalRefresh()
  })
}, filterSelection.value.value * 1000)
watch(filterSelection, () => {
  clearInterval(timer)
  timer = setInterval(() => {
    isRefreshShow.value = false
    divNodes.value.forEach((node) => {
      node.intervalRefresh()
    })
  }, filterSelection.value.value * 1000)
})
const refresh = () => {
  isRefreshShow.value = false
  divNodes.value.forEach((node) => {
    node.intervalRefresh()
  })
}
const refreshComplete = (val: boolean) => {
  isRefreshShow.value = val
}
onBeforeMount(async () => {
  const unitServerRes = await monitor.monitor.api.getMonitorUnitServer()
  monitorUnits.value = unitServerRes.data.results
})
onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="ServerPage" style="min-width: 1000px">
    <div class="row justify-end items-center">
      <q-icon class="q-mr-lg" name="refresh" size="lg" v-show="isRefreshShow" @click="refresh"/>
      <q-select class="col-3" outlined dense v-model="filterSelection" :options="filterOptions" :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'" :label="tc('刷新时间')" />
    </div>
    <server-cluster v-for="(monitor, index) in monitorUnits" :key="monitor.id" :unit-servers="monitor" :ref="el=>{divNodes[index] = el}" @is-emit="refreshComplete"></server-cluster>
  </div>
</template>

<style lang="scss" scoped>
.ServerPage {
}
</style>
