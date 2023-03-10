<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
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
  total: string[]
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
const requestConsumingObj = ref<RequestConsumingInterface>({
  total: []
})
let statusNormalTimes = 0
let statusExceptionsTimes = 0
const day = new Date()
const yesterdayTime = String(day.getFullYear()) + '/' + String(day.getMonth() + 1) + '/' + String(day.getDate() - 1) + ' 24:0:0'
const yesterdayTimeStamp = date.formatDate(yesterdayTime, 'X')
// const arr = ref([
//   '200', '400', '200', '200', '200', '401', '200', '200', '403', '200', '200', '404', '200', '200', '200', '200', '500', '200', '200', '200'
// ])
const pointId = ref({
  label: '',
  labelEn: '',
  value: ''
})
const option = computed(() => ({
  grid: {
    left: 50,
    right: 50,
    bottom: 50
  },
  title: {
    text: '近5分钟实时状态',
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
const option1 = computed(() => ({
  grid: {
    left: 50,
    right: 50,
    bottom: 50
  },
  title: [
    {
      left: 'center',
      text: 'Gradient along the y axis'
    }
  ],
  tooltip: {
    trigger: 'axis'
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
      name: 'Direct',
      showSymbol: false,
      data: requestConsumingObj.value.total
    }
    // {
    //   type: 'line',
    //   name: 'Direct1',
    //   showSymbol: false,
    //   data: valueList1
    // }
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
const getWebMonitoringData = async (id: string) => {
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
    res.data[0].values.forEach((item: [number, string]) => {
      const formattedString = date.formatDate(Number(item[0]) * 1000, 'HH:mm:ss')
      requestConsumingTime.value.push(formattedString)
      requestConsumingObj.value.total.push((Number(item[1]) * 1000).toFixed(2))
    })
  }).catch((error) => {
    console.log(error)
  })
}
const selectPoint = () => {
  statusMonitorTime.value = []
  statusCodeMonitor.value = []
  statusNormalTimes = 0
  statusExceptionsTimes = 0
  getWebMonitoringData(pointId.value.value)
}
const goBack = () => {
  router.go(-1)
}
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
      <q-select class="col-3" outlined dense v-model="pointId" :options="detectionPoints" @update:model-value="selectPoint" :label="tc('选择监控站点')" :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'"/>
    </div>
    <div class="row q-mt-xl justify-between">
      <div class="col-12">
        <q-card flat bordered class="no-border-radius">
          <web-monitor-status-line :option="option"/>
        </q-card>
      </div>
      <div class="col-6 q-mt-xl">
        <q-card flat bordered class="no-border-radius">
        <pie-chart :chart-data="statusPieData"></pie-chart>
        </q-card>
      </div>
      <div class="col-12 q-mt-xl">
        <q-card flat bordered class="no-border-radius">
          <web-monitor-duration-line :option="option1"/>
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
