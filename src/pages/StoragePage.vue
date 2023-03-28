<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue'
import { useStore, ServiceUnitInterface } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import StorageCluster from 'components/Federation/StorageCluster.vue'
import { i18n } from 'boot/i18n'
import monitor from 'src/api/monitor'

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
const store = useStore()
const organizations = computed(() => store.getAllMonitoringOrganization())
const storageUnitsObj = ref<Record<string, ServiceUnitInterface[]>>({})
// 用于备份所有的单元，模糊搜索时用到
const allStorageUnitsObjData: Record<string, ServiceUnitInterface[]> = {}
const allExpendUnitsObjData: Record<string, ServiceUnitInterface[]> = {}
// 传输给子组件的数据
const propsUnitData = ref<Record<string, unknown>>({})
const countObj = ref<Record<string, number>>({})
let timer: NodeJS.Timer | null
const keyword = ref('')
// 用于判断是否可点击
const isDisable = ref(true)
// 用于判断是否存在计时器
const isIntervalOpen = ref(false)
// 用于判断刷新按钮显示和不显示 每一个子组件对应对象里的一个值
const renovateShow = ref<Record<string, boolean>>({})
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
// 获取数据
const getStorageQuery = async (monitor_unit_id: string) => {
  const storageQuery: string[] = ['health_status', 'cluster_total_bytes', 'cluster_total_used_bytes', 'osd_in', 'osd_out', 'osd_up', 'osd_down']
  const config = {
    query: {
      monitor_unit_id,
      query: ''
    }
  }
  const storageObject: {[key: string]: string } = {}
  for (const query of storageQuery) {
    config.query.query = query
    const MonitorCephQuery = await monitor.monitor.getMonitorCephQuery(config)
    if (MonitorCephQuery.status === 200) {
      if (MonitorCephQuery.data[0].value !== null) {
        storageObject[query as keyof typeof storageObject] = MonitorCephQuery.data[0].value[1]
      } else {
        storageObject[query as keyof typeof storageObject] = '暂无数据'
      }
    }
  }
  return storageObject
}
// const getAllUnit = () => {
//   for (const organization of organizations.value) {
//     const unitObj: { [key: string]: string } = {}
//     // 获取机构下所有单元
//     monitor.monitor.getMonitorUnitCeph({ query: { page: 1, page_size: 9999, organization_id: organization.id } }).then((unitCephRes) => {
//       unitObj[organization.id] = unitCephRes.data.results
//       Object.assign(storageUnitsObj.value, unitObj)
//       Object.assign(allStorageUnitsObjData, unitObj)
//     }).catch((error) => {
//       console.log(error)
//     })
//   }
// }
const getAllUnit = async () => {
  for (const organization of organizations.value) {
    const monitorUnitCeph = await monitor.monitor.getMonitorUnitCeph({
      query: {
        page: 1,
        page_size: 9999,
        organization_id: organization.id
      }
    })
    if (monitorUnitCeph.status === 200) {
      countObj.value[organization.id] = monitorUnitCeph.data.count
    }
    // 获取机构下所有单元
    const unitArr: ServiceUnitInterface[] = []
    const numberRequest = Math.ceil(countObj.value[organization.id] / 100)
    for (let i = 0; i < numberRequest; i++) {
      const unitObj: { [key: string]: ServiceUnitInterface[] } = {}
      const monitorUnitServerRes = await monitor.monitor.getMonitorUnitCeph({
        query: {
          page: i + 1,
          page_size: 100,
          organization_id: organization.id
        }
      })
      if (monitorUnitServerRes.status === 200) {
        monitorUnitServerRes.data.results.forEach((unit: ServiceUnitInterface) => {
          unitArr.unshift(unit)
        })
        if (i + 1 === numberRequest) {
          unitObj[organization.id] = unitArr
          Object.assign(storageUnitsObj.value, unitObj)
          Object.assign(allStorageUnitsObjData, unitObj)
        }
      }
    }
  }
}
getAllUnit()
const openPanel = async (organization_id: string) => {
  if (allStorageUnitsObjData[organization_id] && allStorageUnitsObjData[organization_id].length > 0) {
    const unitObj: { [key: string]: unknown } = {}
    unitObj[organization_id] = allStorageUnitsObjData[organization_id]
    Object.assign(allExpendUnitsObjData, unitObj)
    allStorageUnitsObjData[organization_id].forEach(unit => {
      getStorageQuery(unit.id).then((res) => {
        propsUnitData.value[unit.id] = res
        renovateShow.value[unit.id] = true
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
}
const closePanel = (organization_id: string) => {
  Reflect.deleteProperty(allExpendUnitsObjData, organization_id)
  if (Object.keys(allExpendUnitsObjData).length === 0) {
    clearInterval(Number(timer))
    isIntervalOpen.value = false
    isDisable.value = true
  }
}
const refreshAllUnit = () => {
  isDisable.value = true
  Object.keys(allExpendUnitsObjData).forEach((org, orgIndex) => {
    allExpendUnitsObjData[org].forEach((unit, unitIndex) => {
      renovateShow.value[unit.id] = false
      getStorageQuery(unit.id).then((res) => {
        propsUnitData.value[unit.id] = res
        renovateShow.value[unit.id] = true
        if (orgIndex === Object.keys(allExpendUnitsObjData).length - 1 && unitIndex === allExpendUnitsObjData[org].length - 1) {
          isDisable.value = false
        }
      })
    })
  })
}
const refreshUint = (unitId: string) => {
  renovateShow.value[unitId] = false
  getStorageQuery(unitId).then((res) => {
    propsUnitData.value[unitId] = res
    renovateShow.value[unitId] = true
  })
}
const keywordSearch = () => {
  if (keyword.value === '' || keyword.value === null) {
    storageUnitsObj.value = { ...allStorageUnitsObjData }
  } else {
    Object.keys(allExpendUnitsObjData).forEach(item => {
      storageUnitsObj.value[item] = allExpendUnitsObjData[item].filter(state => state.name.indexOf(keyword.value.trim()) > -1 || state.name_en.indexOf(keyword.value.trim()) > -1)
    })
  }
}
watch(filterSelection, () => {
  clearInterval(Number(timer))
  timer = setInterval(() => {
    refreshAllUnit()
  }, filterSelection.value.value * 1000)
})
watch(organizations, () => {
  if (organizations.value.length > 0) {
    getAllUnit()
  }
})
onUnmounted(() => {
  clearInterval(Number(timer))
})
</script>

<template>
  <div class="StoragePage" style="min-width: 1000px">
    <div class="column">
      <div class="row justify-center">
        <div class="content-fixed-width">
          <div class="text-h6 q-pt-lg">
            Ceph
          </div>
          <div class="row q-mt-lg">
            <div class="col-8 row">
              <q-input class="col-5" :disable="isDisable" outlined dense clearable v-model="keyword" :label="tc('输入关键字搜索')" @update:model-value="keywordSearch"/>
            </div>
            <div class="col-4 row justify-end items-center">
              <q-icon class="q-mr-lg" name="refresh" size="lg" v-show="!isDisable" @click="refreshAllUnit"/>
              <q-select class="col-7" :disable="isDisable" outlined dense v-model="filterSelection" :options="filterOptions" :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'" :label="tc('刷新时间')" />
            </div>
          </div>
          <div class="q-mt-lg">
            <q-list bordered>
              <div v-for="org in organizations" :key="org.id">
                <q-expansion-item
                  expand-icon-class="text-primary"
                  header-class="bg-grey-2"
                  @show="openPanel(org.id)"
                  @hide="closePanel(org.id)"
                >
                  <template v-slot:header>
                    <q-item-section>
                      <div class="row justify-between items-center">
                        <div>
                          <div class="text-subtitle1">{{ i18n.global.locale === 'zh' ? org.name : org.name_en }}</div>
                          <div>{{ org?.abbreviation }}</div>
                        </div>
                        <div class="text-h6 text-primary">{{ countObj[org.id] }}</div>
                      </div>
                    </q-item-section>
                  </template>
                  <q-card>
                    <div v-if="storageUnitsObj[org.id]?.length > 0">
                      <div v-for="monitor in storageUnitsObj[org.id]" :key="monitor.id">
                        <div class="row justify-between items-center q-mt-md">
                          <div class="text-subtitle1 text-weight-bold q-ml-sm">
                            {{ i18n.global.locale === 'zh' ? monitor.name : monitor.name_en }}
                          </div>
                          <q-icon class="q-mr-sm" name="refresh" size="1.7rem" v-show="renovateShow[monitor.id]" @click="refreshUint(monitor.id)"/>
                        </div>
                        <storage-cluster :unit-ceph-data="propsUnitData[monitor.id]" :unit-id="monitor.id" :grafana-url="monitor.grafana_url"></storage-cluster>
                      </div>
                    </div>
                    <div v-else>
                      <div class="text-center text-h6 q-py-lg">
                        {{ tc('暂无监控单元') }}
                      </div>
                    </div>
                  </q-card>
                </q-expansion-item>
                <q-separator/>
              </div>
            </q-list>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.StoragePage {
}
</style>
