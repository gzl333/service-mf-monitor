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
const isShow = ref(true)
const monitorUnits = ref([])
const filterSelection = ref({
  label: '每30s刷新',
  labelEn: 'Refresh every 30 seconds',
  value: 30
})
const divNodes = ref<typeof StorageCluster[]>([])
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
  divNodes.value.forEach((node) => {
    node.intervalRefresh()
  })
}, filterSelection.value.value * 1000)
watch(filterSelection, () => {
  clearInterval(timer)
  timer = setInterval(() => {
    isShow.value = false
    divNodes.value.forEach((node) => {
      node.intervalRefresh()
    })
  }, filterSelection.value.value * 1000)
})
const refresh = () => {
  isShow.value = false
  divNodes.value.forEach((node) => {
    node.intervalRefresh()
  })
}
const childEmit = (val: boolean) => {
  isShow.value = val
}
onBeforeMount(async () => {
  const unitServerRes = await monitor.monitor.api.getMonitorUnitCeph()
  monitorUnits.value = unitServerRes.data.results
})
onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="StoragePage" style="min-width: 1000px">
    <div class="row justify-end">
      <q-icon class="q-mr-lg" name="refresh" size="lg" v-show="isShow" @click="refresh"/>
      <q-select class="col-3" outlined dense v-model="filterSelection" :options="filterOptions" :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'" :label="tc('刷新时间')" />
    </div>
    <storage-cluster v-for="(monitor, index) in monitorUnits" :key="monitor.id" :unit-ceph="monitor" :ref="el=>{divNodes[index] = el}" @is-emit="childEmit"></storage-cluster>
  </div>
</template>

<style lang="scss" scoped>
.StoragePage {
}
</style>
