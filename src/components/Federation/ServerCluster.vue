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
//   cpu_usage: string
//   disk_usage: string
//   grafana_url: string
//   health_status: string
//   host_count: string
//   host_up_count: string
//   max_cpu_usage: string
//   max_disk_usage: string
//   max_mem_usage: string
//   mem_usage: string
//   min_cpu_usage: string
//   min_disk_usage: string
//   min_mem_usage: string
//   id: string
//   name: string
// }
const emits = defineEmits(['is-emit', 'is-back'])
const { tc } = i18n.global
const monitorServersData = ref<Record<string, string | number>>({})
const isHostRefreshShow = ref(false)
const isStatusRefreshShow = ref(false)
const isCpuRefreshShow = ref(false)
const isMemRefreshShow = ref(false)
const isDiskRefreshShow = ref(false)
const getServerQuery = async (monitor_unit_id: string) => {
  const serverQuery: string[] = ['host_count', 'host_up_count', 'health_status', 'cpu_usage', 'max_cpu_usage', 'min_cpu_usage', 'mem_usage', 'max_mem_usage', 'min_mem_usage', 'disk_usage', 'max_disk_usage', 'min_disk_usage']
  const config = {
    query: {
      monitor_unit_id,
      query: ''
    }
  }
  const serverObject: {[key: string]: string } = {}
  serverObject.grafana_url = props.unitServers.grafana_url
  serverObject.unitName = props.unitServers.name
  serverObject.id = props.unitServers.id
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
  isHostRefreshShow.value = true
  isStatusRefreshShow.value = true
  isCpuRefreshShow.value = true
  isMemRefreshShow.value = true
  isDiskRefreshShow.value = true
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
    } else {
      monitorServersData.value[query] = '暂无数据'
    }
  })
}
const refreshByQuery = async (monitor_unit_id: string, type: string) => {
  if (type === 'host') {
    isHostRefreshShow.value = false
    const hostQueryArr = ['host_count', 'host_up_count']
    for (const host of hostQueryArr) {
      void await refreshServerData(monitor_unit_id, host)
    }
    isHostRefreshShow.value = true
  } else if (type === 'healthy') {
    isStatusRefreshShow.value = false
    void await refreshServerData(monitor_unit_id, 'health_status')
    isStatusRefreshShow.value = true
  } else if (type === 'cpu') {
    isCpuRefreshShow.value = false
    const cpuQueryArr = ['cpu_usage', 'min_cpu_usage', 'max_cpu_usage']
    for (const cpu of cpuQueryArr) {
      void await refreshServerData(monitor_unit_id, cpu)
    }
    isCpuRefreshShow.value = true
  } else if (type === 'mem') {
    isMemRefreshShow.value = false
    const memQueryArr = ['mem_usage', 'min_mem_usage', 'max_mem_usage']
    for (const mem of memQueryArr) {
      void await refreshServerData(monitor_unit_id, mem)
    }
    isMemRefreshShow.value = true
  } else {
    isDiskRefreshShow.value = false
    const diskQueryArr = ['disk_usage', 'min_disk_usage', 'max_disk_usage']
    for (const disk of diskQueryArr) {
      void await refreshServerData(monitor_unit_id, disk)
    }
    isDiskRefreshShow.value = true
  }
}
const intervalRefresh = async (isLast: boolean) => {
  isHostRefreshShow.value = false
  isStatusRefreshShow.value = false
  isCpuRefreshShow.value = false
  isMemRefreshShow.value = false
  isDiskRefreshShow.value = false
  monitorServersData.value = await getServerQuery(props.unitServers.id)
  if (isLast) {
    emits('is-emit')
  }
}
const filterStatus = (status: string) => {
  // console.log(status)
  // console.log(monitorServersData.value)
  if (monitorServersData.value.health_status === status) {
    emits('is-back', monitorServersData.value.id)
  }
}
const goToGrafana = () => {
  window.open(props.unitServers.grafana_url)
}
onBeforeMount(async () => {
  monitorServersData.value = await getServerQuery(props.unitServers.id)
  // console.log(monitorServersData.value)
})
defineExpose({ intervalRefresh, filterStatus })
</script>

<template>
  <div class="ServerCluster">
      <div class="text-subtitle1 text-weight-bold q-mt-lg">{{ props.unitServers.name }}</div>
      <div class="row q-mt-sm justify-between">
        <div class="col-2">
          <q-card flat bordered class="no-border-radius" style="height: 120px">
            <div class="row">
              <div class="col-11 text-center">{{ tc('主机数') }}</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="isHostRefreshShow"
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
        <div class="col-2">
          <q-card flat bordered class="no-border-radius" style="height: 209px">
            <div class="row">
              <div class="col-11 text-center">{{ tc('集群状态') }}</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="isStatusRefreshShow"
                      @click="refreshByQuery(props.unitServers.id, 'healthy')"/>
            </div>
            <div :class="!monitorServersData.health_status ? 'text-center text-h5 q-mt-xl' : monitorServersData.health_status === '0' ? 'text-positive text-center text-h4 text-weight-bold q-mt-xl' :
            monitorServersData.health_status === '1' ? 'text-warning text-center text-h4 text-weight-bold q-mt-xl' : 'text-negative text-center text-h4 text-weight-bold q-mt-xl'">
              {{ !monitorServersData.health_status ? tc('正在获取') : monitorServersData.health_status === '0' ? 'Healthy' : monitorServersData.health_status === '1' ? 'Warning' : 'Fatal' }}
            </div>
          </q-card>
        </div>
        <div class="col-2">
          <q-card flat bordered class="no-border-radius" style="height: 120px">
            <div class="row">
              <div class="col-11 text-center">{{ tc('平均CPU使用率') }}</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="isCpuRefreshShow"
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
        <div class="col-2" >
          <q-card flat bordered class="no-border-radius" style="height: 120px">
            <div class="row">
              <div class="col-11 text-center">{{ tc('平均内存使用率') }}</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="isMemRefreshShow"
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
        <div class="col-2">
          <q-card flat bordered class="no-border-radius" style="height: 120px">
            <div class="row">
              <div class="col-11 text-center">{{ tc('平均硬盘使用率') }}</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="isDiskRefreshShow"
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
        <div class="col-1">
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
