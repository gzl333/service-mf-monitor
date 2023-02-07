<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import monitor from '../../api/index'
import LineChart from 'components/Chart/LineChart.vue'
import { i18n } from 'boot/i18n'

const props = defineProps({
  unitServers: {
    type: Object,
    required: true
  }
})
// interface MonitorServerInterface {
//   cpu_usage: number
//   disk_usage: number
//   grafana_url: string
//   health_status: number
//   host_count: number
//   host_up_count: number
//   isCpuRefreshShow: boolean
//   isDiskRefreshShow: boolean
//   isHostRefreshShow: boolean
//   isMemRefreshShow: boolean
//   isStatusRefreshShow: boolean
//   max_cpu_usage: number
//   max_disk_usage: number
//   max_mem_usage: number
//   mem_usage: number
//   min_cpu_usage: number
//   min_disk_usage: number
//   min_mem_usage: number
//   monitor_unit_id: string | undefined
//   name: string
// }
const emits = defineEmits(['is-emit'])
const { tc } = i18n.global
const monitorServersData: Record<string, any> = ref({})
const getServerQuery = async (monitor_unit_id: string) => {
  const serverQuery: string[] = ['host_count', 'host_up_count', 'health_status', 'cpu_usage', 'max_cpu_usage', 'min_cpu_usage', 'mem_usage', 'max_mem_usage', 'min_mem_usage', 'disk_usage', 'max_disk_usage', 'min_disk_usage']
  const config = {
    query: {
      monitor_unit_id,
      query: ''
    }
  }
  const serverObject: {[key: string]: number | string | boolean } = {}
  serverObject.isHostRefreshShow = true
  serverObject.isStatusRefreshShow = true
  serverObject.isCpuRefreshShow = true
  serverObject.isMemRefreshShow = true
  serverObject.isDiskRefreshShow = true
  serverObject.grafana_url = props.unitServers.grafana_url
  serverObject.unitName = props.unitServers.name
  for (const query of serverQuery) {
    config.query.query = query
    await monitor.monitor.api.getMonitorServerQuery(config).then((res) => {
      if (res.data[0].value !== null) {
        serverObject[query as keyof typeof serverObject] = res.data[0].value[1]
      } else {
        if (query === 'health_status') {
          serverObject[query as keyof typeof serverObject] = '2'
        } else {
          serverObject[query as keyof typeof serverObject] = '暂无数据'
        }
      }
    }).catch((error) => {
      console.log(error)
      serverObject[query as keyof typeof serverObject] = '获取数据出错'
    })
  }
  return serverObject
}
const refreshServerData = async (monitor_unit_id: string, query: string) => {
  const config = {
    query: {
      monitor_unit_id,
      query
    }
  }
  await monitor.monitor.api.getMonitorServerQuery(config).then((res) => {
    if (res.data[0].value !== null) {
      monitorServersData.value[query] = res.data[0].value[1]
    }
  })
}
const refreshByQuery = async (monitor_unit_id: string, type: string) => {
  if (type === 'host') {
    monitorServersData.value.isHostRefreshShow = false
    const hostQueryArr = ['host_count', 'host_up_count']
    for (const host of hostQueryArr) {
      void await refreshServerData(monitor_unit_id, host)
    }
    monitorServersData.value.isHostRefreshShow = true
  } else if (type === 'healthy') {
    monitorServersData.value.isStatusRefreshShow = false
    void await refreshServerData(monitor_unit_id, 'health_status')
    monitorServersData.value.isStatusRefreshShow = true
  } else if (type === 'cpu') {
    monitorServersData.value.isCpuRefreshShow = false
    const cpuArr = ['cpu_usage', 'min_cpu_usage', 'max_cpu_usage']
    for (const cpu of cpuArr) {
      void await refreshServerData(monitor_unit_id, cpu)
    }
    monitorServersData.value.isCpuRefreshShow = true
  } else if (type === 'mem') {
    monitorServersData.value.isMemRefreshShow = false
    const memArr = ['mem_usage', 'min_mem_usage', 'max_mem_usage']
    for (const mem of memArr) {
      void await refreshServerData(monitor_unit_id, mem)
    }
    monitorServersData.value.isMemRefreshShow = true
  } else {
    monitorServersData.value.isDiskRefreshShow = false
    const diskArr = ['disk_usage', 'min_disk_usage', 'max_disk_usage']
    for (const disk of diskArr) {
      void await refreshServerData(monitor_unit_id, disk)
    }
    monitorServersData.value.isDiskRefreshShow = true
  }
}
const intervalRefresh = async () => {
  monitorServersData.value.isHostRefreshShow = false
  monitorServersData.value.isStatusRefreshShow = false
  monitorServersData.value.isCpuRefreshShow = false
  monitorServersData.value.isMemRefreshShow = false
  monitorServersData.value.isDiskRefreshShow = false
  monitorServersData.value = await getServerQuery(props.unitServers.id)
  monitorServersData.value.isHostRefreshShow = true
  monitorServersData.value.isStatusRefreshShow = true
  monitorServersData.value.isCpuRefreshShow = true
  monitorServersData.value.isMemRefreshShow = true
  monitorServersData.value.isDiskRefreshShow = true
  emits('is-emit', true)
}
const goToGrafana = () => {
  window.open(props.unitServers.grafana_url)
}
onBeforeMount(async () => {
  monitorServersData.value = await getServerQuery(props.unitServers.id)
  console.log(monitorServersData.value)
})
defineExpose({ intervalRefresh })
</script>

<template>
  <div class="ServerCluster">
      <div class="text-subtitle1 text-weight-bold q-mt-lg">{{ props.unitServers.name }}</div>
      <div class="row q-mt-sm">
        <div class="col-2">
          <q-card flat bordered class="no-border-radius" style="height: 120px">
            <div class="row">
              <div class="col-11 text-center">{{ tc('主机数') }}</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="monitorServersData.isHostRefreshShow"
                      @click="refreshByQuery(props.unitServers.id, 'host')"/>
            </div>
            <div :class="monitorServersData.host_count ? 'text-center text-h4 q-mt-lg' : 'text-center text-h5 q-mt-lg'">
              {{ monitorServersData.host_count ? monitorServersData.host_count : tc('正在获取')}}
            </div>
          </q-card>
          <div class="row q-mt-xs">
            <q-card flat bordered class="no-border-radius col-6" style="height: 85px">
              <div class="col-11 text-center">{{ tc('在线') }}</div>
              <div :class="monitorServersData.host_up_count && monitorServersData.host_count !== '暂无数据' && monitorServersData.host_count !== '获取数据出错' ? 'text-center text-h5 text-positive q-mt-sm' : 'text-center text-h6 q-mt-sm'">
                {{ monitorServersData.host_up_count ? monitorServersData.host_up_count : tc('正在获取') }}
              </div>
            </q-card>
            <q-card flat bordered class="no-border-radius col-6" style="height: 85px">
              <div class="col-11 text-center">{{ tc('掉线') }}</div>
              <div :class="monitorServersData.host_count && monitorServersData.host_count !== '暂无数据' && monitorServersData.host_count !== '获取数据出错' ? 'text-center text-h5 text-negative q-mt-sm' : 'text-center text-h6 q-mt-sm'">
                {{ monitorServersData.host_count && monitorServersData.host_count !== '暂无数据' && monitorServersData.host_count !== '获取数据出错' ? (parseFloat(monitorServersData.host_count) - parseFloat(monitorServersData.host_up_count)) : monitorServersData.host_count ? tc(monitorServersData.host_count) : tc('正在获取')}}
              </div>
            </q-card>
          </div>
        </div>
        <div class="col-2 q-ml-md">
          <q-card flat bordered class="no-border-radius" style="height: 209px">
            <div class="row">
              <div class="col-11 text-center">{{ tc('集群状态') }}</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="monitorServersData.isStatusRefreshShow"
                      @click="refreshByQuery(props.unitServers.id, 'healthy')"/>
            </div>
            <div :class="!monitorServersData.health_status ? 'text-center text-h5 q-mt-xl' : monitorServersData.health_status === '0' ? 'text-positive text-center text-h4 text-weight-bold q-mt-xl' :
            monitorServersData.health_status === '1' ? 'text-warning text-center text-h4 text-weight-bold q-mt-xl' : 'text-negative text-center text-h4 text-weight-bold q-mt-xl'">
              {{ !monitorServersData.health_status ? tc('正在获取') : monitorServersData.health_status === '0' ? 'Healthy' : monitorServersData.health_status === '1' ? 'Warning' : 'Fatal' }}
            </div>
          </q-card>
        </div>
        <div class="col-2 q-ml-md">
          <q-card flat bordered class="no-border-radius" style="height: 120px">
            <div class="row">
              <div class="col-11 text-center">{{ tc('平均CPU使用率') }}</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="monitorServersData.isCpuRefreshShow"
                      @click="refreshByQuery(props.unitServers.id,'cpu')"/>
            </div>
            <div :class="monitorServersData.cpu_usage ? 'text-center text-h4 q-mt-md' : 'text-center text-h5 q-mt-md'">
              {{ monitorServersData.cpu_usage && monitorServersData.cpu_usage !== '暂无数据' && monitorServersData.cpu_usage !== '获取数据出错' ? (parseFloat(monitorServersData.cpu_usage).toFixed(2) + '%') : monitorServersData.cpu_usage ? tc(monitorServersData.cpu_usage) : tc('正在获取') }}
            </div>
            <line-chart :chartData="[monitorServersData.cpu_usage, monitorServersData.min_cpu_usage, monitorServersData.max_cpu_usage]"></line-chart>
          </q-card>
          <div class="row q-mt-xs">
            <q-card flat bordered class="no-border-radius col-6" style="height: 85px">
              <div class="col-11 text-center">{{ tc('最大') }}</div>
              <div :class="monitorServersData.max_cpu_usage && monitorServersData.max_cpu_usage !== '暂无数据' && monitorServersData.max_cpu_usage !== '获取数据出错' ? 'text-center text-h5 q-mt-md' : 'text-center text-h6 q-mt-md'">
                {{ monitorServersData.max_cpu_usage && monitorServersData.max_cpu_usage !== '暂无数据' && monitorServersData.max_cpu_usage !== '获取数据出错' ? (parseFloat(monitorServersData.max_cpu_usage).toFixed(2) + '%') : monitorServersData.max_cpu_usage ? tc(monitorServersData.max_cpu_usage) : tc('正在获取') }}
              </div>
            </q-card>
            <q-card flat bordered class="no-border-radius col-6" style="height: 85px">
              <div class="col-11 text-center">{{ tc('最小') }}</div>
              <div :class="monitorServersData.min_cpu_usage && monitorServersData.min_cpu_usage !== '暂无数据' && monitorServersData.min_cpu_usage !== '获取数据出错' ? 'text-center text-h5 q-mt-md' : 'text-center text-h6 q-mt-md'">
                {{ monitorServersData.min_cpu_usage && monitorServersData.min_cpu_usage !== '暂无数据' && monitorServersData.min_cpu_usage !== '获取数据出错' ? (parseFloat(monitorServersData.min_cpu_usage).toFixed(2) + '%') : monitorServersData.min_cpu_usage ? tc(monitorServersData.min_cpu_usage) : tc('正在获取') }}
              </div>
            </q-card>
          </div>
        </div>
        <div class="col-2 q-ml-md" >
          <q-card flat bordered class="no-border-radius" style="height: 120px">
            <div class="row">
              <div class="col-11 text-center">{{ tc('平均内存使用率') }}</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="monitorServersData.isMemRefreshShow"
                      @click="refreshByQuery(props.unitServers.id,'mem')"/>
            </div>
            <div :class="monitorServersData.mem_usage ? 'text-center text-h4 q-mt-md' : 'text-center text-h5 q-mt-md'">
              {{ monitorServersData.mem_usage && monitorServersData.mem_usage !== '暂无数据' && monitorServersData.mem_usage !== '获取数据出错' ? (parseFloat(monitorServersData.mem_usage).toFixed(2) + '%') : monitorServersData.mem_usage ? tc(monitorServersData.mem_usage) : tc('正在获取') }}
            </div>
            <line-chart :chartData="[monitorServersData.mem_usage, monitorServersData.min_mem_usage, monitorServersData.max_mem_usage]"></line-chart>
          </q-card>
          <div class="row q-mt-xs">
            <q-card flat bordered class="no-border-radius col-6" style="height: 85px">
              <div class="col-11 text-center">{{ tc('最大') }}</div>
              <div :class="monitorServersData.max_mem_usage && monitorServersData.max_mem_usage !== '暂无数据' && monitorServersData.max_mem_usage !== '获取数据出错' ? 'text-center text-h5 q-mt-md' : 'text-center text-h6 q-mt-md'">
                {{ monitorServersData.max_mem_usage && monitorServersData.max_mem_usage !== '暂无数据' && monitorServersData.max_mem_usage !== '获取数据出错' ? (parseFloat(monitorServersData.max_mem_usage).toFixed(2) + '%') : monitorServersData.max_mem_usage ? tc(monitorServersData.max_mem_usage) : tc('正在获取') }}
              </div>
            </q-card>
            <q-card flat bordered class="no-border-radius col-6" style="height: 85px">
              <div class="col-11 text-center">{{ tc('最小') }}</div>
              <div :class="monitorServersData.min_mem_usage && monitorServersData.min_mem_usage !== '暂无数据' && monitorServersData.min_mem_usage !== '获取数据出错' ? 'text-center text-h5 q-mt-md' : 'text-center text-h6 q-mt-md'">
                {{ monitorServersData.min_mem_usage && monitorServersData.min_mem_usage !== '暂无数据' && monitorServersData.min_mem_usage !== '获取数据出错' ? (parseFloat(monitorServersData.min_mem_usage).toFixed(2) + '%') : monitorServersData.min_mem_usage ? tc(monitorServersData.min_mem_usage) : tc('正在获取') }}
              </div>
            </q-card>
          </div>
        </div>
        <div class="col-2 q-ml-md">
          <q-card flat bordered class="no-border-radius" style="height: 120px">
            <div class="row">
              <div class="col-11 text-center">{{ tc('平均硬盘使用率') }}</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="monitorServersData.isDiskRefreshShow"
                      @click="refreshByQuery(props.unitServers.id,'disk')"/>
            </div>
            <div :class="monitorServersData.disk_usage ? 'text-center text-h4 q-mt-md' : 'text-center text-h5 q-mt-md'">
              {{ monitorServersData.disk_usage && monitorServersData.disk_usage !== '暂无数据' && monitorServersData.disk_usage !== '获取数据出错' ? (parseFloat(monitorServersData.disk_usage).toFixed(2) + '%') : monitorServersData.disk_usage ? tc(monitorServersData.disk_usage) : tc('正在获取') }}
            </div>
            <line-chart :chartData="[monitorServersData.disk_usage, monitorServersData.min_disk_usage, monitorServersData.max_disk_usage]"></line-chart>
          </q-card>
          <div class="row q-mt-xs">
            <q-card flat bordered class="no-border-radius col-6" style="height: 85px">
              <div class="col-11 text-center">{{ tc('最大') }}</div>
              <div :class="monitorServersData.max_disk_usage && monitorServersData.max_disk_usage !== '暂无数据' && monitorServersData.max_disk_usage !== '获取数据出错' ? 'text-center text-h5 q-mt-md' : 'text-center text-h6 q-mt-md'">
                {{ monitorServersData.max_disk_usage && monitorServersData.max_disk_usage !== '暂无数据' && monitorServersData.max_disk_usage !== '获取数据出错' ? (parseFloat(monitorServersData.max_disk_usage).toFixed(2) + '%') : monitorServersData.max_disk_usage ? tc(monitorServersData.max_disk_usage) : tc('正在获取') }}
              </div>
            </q-card>
            <q-card flat bordered class="no-border-radius col-6" style="height: 85px">
              <div class="col-11 text-center">{{ tc('最小') }}</div>
              <div :class="monitorServersData.min_disk_usage && monitorServersData.min_disk_usage !== '暂无数据' && monitorServersData.min_disk_usage !== '获取数据出错' ? 'text-center text-h5 q-mt-md' : 'text-center text-h6 q-mt-md'">
                {{ monitorServersData.min_disk_usage && monitorServersData.min_disk_usage !== '暂无数据' && monitorServersData.min_disk_usage !== '获取数据出错' ? (parseFloat(monitorServersData.min_disk_usage).toFixed(2) + '%') : monitorServersData.min_disk_usage ? tc(monitorServersData.min_disk_usage) : tc('正在获取') }}
              </div>
            </q-card>
          </div>
        </div>
        <div class="col-1 q-ml-md">
          <q-card flat bordered class="no-border-radius" style="height: 209px">
            <div class="text-center q-mt-xl">
              <div class="text-primary cursor-pointer" @click="goToGrafana">
                <div>Go To</div>
                <div>Grafana</div>
              </div>
              <div class="q-mt-sm">{{ tc('查看详细信息') }}</div>
            </div>
          </q-card>
        </div>
      </div>
  </div>
</template>

<style lang="scss" scoped>
.ServerCluster {
}
</style>
