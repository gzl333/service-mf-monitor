<script setup lang="ts">
import { ref, watch, onBeforeMount, onBeforeUpdate, onUnmounted } from 'vue'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import ServerCluster from 'components/Federation/ServerCluster.vue'
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
interface ServerUnitInterface {
  creation: string
  dashboard_url: string
  grafana_url: string
  id: string
  job_tag: string
  name: string
  name_en: string
  remark: string
  sort_weight: number
}
const { tc } = i18n.global
const divNodes = ref<typeof ServerCluster[]>([])
const serverUnitsTable = ref<ServerUnitInterface[]>([])
const allServerUnitsTable = ref<ServerUnitInterface[]>([])
const keyword = ref('')
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
// const filterStateSelection = ref({
//   label: '全部',
//   value: 'all'
// })
// const filterStateOptions = [
//   {
//     label: '全部',
//     value: 'all'
//   },
//   {
//     label: 'Healthy',
//     value: '0'
//   },
//   {
//     label: 'Warning',
//     value: '1'
//   },
//   {
//     label: 'Fatal',
//     value: '2'
//   }
// ]
let timer = setInterval(() => {
  isRefreshShow.value = false
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
    isRefreshShow.value = false
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
  isRefreshShow.value = false
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
  isRefreshShow.value = true
}
// let arr: string[] = []
// const backComplete = (id: string) => {
//   arr.push(id)
// }
// const filterState = () => {
//   arr = []
//   const arr1: any = []
//   divNodes.value.forEach((node) => {
//     node.filterStatus(filterStateSelection.value.value)
//   })
//   arr.forEach(item => {
//     const unit = allServerUnitsTable.value.find(server => server.id === item)
//     arr1.push(unit)
//   })
//   serverUnitsTable.value = arr1
// }
const keywordSearch = () => {
  if (keyword.value === '') {
    serverUnitsTable.value = allServerUnitsTable.value
  } else {
    serverUnitsTable.value = allServerUnitsTable.value.filter((state: ServerUnitInterface) => state.name.indexOf(keyword.value) !== -1)
  }
}
onBeforeMount(async () => {
  const unitServerRes = await monitor.monitor.api.getMonitorUnitServer()
  serverUnitsTable.value = unitServerRes.data.results
  allServerUnitsTable.value = unitServerRes.data.results
})
onBeforeUpdate(() => {
  divNodes.value = []
})
onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="ServerPage" style="min-width: 1000px">
    <div class="row items-center">
      <div class="row col-8">
        <q-input class="col-4" outlined dense v-model="keyword" label="输入关键字搜索" @update:model-value="keywordSearch"/>
<!--        <q-select class="col-3 q-ml-sm" outlined dense v-model="filterStateSelection" :options="filterStateOptions" :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'" :label="tc('筛选状态')" @update:model-value="filterState"/>-->
<!--        <q-select class="col-3 q-ml-sm" outlined dense v-model="filterSelection" :options="filterOptions" :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'" :label="tc('筛选类别')" />-->
      </div>
      <div class="col-4 row justify-end items-center">
        <q-icon class="q-mr-lg" name="refresh" size="lg" v-show="isRefreshShow" @click="refresh"/>
        <q-select class="col-7" outlined dense v-model="filterSelection" :options="filterOptions" :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'" :label="tc('刷新时间')" />
      </div>
    </div>
    <server-cluster v-for="(monitor, index) in serverUnitsTable" :key="monitor.id" :unit-servers="monitor" :ref="el=>{divNodes[index] = el}" @is-emit="refreshComplete" @is-back="backComplete"></server-cluster>
  </div>
</template>

<style lang="scss" scoped>
.ServerPage {
}
</style>
