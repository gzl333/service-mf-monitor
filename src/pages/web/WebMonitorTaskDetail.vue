<script setup lang="ts">
import { computed, ref, onMounted, watch, onUnmounted } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { useRoute, useRouter } from 'vue-router'
import monitor from 'src/api/monitor'
import { i18n } from 'boot/i18n'
import { date } from 'quasar'
import PieChart from 'components/Chart/WebMonitorStatusPieChart.vue'
// import HistogramChart from 'components/Chart/HistogramChart.vue'
import WebMonitorStatusLine from 'components/Chart/WebMonitorStatusLine.vue'
import WebMonitorDurationLine from 'components/Chart/WebMonitorDurationLine.vue'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])
interface RequestConsumingInterface {
  metric: {
    group: string
    instance: string
    job: string
    monitor: string
    phase: string
    receive_cluster: string
    receive_replica: string
    tenant_id: string
    url: string
    urlhash: string
    __name__: string
  }
  values: Array<string | number>[]
}
const store = useStore()
const route = useRoute()
const router = useRouter()
const { tc } = i18n.global
const detectionPoints = computed(() => store.getDetectionPointTable())
const taskId = route.params.webMonitorTaskId as string
const statusMonitorTime = ref<Array<string | number>>([])
const statusCodeMonitor = ref<Array<string | number>>([])
const statusPieData = ref<Array<number>>([])
const requestConsumingTime = ref<Array<string>>([])
const requestConsumingObj = ref<{ [key: string]: string[] }>({})
let statusNormalTimes = 0
let statusExceptionsTimes = 0
const day = new Date()
const yesterdayTime = String(day.getFullYear()) + '/' + String(day.getMonth() + 1) + '/' + String(day.getDate() - 1) + ' 24:0:0'
const yesterdayTimeStamp = date.formatDate(yesterdayTime, 'X')
const pointId = ref({
  label: '',
  labelEn: '',
  value: ''
})
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
const statusOption = computed(() => ({
  grid: {
    left: 50,
    right: 50,
    bottom: 50
  },
  title: {
    text: '实时请求状态',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: statusMonitorTime.value
  },
  yAxis: {
    type: 'category',
    show: false
  },
  series: [
    {
      type: 'line',
      data: statusCodeMonitor.value,
      itemStyle: {
        normal: {
          label: {
            show: true,
            fontSize: 11,
            formatter: function (param: Record<string, any>) { // 拐点文字回调
              let currentValue
              currentValue = param.value
              if (currentValue !== '200') {
                currentValue = '状态码异常'
              } else {
                currentValue = ''
              }
              return currentValue
            }
          },
          color: function (param: Record<string, any>) { // 拐点颜色回调
            if (param.value !== '200') {
              return '#ff0000'
            } else {
              return '#00BB00'
            }
          }
        }
      }
    }
  ]
}))
const durationOption = computed(() => ({
  grid: {
    top: 130,
    left: 50,
    right: 50,
    bottom: 50
  },
  title: [
    {
      left: 'center',
      text: '实时请求耗时'
    }
  ],
  legend: {
    top: 50,
    data: ['总耗时', '域名解析耗时', 'TCP连接耗时', '数据解析耗时', 'TLS连接耗时', '传输耗时']
  },
  tooltip: {
    trigger: 'axis',
    formatter: function (params: Record<string, any>) {
      let relVal = params[0].name
      for (let i = 0, l = params.length; i < l; i++) {
        relVal += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + params[i].value + '毫秒'
      }
      return relVal
    }
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: requestConsumingTime.value
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      type: 'line',
      name: '总耗时',
      showSymbol: false,
      data: requestConsumingObj.value.total
    },
    {
      type: 'line',
      name: 'TCP连接耗时',
      showSymbol: false,
      data: requestConsumingObj.value.connect
    },
    {
      type: 'line',
      name: 'dns解析耗时',
      showSymbol: false,
      data: requestConsumingObj.value.processing
    },
    {
      type: 'line',
      name: '数据解析耗时',
      showSymbol: false,
      data: requestConsumingObj.value.resolve
    },
    {
      type: 'line',
      name: 'TLS连接耗时',
      showSymbol: false,
      data: requestConsumingObj.value.tls
    },
    {
      type: 'line',
      name: '传输耗时',
      showSymbol: false,
      data: requestConsumingObj.value.transfer
    }
  ]
}))
const calcNums = (arr: [], status: string) => {
  arr.forEach(ele => {
    if (ele[1] === status) {
      statusNormalTimes++
    } else {
      statusExceptionsTimes++
    }
  })
}
const getWebMonitoringData = (id: string) => {
  monitor.monitor.getMonitorWebsiteQuery({ query: { query: 'http_status_code', detection_point_id: id }, path: { id: taskId } }).then((res) => {
    res.data[0].values.forEach((item: Array<string | number>) => {
      const formattedString = date.formatDate(Number(item[0]) * 1000, 'HH:mm:ss')
      statusMonitorTime.value.push(formattedString)
      statusCodeMonitor.value.push(item[1])
    })
  }).catch((error) => {
    console.log(error)
  })
  monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'http_status_code', start: Number(yesterdayTimeStamp), detection_point_id: id }, path: { id: taskId } }).then((res) => {
    calcNums(res.data[0].values, '200')
    statusPieData.value = [statusNormalTimes, statusExceptionsTimes]
  }).catch((error) => {
    console.log(error)
  })
  monitor.monitor.getMonitorWebsiteQuery({ query: { query: 'duration_seconds', detection_point_id: id }, path: { id: taskId } }).then((res) => {
    const arr: string[] = []
    res.data[0].values.forEach((item: [number, string]) => {
      const formattedString = date.formatDate(Number(item[0]) * 1000, 'HH:mm:ss')
      requestConsumingTime.value.push(formattedString)
      arr.push((Number(item[1]) * 1000).toFixed(2))
    })
    requestConsumingObj.value.total = arr
  }).catch((error) => {
    console.log(error)
  })
  monitor.monitor.getMonitorWebsiteQuery({ query: { query: 'http_duration_seconds', detection_point_id: id }, path: { id: taskId } }).then((res) => {
    res.data.forEach((types: RequestConsumingInterface) => {
      const arr: string[] = []
      types.values.forEach((item: Array<string | number>) => {
        arr.push((Number(item[1]) * 1000).toFixed(2))
      })
      requestConsumingObj.value[types.metric.phase] = arr
    })
  }).catch((error) => {
    console.log(error)
  })
}
const refreshData = () => {
  statusMonitorTime.value = []
  statusCodeMonitor.value = []
  statusNormalTimes = 0
  statusExceptionsTimes = 0
  requestConsumingTime.value = []
  requestConsumingObj.value = {}
  getWebMonitoringData(pointId.value.value)
}
const goBack = () => {
  router.go(-1)
}
let timer = setInterval(() => {
  refreshData()
}, filterSelection.value.value * 1000)
watch(filterSelection, () => {
  clearInterval(Number(timer))
  timer = setInterval(() => {
    refreshData()
  }, filterSelection.value.value * 1000)
})
watch(detectionPoints, () => {
  if (detectionPoints.value.length > 0) {
    pointId.value = detectionPoints.value[0]
    getWebMonitoringData(pointId.value.value)
  }
})
onMounted(() => {
  if (detectionPoints.value.length > 0) {
    pointId.value = detectionPoints.value[0]
    getWebMonitoringData(pointId.value.value)
  }
})
onUnmounted(() => {
  clearInterval(Number(timer))
})
</script>

<template>
  <div class="WebMonitorTaskDetail">
    <div class="row title-area">
      <div class="col">
        <q-btn icon="arrow_back_ios" color="primary" flat unelevated dense
               @click="goBack"/>
        {{ tc('网站监控详情') }}
      </div>
    </div>
    <div class="row justify-end">
      <q-select class="col-3 q-mr-sm" outlined dense v-model="pointId" :options="detectionPoints" @update:model-value="refreshData" :label="tc('选择监控站点')" :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'"/>
      <q-select class="col-3" outlined dense v-model="filterSelection"
                :options="filterOptions"
                :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'" :label="tc('刷新时间')"/>
    </div>
    <div class="row q-mt-xl">
      <div class="col-12">
        <q-card flat bordered class="no-border-radius">
          <web-monitor-status-line :option="statusOption"/>
        </q-card>
      </div>
      <div class="col-6 q-mt-md">
        <q-card flat bordered class="no-border-radius">
        <pie-chart :chart-data="statusPieData"></pie-chart>
        </q-card>
      </div>
      <div class="col-12 q-mt-md">
        <q-card flat bordered class="no-border-radius">
          <web-monitor-duration-line :option="durationOption"/>
        </q-card>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

.title-area {
  width: 1230px;
  text-align: left;
  color: $primary;
  font-size: large;
  font-weight: bold;
}
</style>
