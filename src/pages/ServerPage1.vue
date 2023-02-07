<script setup lang="ts">
import { onUnmounted, ref, watch, onBeforeMount } from 'vue'
// import { useStore } from 'stores/store'
import ServerClusters from 'components/Federation/ServerClusters.vue'
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
const divNodes = ref<typeof ServerClusters[]>([])
const allMonitorUnits = ref([])
const isRefreshShow = ref(true)
const filterSelection = ref({
  label: '每30s刷新',
  labelEn: 'Refresh every 30 seconds',
  value: 3600
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
const filterStateSelection = ref({
  label: '全部',
  value: 'all'
})
const filterStateOptions = [
  {
    label: '全部',
    value: 'all'
  },
  {
    label: 'Healthy',
    value: '0'
  },
  {
    label: 'Warning',
    value: '1'
  },
  {
    label: 'Fatal',
    value: '2'
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
const filterState = () => {
  console.log(filterStateSelection.value)
  // allMonitorUnits.value = allMonitorUnits.value.filter()
}
onBeforeMount(async () => {
  const unitServerRes = await monitor.monitor.api.getMonitorUnitServer()
  allMonitorUnits.value = unitServerRes.data.results
  console.log(allMonitorUnits.value)
})
onUnmounted(() => {
  clearInterval(timer)
})
const text = ref('')
</script>

<template>
  <div class="ServerPage" style="min-width: 1000px">
    <div class="row items-center">
      <div class="row col-8">
        <q-input class="col-4" outlined dense v-model="text" label="输入关键字搜索" />
<!--        <q-select class="col-3 q-ml-sm" outlined dense v-model="filterSelection" :options="filterOptions" :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'" :label="tc('筛选类别')" />-->
        <q-select class="col-3 q-ml-sm" outlined dense v-model="filterStateSelection" :options="filterStateOptions" :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'" :label="tc('筛选状态')" @update:model-value="filterState"/>
      </div>
      <div class="col-4 row justify-evenly items-center">
        <q-icon name="refresh" size="lg" v-show="isRefreshShow" @click="refresh"/>
        <q-select class="col-8 q-ml-sm" outlined dense v-model="filterSelection" :options="filterOptions" :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'" :label="tc('刷新时间')" />
      </div>
    </div>
    <server-clusters v-for="(monitor, index) in allMonitorUnits" :key="monitor.id" :unit-servers="monitor" :ref="el=>{divNodes[index] = el}" @is-emit="refreshComplete"></server-clusters>
  </div>
</template>

<style lang="scss" scoped>
.ServerPage {
}
</style>
