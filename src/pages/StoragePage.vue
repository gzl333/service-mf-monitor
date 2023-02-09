<script setup lang="ts">
import { ref, watch, onUnmounted, onBeforeMount } from 'vue'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import StorageCluster from 'components/Federation/StorageCluster.vue'
import { i18n } from 'boot/i18n'
import monitor from '../api/index'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

// const route = useRoute()
// const router = useRouter()
const { tc } = i18n.global
// const store = useStore()
const divNodes = ref<typeof StorageCluster[]>([])
const monitorCephTable = ref([])
const allMonitorCeph = ref([])
const keyword = ref('')
const isShow = ref(true)
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
  isShow.value = false
  divNodes.value = divNodes.value.filter(item => item !== null)
  divNodes.value.forEach((node, index) => {
    if (index === divNodes.value.length - 1) {
      node.intervalRefresh(true)
    } else {
      node.intervalRefresh(false)
    }
  })
}, filterSelection.value.value * 1000)
watch(filterSelection, () => {
  clearInterval(timer)
  timer = setInterval(() => {
    isShow.value = false
    divNodes.value = divNodes.value.filter(item => item !== null)
    divNodes.value.forEach((node, index) => {
      if (index === divNodes.value.length - 1) {
        node.intervalRefresh(true)
      } else {
        node.intervalRefresh(false)
      }
    })
  }, filterSelection.value.value * 1000)
})
const refresh = () => {
  isShow.value = false
  divNodes.value = divNodes.value.filter(item => item !== null)
  divNodes.value.forEach((node, index) => {
    if (index === divNodes.value.length - 1) {
      node.intervalRefresh(true)
    } else {
      node.intervalRefresh(false)
    }
  })
}
const refreshComplete = () => {
  isShow.value = true
}
const keywordSearch = () => {
  if (keyword.value === '') {
    monitorCephTable.value = allMonitorCeph.value
  } else {
    monitorCephTable.value = allMonitorCeph.value.filter((state: any) => state.name.indexOf(keyword.value) !== -1)
  }
}
onBeforeMount(async () => {
  const unitServerRes = await monitor.monitor.api.getMonitorUnitCeph()
  monitorCephTable.value = unitServerRes.data.results
  allMonitorCeph.value = unitServerRes.data.results
})
onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="StoragePage" style="min-width: 1000px">
    <div class="row">
      <div class="col-8 row">
        <q-input class="col-4" outlined dense v-model="keyword" label="输入关键字搜索" @update:model-value="keywordSearch"/>
      </div>
      <div class="col-4 row justify-end items-center">
        <q-icon class="q-mr-lg" name="refresh" size="lg" v-show="isShow" @click="refresh"/>
        <q-select class="col-8 q-mr-sm" outlined dense v-model="filterSelection" :options="filterOptions" :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'" :label="tc('刷新时间')" />
      </div>
    </div>
    <storage-cluster v-for="(monitor, index) in monitorCephTable" :key="monitor.id" :unit-ceph="monitor" :ref="el=>{divNodes[index] = el}" @is-emit="refreshComplete"></storage-cluster>
  </div>
</template>

<style lang="scss" scoped>
.StoragePage {
}
</style>
