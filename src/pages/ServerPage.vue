<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useStore } from 'stores/store'
import HostCluster from 'components/Federation/HostCluster.vue'
// import { navigateToUrl } from 'single-spa'
// import { useRoute, useRouter } from 'vue-router'
// import { i18n } from 'boot/i18n'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
// const route = useRoute()
// const router = useRouter()
// const tc = i18n.global.tc
// console.log(store.loadAllTables)
// store.loadAllTables()
// void store.loadAllTables()
const services = computed(() => store.tables.serviceTable.allIds)
const isShow = ref(true)
const filterSelection = ref({
  label: '每30s刷新',
  value: 30
})
const divNodes = ref<typeof HostCluster[]>([])
const filterOptions = [
  {
    label: '每30s刷新',
    value: 30
  },
  {
    label: '每1min刷新',
    value: 60
  },
  {
    label: '每10min刷新',
    value: 600
  },
  {
    label: '每30min刷新',
    value: 1800
  },
  {
    label: '每1h刷新',
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
onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="ServerPage">
    <div class="row justify-end q-mt-xs">
      <q-icon class="col-1" name="refresh" size="md" v-show="isShow" @click="refresh"/>
      <q-select outlined dense v-model="filterSelection" :options="filterOptions" label="刷新时间" class="col-3"/>
    </div>
    <host-cluster v-for="(serviceId, index) in services" :key="serviceId" :id="serviceId" :ref="el=>{divNodes[index] = el}" @is-emit="childEmit"></host-cluster>
  </div>
</template>

<style lang="scss" scoped>
.ServerPage {
}
</style>
