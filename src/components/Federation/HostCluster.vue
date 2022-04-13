<script setup lang="ts">
import { ref, onMounted } from 'vue'
import monitor from '../../api/index'
import LineChart from 'components/Chart/LineChart.vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const emits = defineEmits(['is-emit'])

const hostData: any = ref([])
const divNodesCpu = ref<typeof LineChart[]>([])
const divNodesMem = ref<typeof LineChart[]>([])
const divNodesDisk = ref<typeof LineChart[]>([])
const getHostQuery = async (payload: { service_id: string }) => {
  const hostQuery: string[] = ['host_count', 'host_up_count', 'health_status', 'cpu_usage', 'max_cpu_usage', 'min_cpu_usage', 'mem_usage', 'max_mem_usage', 'min_mem_usage', 'disk_usage', 'max_disk_usage', 'min_disk_usage']
  const config = {
    query: {
      service_id: payload.service_id,
      query: ''
    }
  }
  const hostDataArr = []
  let length = 0
  config.query.query = hostQuery[0]
  await monitor.monitor.api.getMonitorServerQuery(config).then((res) => {
    length = res.data.length
  })
  for (let i = 0; i < length; i++) {
    const hostObject: Record<string, any> = {}
    hostObject.isShowHost = true
    hostObject.isShowStatus = true
    hostObject.isShowCpu = true
    hostObject.isShowMem = true
    hostObject.isShowDisk = true
    for (const item of hostQuery) {
      config.query.query = item
      await monitor.monitor.api.getMonitorServerQuery(config).then((res) => {
        if (!hostObject.name) {
          hostObject.name = res.data[i].monitor.name
        }
        if (!hostObject.service_id) {
          hostObject.service_id = res.data[i].monitor.service_id
        }
        if (res.data[i].value !== null) {
          hostObject[item] = res.data[i].value[1]
        }
      }).catch((error) => {
        console.log(error)
      })
    }
    hostDataArr.push(hostObject)
  }
  return hostDataArr
}
const getData = async (payload: { service_id: string, query: string, num: number }) => {
  const config = {
    query: {
      service_id: payload.service_id,
      query: payload.query
    }
  }
  await monitor.monitor.api.getMonitorServerQuery(config).then((res) => {
    if (res.data[payload.num].value !== null) {
      hostData.value[payload.num][payload.query] = res.data[payload.num].value[1]
    }
  })
}
const refresh = async (payload: { service_id: string, type: string, num: number }) => {
  if (payload.type === 'host') {
    hostData.value[payload.num].isShowHost = false
    const hostQueryArr = ['host_count', 'host_up_count']
    for (const item of hostQueryArr) {
      void await getData({ service_id: payload.service_id, query: item, num: payload.num })
    }
    hostData.value[payload.num].isShowHost = true
  } else if (payload.type === 'healthy') {
    hostData.value[payload.num].isShowStatus = false
    void await getData({ service_id: payload.service_id, query: 'health_status', num: payload.num })
    hostData.value[payload.num].isShowStatus = true
  } else if (payload.type === 'cpu') {
    hostData.value[payload.num].isShowCpu = false
    const cpuArr = ['cpu_usage', 'min_cpu_usage', 'max_cpu_usage']
    const cpuChart: number[] = []
    for (const item of cpuArr) {
      void await getData({ service_id: payload.service_id, query: item, num: payload.num })
    }
    cpuChart.push(0)
    cpuChart.push(hostData.value[payload.num].cpu_usage)
    cpuChart.push(hostData.value[payload.num].min_cpu_usage)
    cpuChart.push(hostData.value[payload.num].max_cpu_usage)
    divNodesCpu.value[payload.num].refreshChart(cpuChart)
    hostData.value[payload.num].isShowCpu = true
  } else if (payload.type === 'mem') {
    hostData.value[payload.num].isShowMem = false
    const memArr = ['mem_usage', 'min_mem_usage', 'max_mem_usage']
    const memChart: number[] = []
    for (const item of memArr) {
      void await getData({ service_id: payload.service_id, query: item, num: payload.num })
    }
    memChart.push(0)
    memChart.push(hostData.value[payload.num].mem_usage)
    memChart.push(hostData.value[payload.num].min_mem_usage)
    memChart.push(hostData.value[payload.num].max_mem_usage)
    divNodesMem.value[payload.num].refreshChart(memChart)
    hostData.value[payload.num].isShowMem = true
  } else {
    hostData.value[payload.num].isShowDisk = false
    const diskArr = ['disk_usage', 'min_disk_usage', 'max_disk_usage']
    const diskChart: number[] = []
    for (const item of diskArr) {
      void await getData({ service_id: payload.service_id, query: item, num: payload.num })
    }
    diskChart.push(0)
    diskChart.push(hostData.value[payload.num].disk_usage)
    diskChart.push(hostData.value[payload.num].min_disk_usage)
    diskChart.push(hostData.value[payload.num].max_disk_usage)
    divNodesDisk.value[payload.num].refreshChart(diskChart)
    hostData.value[payload.num].isShowDisk = true
  }
}
const intervalRefresh = () => {
  for (const item of hostData.value) {
    item.isShowHost = false
    item.isShowStatus = false
    item.isShowCpu = false
    item.isShowMem = false
    item.isShowDisk = false
  }
  void getHostQuery({ service_id: props.id }).then((res) => {
    hostData.value = res
    for (let i = 0; i < res.length; i++) {
      const cpuChart: number[] = []
      const memChart: number[] = []
      const diskChart: number[] = []
      cpuChart.push(0)
      cpuChart.push(hostData.value[i].cpu_usage)
      cpuChart.push(hostData.value[i].min_cpu_usage)
      cpuChart.push(hostData.value[i].max_cpu_usage)
      memChart.push(0)
      memChart.push(hostData.value[i].mem_usage)
      memChart.push(hostData.value[i].min_mem_usage)
      memChart.push(hostData.value[i].max_mem_usage)
      diskChart.push(0)
      diskChart.push(hostData.value[i].disk_usage)
      diskChart.push(hostData.value[i].min_disk_usage)
      diskChart.push(hostData.value[i].max_disk_usage)
      divNodesCpu.value[i].refreshChart(cpuChart)
      divNodesMem.value[i].refreshChart(memChart)
      divNodesDisk.value[i].refreshChart(diskChart)
    }
    for (const item of hostData.value) {
      item.isShowHost = true
      item.isShowStatus = true
      item.isShowCpu = true
      item.isShowMem = true
      item.isShowDisk = true
    }
    emits('is-emit', true)
  })
}
defineExpose({ intervalRefresh })
onMounted(() => {
  void getHostQuery({ service_id: props.id }).then((res) => {
    hostData.value = res
  })
})
</script>

<template>
  <div class="HostCluster">
    <div class="q-mt-sm" v-for="(item, index) in hostData" :key="index">
      <div class="text-subtitle1 text-weight-bold">{{ item.name }}</div>
      <div class="row q-mt-sm">
        <div class="col-2">
          <q-card flat bordered class="no-border-radius q-pb-sm">
            <div class="row q-pb-lg">
              <div class="col-11 text-center">主机数</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="item.isShowHost"
                      @click="refresh({ service_id: item.service_id, type: 'host', num: index })"/>
            </div>
            <div :class="!item.host_count ? 'text-center text-h5 q-mt-sm q-py-sm' : 'text-center text-h4 q-mt-sm q-py-sm'">
              {{ !item.host_count ? '暂无数据' : item.host_count }}
            </div>
          </q-card>
          <div class="row q-mt-xs">
            <q-card flat bordered class="no-border-radius col-6">
              <div class="col-11 text-center">在线</div>
              <div :class="!item.host_up_count ? 'text-center text-h6 q-mt-sm q-pa-sm q-pb-md' : 'text-center text-h4 text-positive q-mt-sm q-py-sm'">
                {{ !item.host_up_count ? '暂无数据' : item.host_up_count }}
              </div>
            </q-card>
            <q-card flat bordered class="no-border-radius col-6">
              <div class="col-11 text-center">掉线</div>
              <div :class="!item.host_count || !item.host_up_count ? 'text-center text-h6 q-mt-sm q-pa-sm q-pb-md' : 'text-center text-h4 text-negative q-mt-sm q-py-sm'">
                {{ !item.host_count || !item.host_up_count ? '暂无数据' : (parseFloat(item.host_count) - parseFloat(item.host_up_count)) }}
              </div>
            </q-card>
          </div>
        </div>
        <div class="col-2 q-ml-md">
          <q-card flat bordered class="no-border-radius q-pb-lg">
            <div class="row q-pb-xs">
              <div class="col-11 text-center">集群状态</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="item.isShowStatus"
                      @click="refresh({ service_id: item.service_id, type: 'healthy', num: index })"/>
            </div>
            <div :class="!item.health_status ? 'text-center text-h5 q-mt-lg q-py-xl' : item.health_status === '0' ? 'text-positive text-center text-h4 text-weight-bold q-mt-lg q-py-xl' :
            item.health_status === '1' ? 'text-warning text-center text-h4 text-weight-bold q-mt-lg q-pa-xl q-pb-md' :
            'text-negative text-center text-h4 text-weight-bold q-mt-lg q-pa-xl q-pb-md'">
              {{ !item.health_status ? '暂无数据' : item.health_status === '0' ? 'Healthy' : item.health_status === '1' ? 'Warning' : 'Fatal' }}
            </div>
          </q-card>
        </div>
        <div class="col-2 q-ml-md">
          <q-card flat bordered class="no-border-radius">
            <div class="row">
              <div class="col-11 text-center">平均CPU使用率</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="item.isShowCpu"
                      @click="refresh({ service_id: item.service_id, type: 'cpu', num: index})"/>
            </div>
            <div :class="!item.cpu_usage ? 'text-center text-h5 q-mt-md' : 'text-center text-h4 q-mt-md'">
              {{ !item.cpu_usage ? '暂无数据' : (parseFloat(item.cpu_usage).toFixed(2) + '%') }}
            </div>
            <line-chart :ref="el=>{divNodesCpu[index] = el}" :chartData="[item.cpu_usage, item.min_cpu_usage, item.max_cpu_usage]"></line-chart>
          </q-card>
          <div class="row q-mt-xs">
            <q-card flat bordered class="no-border-radius col-6">
              <div class="col-11 text-center">最大</div>
              <div :class="!item.max_cpu_usage ? 'text-center text-h6 q-mt-md q-py-sm' : 'text-center text-h5 q-mt-md q-py-sm'">
                {{ !item.max_cpu_usage ? '暂无数据' : (parseFloat(item.max_cpu_usage).toFixed(2) + '%') }}
              </div>
            </q-card>
            <q-card flat bordered class="no-border-radius col-6">
              <div class="col-11 text-center">最小</div>
              <div :class="!item.min_cpu_usage ? 'text-center text-h6 q-mt-md q-py-sm' : 'text-center text-h5 q-mt-md q-py-sm'">
                {{ !item.min_cpu_usage ? '暂无数据' : (parseFloat(item.min_cpu_usage).toFixed(2) + '%') }}
              </div>
            </q-card>
          </div>
        </div>
        <div class="col-2 q-ml-md">
          <q-card flat bordered class="no-border-radius">
            <div class="row">
              <div class="col-11 text-center">平均内存使用率</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="item.isShowMem"
                      @click="refresh({ service_id: item.service_id, type: 'mem', num: index})"/>
            </div>
            <div :class="!item.mem_usage ? 'text-center text-h5 q-mt-md' : 'text-center text-h4 q-mt-md'">
              {{ !item.mem_usage ? '暂无数据' : (parseFloat(item.mem_usage).toFixed(2) + '%') }}
            </div>
            <line-chart :ref="el=>{divNodesMem[index] = el}" :chartData="[item.mem_usage, item.min_mem_usage, item.max_mem_usage]"></line-chart>
          </q-card>
          <div class="row q-mt-xs">
            <q-card flat bordered class="no-border-radius col-6">
              <div class="col-11 text-center">最大</div>
              <div :class="!item.max_mem_usage ? 'text-center text-h6 q-mt-md q-py-sm' : 'text-center text-h5 q-mt-md q-py-sm'">
                {{ !item.max_mem_usage ? '暂无数据' : (parseFloat(item.max_mem_usage).toFixed(2) + '%') }}
              </div>
            </q-card>
            <q-card flat bordered class="no-border-radius col-6">
              <div class="col-11 text-center">最小</div>
              <div :class="!item.min_mem_usage ? 'text-center text-h6 q-mt-md q-py-sm' : 'text-center text-h5 q-mt-md q-py-sm'">
                {{ !item.min_mem_usage ? '暂无数据' : (parseFloat(item.min_mem_usage).toFixed(2) + '%') }}
              </div>
            </q-card>
          </div>
        </div>
        <div class="col-2 q-ml-md">
          <q-card flat bordered class="no-border-radius">
            <div class="row">
              <div class="col-11 text-center">平均硬盘使用率</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="item.isShowDisk"
                      @click="refresh({ service_id: item.service_id, type: 'disk', num: index})"/>
            </div>
            <div :class="!item.disk_usage ? 'text-center text-h5 q-mt-md' : 'text-center text-h4 q-mt-md'">
              {{ !item.disk_usage ? '暂无数据' : (parseFloat(item.disk_usage).toFixed(2) + '%') }}
            </div>
            <line-chart :ref="el=>{divNodesDisk[index] = el}" :chartData="[item.disk_usage, item.min_disk_usage, item.max_disk_usage]"></line-chart>
          </q-card>
          <div class="row q-mt-xs">
            <q-card flat bordered class="no-border-radius col-6">
              <div class="col-11 text-center">最大</div>
              <div :class="!item.max_disk_usage ? 'text-center text-h6 q-mt-md q-py-sm' : 'text-center text-h5 q-mt-md q-py-sm'">
                {{ !item.max_disk_usage ? '暂无数据' : (parseFloat(item.max_disk_usage).toFixed(2) + '%') }}
              </div>
            </q-card>
            <q-card flat bordered class="no-border-radius col-6">
              <div class="col-11 text-center">最小</div>
              <div :class="!item.min_disk_usage ? 'text-center text-h6 q-mt-md q-py-sm' : 'text-center text-h5 q-mt-md q-py-sm'">
                {{ !item.min_disk_usage ? '暂无数据' : (parseFloat(item.min_disk_usage).toFixed(2) + '%') }}
              </div>
            </q-card>
          </div>
        </div>
        <div class="col-1 q-ml-md">
          <q-card flat bordered class="no-border-radius q-py-md">
            <div class="text-center q-mt-lg q-py-md">
              <p class="text-primary q-mt-xs">Go To</p>
              <p class="text-primary">Grafana</p>
              <p>详细信息</p>
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.HostCluster {
}
</style>
