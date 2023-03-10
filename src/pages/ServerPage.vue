<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from 'vue'
import { useStore, ServiceUnitInterface } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import ServerCluster from 'components/Federation/ServerCluster.vue'
import monitor from 'src/api/monitor'
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
const organizations = computed(() => store.getAllMonitoringOrganization())
const serverUnitsObj = ref<Record<string, ServiceUnitInterface[]>>({})
// 用于备份所有的单元，模糊搜索时用到
const allServerUnitsObjData: Record<string, ServiceUnitInterface[]> = {}
const allExpendUnitsObjData: Record<string, ServiceUnitInterface[]> = {}
let timer: NodeJS.Timer | null
// 传输给子组件的数据
const propsUnitData = ref<Record<string, unknown>>({})
const keyword = ref('')
// 用于判断是否存在计时器
const isIntervalOpen = ref(false)
// 用于判断是否可点击
const isDisable = ref(true)
// 用于判断刷新按钮显示和不显示 每一个子组件对应对象里的一个值
const renovateShow = ref<Record<string, boolean>>({})
const countObj = ref<Record<string, number>>({})
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
    const MonitorServerQueryRes = await monitor.monitor.getMonitorServerQuery(config)
    if (MonitorServerQueryRes.status === 200) {
      if (MonitorServerQueryRes.data[0].value !== null) {
        serverObject[query as keyof typeof serverObject] = MonitorServerQueryRes.data[0].value[1]
      } else {
        serverObject[query as keyof typeof serverObject] = '暂无数据'
      }
    }
  }
  return serverObject
}
const getAllUnit = async () => {
  for (const organization of organizations.value) {
    const monitorUnitServer = await monitor.monitor.getMonitorUnitServer({
      query: {
        page: 1,
        page_size: 9999,
        organization_id: organization.id
      }
    })
    if (monitorUnitServer.status === 200) {
      countObj.value[organization.id] = monitorUnitServer.data.count
    }
    // 获取机构下所有单元
    const unitArr: ServiceUnitInterface[] = []
    const numberRequest = Math.ceil(countObj.value[organization.id] / 100)
    for (let i = 0; i < numberRequest; i++) {
      const unitObj: { [key: string]: ServiceUnitInterface[] } = {}
      const monitorUnitServerRes = await monitor.monitor.getMonitorUnitServer({
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
          Object.assign(serverUnitsObj.value, unitObj)
          Object.assign(allServerUnitsObjData, unitObj)
        }
      }
    }
  }
}
getAllUnit()
const openPanel = async (organization_id: string) => {
  if (allServerUnitsObjData[organization_id].length > 0) {
    const unitObj: { [key: string]: unknown } = {}
    unitObj[organization_id] = allServerUnitsObjData[organization_id]
    Object.assign(allExpendUnitsObjData, unitObj)
    // 循环获取所有单元的所有监控信息
    allServerUnitsObjData[organization_id].forEach(unit => {
      getServerQuery(unit.id).then((res) => {
        propsUnitData.value[unit.id] = res
        renovateShow.value[unit.id] = true
      })
    })
    // 判断是否添加计时器,打开第一个面板时添加计时器,后面再次打开不再添加计时器
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
  // 判断面板是否全部关闭,若全部关闭清空计时器
  if (Object.keys(allExpendUnitsObjData).length === 0) {
    clearInterval(Number(timer))
    isIntervalOpen.value = false
    isDisable.value = true
  }
}
// 刷新展开的所有单元
const refreshAllUnit = () => {
  isDisable.value = true
  Object.keys(allExpendUnitsObjData).forEach((org, orgIndex) => {
    allExpendUnitsObjData[org].forEach((unit, unitIndex) => {
      renovateShow.value[unit.id] = false
      getServerQuery(unit.id).then((res) => {
        propsUnitData.value[unit.id] = res
        renovateShow.value[unit.id] = true
        // 如果最后一个请求请求成功后 将isDisable赋值为false
        if (orgIndex === Object.keys(allExpendUnitsObjData).length - 1 && unitIndex === allExpendUnitsObjData[org].length - 1) {
          isDisable.value = false
        }
      })
    })
  })
}
// 刷新单个单元
const refreshUint = (unitId: string) => {
  renovateShow.value[unitId] = false
  getServerQuery(unitId).then((res) => {
    propsUnitData.value[unitId] = res
    renovateShow.value[unitId] = true
  })
}
const keywordSearch = () => {
  if (keyword.value === '' || keyword.value === null) {
    serverUnitsObj.value = { ...allServerUnitsObjData }
  } else {
    // 在已经展开的单元里模糊搜索
    Object.keys(allExpendUnitsObjData).forEach(item => {
      serverUnitsObj.value[item] = allExpendUnitsObjData[item].filter(state => state.name.indexOf(keyword.value.trim()) > -1 || state.name_en.indexOf(keyword.value.trim()) > -1)
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
  <div class="ServerPage" style="min-width: 1000px">
    <div class="column">
      <div class="row justify-center">
        <div class="content-fixed-width">
          <div class="text-h6 q-pt-lg">
            {{ tc('主机集群') }}
          </div>
          <div class="row items-center q-mt-lg">
            <div class="row col-8">
              <q-input class="col-5" outlined dense clearable :disable="isDisable" v-model="keyword"
                       :label="tc('输入关键字搜索')" @update:model-value="keywordSearch"/>
            </div>
            <div class="col-4 row justify-end items-center">
              <q-icon class="q-mr-lg" name="refresh" size="lg" v-show="!isDisable" @click="refreshAllUnit"/>
              <q-select class="col-7" outlined dense :disable="isDisable" v-model="filterSelection"
                        :options="filterOptions"
                        :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'" :label="tc('刷新时间')"/>
            </div>
          </div>
          <div class="q-mt-lg">
            <q-list bordered>
              <div v-for="item in organizations" :key="item.id">
                <q-expansion-item
                  expand-icon-class="text-primary"
                  header-class="bg-grey-2"
                  @show="openPanel(item.id)"
                  @hide="closePanel(item.id)"
                >
                  <template v-slot:header>
                    <q-item-section>
                      <div class="row justify-between items-center">
                        <div>
                          <div class="text-subtitle1">{{ i18n.global.locale === 'zh' ? item.name : item.name_en }}</div>
                          <div>{{ item?.abbreviation }}</div>
                        </div>
                        <div class="text-h6 text-primary">{{ countObj[item.id] }}</div>
                      </div>
                    </q-item-section>
                  </template>
                  <q-card>
                    <div v-if="serverUnitsObj[item.id]?.length > 0">
                      <div v-for="monitor in serverUnitsObj[item.id]" :key="monitor.id">
                        <div class="row justify-between items-center q-mt-md">
                          <div class="text-subtitle1 text-weight-bold q-ml-sm">
                            {{ i18n.global.locale === 'zh' ? monitor.name : monitor.name_en }}
                          </div>
                          <q-icon class="q-mr-sm" name="refresh" size="1.7rem" v-show="renovateShow[monitor.id]"
                                  @click="refreshUint(monitor.id)"/>
                        </div>
                        <server-cluster :unit-servers-data="propsUnitData[monitor.id]" :unit-id="monitor.id"
                                        :grafana-url="monitor.grafana_url"></server-cluster>
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
.ServerPage {
}
</style>
