<script setup lang="ts">
import { ref, watch, onBeforeMount, computed, onBeforeUpdate, onUnmounted } from 'vue'
import { useStore, ServerUnitInterface } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import ServerClusters from 'components/Federation/ServerClusters.vue'
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

const store = useStore()
// const route = useRoute()
// const router = useRouter()
const { tc } = i18n.global
const organizations = computed(() => store.getPersonalAvailableCoupon())
const divNodes = ref<typeof ServerClusters[]>([])
const keyword = ref('')
const isDisable = ref(true)
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
const serverUnitsObj = ref<Record<string, ServerUnitInterface[]>>({})
const allServerUnitsObjData: Record<string, ServerUnitInterface[]> = {}
const isIntervalOpen = ref(false)
let timer: any
const propsData: any = ref({})
const getServerQuery = async (monitor_unit_id: string) => {
  const serverQuery: string[] = ['host_count', 'host_up_count', 'health_status', 'cpu_usage', 'max_cpu_usage', 'min_cpu_usage', 'mem_usage', 'max_mem_usage', 'min_mem_usage', 'disk_usage', 'max_disk_usage', 'min_disk_usage']
  const config = {
    query: {
      monitor_unit_id,
      query: ''
    }
  }
  const serverObject: { [key: string]: string } = {}
  for (const query of serverQuery) {
    config.query.query = query
    await monitor.monitor.api.getMonitorServerQuery(config).then((res) => {
      if (res.data[0].value !== null) {
        serverObject[query as keyof typeof serverObject] = res.data[0].value[1]
      } else {
        serverObject[query as keyof typeof serverObject] = '暂无数据'
      }
    }).catch((error) => {
      serverObject[query as keyof typeof serverObject] = '获取数据出错'
      console.log(error)
    })
  }
  return serverObject
}
const openPanel = async (organization_id: string) => {
  const unitObj: {[key: string]: string } = {}
  const unitServerRes = await monitor.monitor.api.getMonitorUnitServer({ query: { page: 1, page_size: 9999, organization_id } })
  unitObj[organization_id] = unitServerRes.data.results
  Object.assign(serverUnitsObj.value, unitObj)
  Object.assign(allServerUnitsObjData, unitObj)
  console.log(allServerUnitsObjData)
  allServerUnitsObjData[organization_id].forEach(unit => {
    getServerQuery(unit.id).then((res) => {
      propsData.value[unit.id] = res
    })
  })
  if (!isIntervalOpen.value) {
    timer = setInterval(() => {
      refreshAllUnit()
    }, filterSelection.value.value * 1000)
    isIntervalOpen.value = true
    isDisable.value = false
  }
}
const closePanel = (organization_id: string) => {
  Reflect.deleteProperty(serverUnitsObj.value, organization_id)
  Reflect.deleteProperty(allServerUnitsObjData, organization_id)
  if (Object.keys(serverUnitsObj.value).length === 0) {
    clearInterval(timer)
    isIntervalOpen.value = false
    isDisable.value = true
  }
}
const refreshAllUnit = () => {
  isDisable.value = true
  Object.keys(allServerUnitsObjData).forEach((org, orgIndex) => {
    allServerUnitsObjData[org].forEach((unit, unitIndex) => {
      getServerQuery(unit.id).then((res) => {
        propsData.value[unit.id] = res
        if (orgIndex === Object.keys(allServerUnitsObjData).length - 1 && unitIndex === allServerUnitsObjData[org].length - 1) {
          isDisable.value = false
        }
      })
    })
  })
}
const refreshUint = (unitId: string) => {
  getServerQuery(unitId).then((res) => {
    propsData.value[unitId] = res
  })
}
const keywordSearch = () => {
  if (keyword.value === '' || keyword.value === null) {
    serverUnitsObj.value = { ...allServerUnitsObjData }
  } else {
    Object.keys(serverUnitsObj.value).forEach(item => {
      serverUnitsObj.value[item] = allServerUnitsObjData[item].filter(state => state.name.indexOf(keyword.value.trim()) > -1 || state.name_en.indexOf(keyword.value.trim()) > -1)
    })
  }
}
watch(filterSelection, () => {
  clearInterval(timer)
  timer = setInterval(() => {
    refreshAllUnit()
  }, filterSelection.value.value * 1000)
})
watch(organizations, () => {
  if (organizations.value.length > 0) {
    openPanel(organizations.value[0].id)
    isDisable.value = false
  }
})
onBeforeMount(() => {
  if (organizations.value.length > 0) {
    openPanel(organizations.value[0].id)
    isDisable.value = false
  }
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
        <q-input class="col-5" outlined dense clearable :disable="isDisable" v-model="keyword" label="输入关键字搜索" @update:model-value="keywordSearch"/>
      </div>
      <div class="col-4 row justify-end items-center">
        <q-icon class="q-mr-lg" name="refresh" size="lg" v-show="!isDisable" @click="refreshAllUnit"/>
        <q-select class="col-7" outlined dense :disable="isDisable" v-model="filterSelection" :options="filterOptions" :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'" :label="tc('刷新时间')" />
      </div>
    </div>
    <div class="q-mt-lg">
    <q-list bordered>
      <q-expansion-item
        v-for="(item, index) in organizations"
        :key="index"
        :default-opened="index === 0"
        @show="openPanel(item.id)"
        @hide="closePanel(item.id)"
      >
        <template v-slot:header>
          <q-item-section>
            <div class="text-subtitle1">{{ item.name }}</div>
            <div>{{ item.country + '-' + item.city }}</div>
          </q-item-section>
        </template>
        <q-separator/>
        <q-card>
          <div v-for="monitor in serverUnitsObj[item.id]" :key="monitor.id">
            <div class="row items-center q-mt-md justify-between">
              <div class="text-subtitle1 text-weight-bold q-ml-sm">{{ monitor.name }}</div>
              <q-icon class="q-mr-sm" name="refresh" size="md" v-show="!isDisable" @click="refreshUint(monitor.id)"/>
            </div>
            <server-clusters :unit-servers-data="propsData[monitor.id]" :unit-id="monitor.id" :grafana-url="monitor.grafana_url"></server-clusters>
          </div>
        </q-card>
      </q-expansion-item>
    </q-list>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ServerPage {
}
</style>
