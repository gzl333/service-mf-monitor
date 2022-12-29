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

const monitorServersData = ref<any[]>([])
const divNodesCpu = ref<typeof LineChart[]>([])
const divNodesMem = ref<typeof LineChart[]>([])
const divNodesDisk = ref<typeof LineChart[]>([])
const getServerQuery = async (monitor_unit_id: string) => {
  const serverQuery: string[] = ['host_count', 'host_up_count', 'health_status', 'cpu_usage', 'max_cpu_usage', 'min_cpu_usage', 'mem_usage', 'max_mem_usage', 'min_mem_usage', 'disk_usage', 'max_disk_usage', 'min_disk_usage']
  const config = {
    query: {
      monitor_unit_id,
      query: ''
    }
  }
  const serverQueryData = []
  let monitorServers = 0
  config.query.query = serverQuery[0]
  const monitorServerRes = await monitor.monitor.api.getMonitorServerQuery(config)
  monitorServers = monitorServerRes.data.length
  for (let i = 0; i < monitorServers; i++) {
    const serverObject: Record<string, any> = {}
    serverObject.isHostRefreshShow = true
    serverObject.isStatusRefreshShow = true
    serverObject.isCpuRefreshShow = true
    serverObject.isMemRefreshShow = true
    serverObject.isDiskRefreshShow = true
    serverObject.grafana_url = props.unitServers.grafana_url
    for (const server of serverQuery) {
      config.query.query = server
      // const str: keyof MonitorServerInterface = item
      await monitor.monitor.api.getMonitorServerQuery(config).then((res) => {
        if (!serverObject.name) {
          serverObject.name = res.data[i].monitor.name
        }
        if (!serverObject.monitor_unit_id) {
          serverObject.monitor_unit_id = res.data[i].monitor.id
        }
        if (res.data[i].value !== null) {
          serverObject[server] = res.data[i].value[1]
        }
      }).catch((error) => {
        console.log(error)
      })
    }
    serverQueryData.push(serverObject)
  }
  return serverQueryData
}
const refreshGetServerData = async (monitor_unit_id: string, query: string, num: number) => {
  const config = {
    query: {
      monitor_unit_id,
      query
    }
  }
  await monitor.monitor.api.getMonitorServerQuery(config).then((res) => {
    if (res.data[num].value !== null) {
      monitorServersData.value[num][query] = res.data[num].value[1]
    }
  })
}
const refresh = async (monitor_unit_id: string, type: string, itemIndex: number) => {
  if (type === 'host') {
    monitorServersData.value[itemIndex].isHostRefreshShow = false
    const hostQueryArr = ['host_count', 'host_up_count']
    for (const host of hostQueryArr) {
      void await refreshGetServerData(monitor_unit_id, host, itemIndex)
    }
    monitorServersData.value[itemIndex].isHostRefreshShow = true
  } else if (type === 'healthy') {
    monitorServersData.value[itemIndex].isStatusRefreshShow = false
    void await refreshGetServerData(monitor_unit_id, 'health_status', itemIndex)
    monitorServersData.value[itemIndex].isStatusRefreshShow = true
  } else if (type === 'cpu') {
    monitorServersData.value[itemIndex].isCpuRefreshShow = false
    const cpuArr = ['cpu_usage', 'min_cpu_usage', 'max_cpu_usage']
    const cpuChart: number[] = []
    for (const cpu of cpuArr) {
      void await refreshGetServerData(monitor_unit_id, cpu, itemIndex)
    }
    cpuChart.push(0)
    cpuChart.push(monitorServersData.value[itemIndex].cpu_usage)
    cpuChart.push(monitorServersData.value[itemIndex].min_cpu_usage)
    cpuChart.push(monitorServersData.value[itemIndex].max_cpu_usage)
    divNodesCpu.value[itemIndex].refreshChart(cpuChart)
    monitorServersData.value[itemIndex].isCpuRefreshShow = true
  } else if (type === 'mem') {
    monitorServersData.value[itemIndex].isMemRefreshShow = false
    const memArr = ['mem_usage', 'min_mem_usage', 'max_mem_usage']
    const memChart: number[] = []
    for (const mem of memArr) {
      void await refreshGetServerData(monitor_unit_id, mem, itemIndex)
    }
    memChart.push(0)
    memChart.push(monitorServersData.value[itemIndex].mem_usage)
    memChart.push(monitorServersData.value[itemIndex].min_mem_usage)
    memChart.push(monitorServersData.value[itemIndex].max_mem_usage)
    divNodesMem.value[itemIndex].refreshChart(memChart)
    monitorServersData.value[itemIndex].isMemRefreshShow = true
  } else {
    monitorServersData.value[itemIndex].isDiskRefreshShow = false
    const diskArr = ['disk_usage', 'min_disk_usage', 'max_disk_usage']
    const diskChart: number[] = []
    for (const disk of diskArr) {
      void await refreshGetServerData(monitor_unit_id, disk, itemIndex)
    }
    diskChart.push(0)
    diskChart.push(monitorServersData.value[itemIndex].disk_usage)
    diskChart.push(monitorServersData.value[itemIndex].min_disk_usage)
    diskChart.push(monitorServersData.value[itemIndex].max_disk_usage)
    divNodesDisk.value[itemIndex].refreshChart(diskChart)
    monitorServersData.value[itemIndex].isDiskRefreshShow = true
  }
}
const intervalRefresh = () => {
  for (const server of monitorServersData.value) {
    server.isHostRefreshShow = false
    server.isStatusRefreshShow = false
    server.isCpuRefreshShow = false
    server.isMemRefreshShow = false
    server.isDiskRefreshShow = false
  }
  void getServerQuery(props.unitServers.id).then((res) => {
    monitorServersData.value = res
    for (let i = 0; i < res.length; i++) {
      const cpuChart: number[] = []
      const memChart: number[] = []
      const diskChart: number[] = []
      cpuChart.push(0)
      cpuChart.push(monitorServersData.value[i].cpu_usage)
      cpuChart.push(monitorServersData.value[i].min_cpu_usage)
      cpuChart.push(monitorServersData.value[i].max_cpu_usage)
      memChart.push(0)
      memChart.push(monitorServersData.value[i].mem_usage)
      memChart.push(monitorServersData.value[i].min_mem_usage)
      memChart.push(monitorServersData.value[i].max_mem_usage)
      diskChart.push(0)
      diskChart.push(monitorServersData.value[i].disk_usage)
      diskChart.push(monitorServersData.value[i].min_disk_usage)
      diskChart.push(monitorServersData.value[i].max_disk_usage)
      divNodesCpu.value[i].refreshChart(cpuChart)
      divNodesMem.value[i].refreshChart(memChart)
      divNodesDisk.value[i].refreshChart(diskChart)
    }
    for (const item of monitorServersData.value) {
      item.isHostRefreshShow = true
      item.isStatusRefreshShow = true
      item.isCpuRefreshShow = true
      item.isMemRefreshShow = true
      item.isDiskRefreshShow = true
    }
    emits('is-emit', true)
  })
}
const goToGrafana = () => {
  window.open(props.unitServers.grafana_url)
}
defineExpose({ intervalRefresh })
onBeforeMount(async () => {
  monitorServersData.value = await getServerQuery(props.unitServers.id)
})
</script>

<template>
  <div class="ServerCluster">
    <div class="q-mt-sm q-pb-lg" v-for="(item, index) in monitorServersData" :key="index">
      <div class="text-subtitle1 text-weight-bold">{{ item.name }}</div>
      <div class="row q-mt-sm">
        <div class="col-2">
          <q-card flat bordered class="no-border-radius q-pb-sm">
            <div class="row q-pb-lg">
              <div class="col-11 text-center">{{ tc('主机数') }}</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="item.isHostRefreshShow"
                      @click="refresh(item.monitor_unit_id, 'host', index)"/>
            </div>
            <div :class="!item.host_count ? 'text-center text-h5 q-mt-sm q-py-sm' : 'text-center text-h4 q-mt-sm q-py-sm'">
              {{ !item.host_count ? tc('暂无数据') : item.host_count }}
            </div>
          </q-card>
          <div class="row q-mt-xs">
            <q-card flat bordered class="no-border-radius col-6">
              <div class="col-11 text-center">{{ tc('在线') }}</div>
              <div :class="!item.host_up_count ? 'text-center text-h6 q-mt-sm q-pt-sm q-pb-md' : 'text-center text-h4 text-positive q-mt-sm q-py-sm'">
                {{ !item.host_up_count ? tc('暂无数据') : item.host_up_count }}
              </div>
            </q-card>
            <q-card flat bordered class="no-border-radius col-6">
              <div class="col-11 text-center">{{ tc('掉线') }}</div>
              <div :class="!item.host_count || !item.host_up_count ? 'text-center text-h6 q-mt-sm q-pt-sm q-pb-md' : 'text-center text-h4 text-negative q-mt-sm q-py-sm'">
                {{ !item.host_count || !item.host_up_count ? tc('暂无数据') : (parseFloat(item.host_count) - parseFloat(item.host_up_count)) }}
              </div>
            </q-card>
          </div>
        </div>
        <div class="col-2 q-ml-md">
          <q-card flat bordered class="no-border-radius q-pb-lg">
            <div class="row q-pb-xs">
              <div class="col-11 text-center">{{ tc('集群状态') }}</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="item.isStatusRefreshShow"
                      @click="refresh(item.monitor_unit_id, 'healthy', index)"/>
            </div>
            <div :class="!item.health_status ? 'text-center text-h5 q-mt-lg q-py-xl' : item.health_status === '0' ? 'text-positive text-center text-h4 text-weight-bold q-mt-lg q-py-xl' :
            item.health_status === '1' ? 'text-warning text-center text-h4 text-weight-bold q-mt-lg q-px-xl q-pb-md' :
            'text-negative text-center text-h4 text-weight-bold q-mt-lg q-px-xl q-pb-md'">
              {{ !item.health_status ? tc('暂无数据') : item.health_status === '0' ? 'Healthy' : item.health_status === '1' ? 'Warning' : 'Fatal' }}
            </div>
          </q-card>
        </div>
        <div class="col-2 q-ml-md">
          <q-card flat bordered class="no-border-radius">
            <div class="row">
              <div class="col-11 text-center">{{ tc('平均CPU使用率') }}</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="item.isCpuRefreshShow"
                      @click="refresh(item.monitor_unit_id,'cpu', index)"/>
            </div>
            <div :class="!item.cpu_usage ? 'text-center text-h5 q-mt-md' : 'text-center text-h4 q-mt-md'">
              {{ !item.cpu_usage ? tc('暂无数据') : (parseFloat(item.cpu_usage).toFixed(2) + '%') }}
            </div>
            <line-chart :ref="el=>{divNodesCpu[index] = el}" :chartData="[item.cpu_usage, item.min_cpu_usage, item.max_cpu_usage]"></line-chart>
          </q-card>
          <div class="row q-mt-xs">
            <q-card flat bordered class="no-border-radius col-6">
              <div class="col-11 text-center">{{ tc('最大') }}</div>
              <div :class="!item.max_cpu_usage ? 'text-center text-h6 q-mt-md q-py-sm' : 'text-center text-h5 q-mt-md q-py-sm'">
                {{ !item.max_cpu_usage ? tc('暂无数据') : (parseFloat(item.max_cpu_usage).toFixed(2) + '%') }}
              </div>
            </q-card>
            <q-card flat bordered class="no-border-radius col-6">
              <div class="col-11 text-center">{{ tc('最小') }}</div>
              <div :class="!item.min_cpu_usage ? 'text-center text-h6 q-mt-md q-py-sm' : 'text-center text-h5 q-mt-md q-py-sm'">
                {{ !item.min_cpu_usage ? tc('暂无数据') : (parseFloat(item.min_cpu_usage).toFixed(2) + '%') }}
              </div>
            </q-card>
          </div>
        </div>
        <div class="col-2 q-ml-md">
          <q-card flat bordered class="no-border-radius">
            <div class="row">
              <div class="col-11 text-center">{{ tc('平均内存使用率') }}</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="item.isMemRefreshShow"
                      @click="refresh(item.monitor_unit_id,'mem', index)"/>
            </div>
            <div :class="!item.mem_usage ? 'text-center text-h5 q-mt-md' : 'text-center text-h4 q-mt-md'">
              {{ !item.mem_usage ? tc('暂无数据') : (parseFloat(item.mem_usage).toFixed(2) + '%') }}
            </div>
            <line-chart :ref="el=>{divNodesMem[index] = el}" :chartData="[item.mem_usage, item.min_mem_usage, item.max_mem_usage]"></line-chart>
          </q-card>
          <div class="row q-mt-xs">
            <q-card flat bordered class="no-border-radius col-6">
              <div class="col-11 text-center">{{ tc('最大') }}</div>
              <div :class="!item.max_mem_usage ? 'text-center text-h6 q-mt-md q-py-sm' : 'text-center text-h5 q-mt-md q-py-sm'">
                {{ !item.max_mem_usage ? tc('暂无数据') : (parseFloat(item.max_mem_usage).toFixed(2) + '%') }}
              </div>
            </q-card>
            <q-card flat bordered class="no-border-radius col-6">
              <div class="col-11 text-center">{{ tc('最小') }}</div>
              <div :class="!item.min_mem_usage ? 'text-center text-h6 q-mt-md q-py-sm' : 'text-center text-h5 q-mt-md q-py-sm'">
                {{ !item.min_mem_usage ? tc('暂无数据') : (parseFloat(item.min_mem_usage).toFixed(2) + '%') }}
              </div>
            </q-card>
          </div>
        </div>
        <div class="col-2 q-ml-md">
          <q-card flat bordered class="no-border-radius">
            <div class="row">
              <div class="col-11 text-center">{{ tc('平均硬盘使用率') }}</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="item.isDiskRefreshShow"
                      @click="refresh(item.monitor_unit_id,'disk', index)"/>
            </div>
            <div :class="!item.disk_usage ? 'text-center text-h5 q-mt-md' : 'text-center text-h4 q-mt-md'">
              {{ !item.disk_usage ? tc('暂无数据') : (parseFloat(item.disk_usage).toFixed(2) + '%') }}
            </div>
            <line-chart :ref="el=>{divNodesDisk[index] = el}" :chartData="[item.disk_usage, item.min_disk_usage, item.max_disk_usage]"></line-chart>
          </q-card>
          <div class="row q-mt-xs">
            <q-card flat bordered class="no-border-radius col-6">
              <div class="col-11 text-center">{{ tc('最大') }}</div>
              <div :class="!item.max_disk_usage ? 'text-center text-h6 q-mt-md q-py-sm' : 'text-center text-h5 q-mt-md q-py-sm'">
                {{ !item.max_disk_usage ? tc('暂无数据') : (parseFloat(item.max_disk_usage).toFixed(2) + '%') }}
              </div>
            </q-card>
            <q-card flat bordered class="no-border-radius col-6">
              <div class="col-11 text-center">{{ tc('最小') }}</div>
              <div :class="!item.min_disk_usage ? 'text-center text-h6 q-mt-md q-py-sm' : 'text-center text-h5 q-mt-md q-py-sm'">
                {{ !item.min_disk_usage ? tc('暂无数据') : (parseFloat(item.min_disk_usage).toFixed(2) + '%') }}
              </div>
            </q-card>
          </div>
        </div>
        <div class="col-1 q-ml-md">
          <q-card flat bordered class="no-border-radius q-py-lg">
            <div class="text-center q-mt-lg q-py-lg">
              <div class="text-primary cursor-pointer" @click="goToGrafana">
                <div>Go To</div>
                <div>Grafana</div>
              </div>
              <div class="q-mt-sm q-pb-md">{{ tc('查看详细信息') }}</div>
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ServerCluster {
}
</style>
