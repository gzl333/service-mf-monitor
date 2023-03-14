<script setup lang="ts">
import { computed, ref, onMounted, watch, onUnmounted } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { useRoute, useRouter } from 'vue-router'
import monitor from 'src/api/monitor'
import { i18n } from 'boot/i18n'
import { date } from 'quasar'
// import PieChart from 'components/Chart/WebMonitorStatusPieChart.vue'
import HistogramChart from 'components/Chart/HistogramChart.vue'
// import WebMonitorStatusLine from 'components/Chart/WebMonitorStatusLine.vue'
// import WebMonitorDurationLine from 'components/Chart/WebMonitorDurationLine.vue'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])
// interface RequestConsumingInterface {
//   metric: {
//     group: string
//     instance: string
//     job: string
//     monitor: string
//     phase: string
//     receive_cluster: string
//     receive_replica: string
//     tenant_id: string
//     url: string
//     urlhash: string
//     __name__: string
//   }
//   values: Array<string | number>[]
// }
const store = useStore()
const route = useRoute()
const router = useRouter()
const { tc } = i18n.global
const detectionPoints = computed(() => store.getDetectionPointTable())
const taskId = route.params.webMonitorTaskId as string
const nowTime = new Date().getTime()
const outcome = Math.round(nowTime / 1000 - 600)
const xAxis = ref<string[]>([])
const chartSeries = ref<Record<string, unknown>[]>([])
let lastTimeStamp: number
const renovateTime = ref(60)
const color = ['#7cb5ec', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1', '#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4', '#D47F00', '#00FFFF', '#D4FF55', '#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE', '#DB843D', '#92A8CD', '#A47D7C', '#7FBF55',
  '#a5c2d5', '#cbab4f', '#76a871', '#a56f8f', '#c12c44', '#9f7961', '#76a871', '#6f83a5', '#0f4fb8', '#106dcf', '#b3d74c', '#74aae3', '#5cdec6', '#3526de', '#9d65ee', '#a8b3e3', '#6bc1b7', '#549ee2', '#6e98d6']
// const statusPieData = ref<Array<number>>([])
// let statusNormalTimes = 0
// let statusExceptionsTimes = 0
// const day = new Date()
// const yesterdayTime = String(day.getFullYear()) + '/' + String(day.getMonth() + 1) + '/' + String(day.getDate() - 1) + ' 24:0:0'
// const yesterdayTimeStamp = date.formatDate(yesterdayTime, 'X')
// const calcNums = (arr: [], status: string) => {
//   arr.forEach(ele => {
//     if (ele[1] === status) {
//       statusNormalTimes++
//     } else {
//       statusExceptionsTimes++
//     }
//   })
// }
// const arr1 = [200, 200, -401, -402, -403, -404, -500, -501, 200, 200]
const getWebMonitoringData = (id: string, name: string, start: number, index: number) => {
  monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'http_status_code', start, detection_point_id: id, step: 60 }, path: { id: taskId } }).then((resp) => {
    const seriesData: number[] = []
    const xTime: string[] = []
    resp.data[0].values.forEach((item: [number, string]) => {
      const formattedString = date.formatDate(Number(item[0]) * 1000, 'HH:mm:ss')
      xTime.push(formattedString)
      if (item[1] === '200') {
        seriesData.push(Number(item[1]))
      } else {
        seriesData.push(Number(item[1]) * -1)
      }
    })
    // seriesData = arr1
    lastTimeStamp = resp.data[0].values[resp.data[0].values.length - 1][0]
    xAxis.value = xTime
    chartSeries.value.push(
      {
        name: name + '-状态码',
        type: 'bar',
        yAxisIndex: 1,
        itemStyle: {
          normal: {
            borderWidth: 2,
            borderColor: color[index],
            color: function (params: Record<string, any>) { // 根据数值大小设置相关颜色
              if (params.value === 200) {
                return 'rgb(145, 204, 117)'
              } else {
                return 'rgb(238, 102, 102)'
              }
            }
          }
        },
        data: seriesData
      }
    )
  }).catch((error) => {
    console.log(error)
  })
  monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'duration_seconds', start: outcome, detection_point_id: id, step: 60 }, path: { id: taskId } }).then((resp) => {
    const durationSeriesData: string[] = []
    resp.data[0].values.forEach((item: [number, string]) => {
      durationSeriesData.push((Number(item[1]) * 1000).toFixed(2))
    })
    chartSeries.value.push(
      {
        name: name + '-请求耗时',
        type: 'line',
        data: durationSeriesData,
        lineStyle: {
          color: color[index]
        },
        itemStyle: {
          color: color[index]
        }
      }
    )
  }).catch((error) => {
    console.log(error)
  })
  // monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'http_status_code', start: Number(yesterdayTimeStamp), detection_point_id: id }, path: { id: taskId } }).then((res) => {
  //   calcNums(res.data[0].values, '200')
  //   statusPieData.value = [statusNormalTimes, statusExceptionsTimes]
  // }).catch((error) => {
  //   console.log(error)
  // })
}
const getWebMonitoringLastData = (id: string, name: string, start: number) => {
  monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'http_status_code', start, detection_point_id: id, step: 60 }, path: { id: taskId } }).then((resp) => {
    chartSeries.value.forEach((item: Record<string, any>) => {
      if (item.name.indexOf(name) !== -1 && item.type === 'bar') {
        item.data.shift()
        item.data.push(Number(resp.data[0].values[1][1]))
      }
    })
  }).catch((error) => {
    console.log(error)
  })
  monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'duration_seconds', start, detection_point_id: id, step: 60 }, path: { id: taskId } }).then((resp) => {
    chartSeries.value.forEach((item: Record<string, any>) => {
      if (item.name.indexOf(name) !== -1 && item.type === 'line') {
        item.data.shift()
        item.data.push(resp.data[0].values[1][1] * 1000)
      }
    })
  }).catch((error) => {
    console.log(error)
  })
}
const refreshData = () => {
  lastTimeStamp = lastTimeStamp + 60
  const formattedString = date.formatDate(lastTimeStamp * 1000, 'HH:mm:ss')
  xAxis.value.shift()
  xAxis.value.push(formattedString)
  detectionPoints.value.forEach(item => {
    getWebMonitoringLastData(item.value, item.label, lastTimeStamp - 60)
  })
}
const goBack = () => {
  router.go(-1)
}
const timer = setInterval(() => {
  refreshData()
}, 60000)
const countDown = setInterval(() => {
  const nowTimeStamp = Math.round(new Date().getTime() / 1000)
  renovateTime.value = lastTimeStamp + 60 - nowTimeStamp
}, 1000)
watch(detectionPoints, () => {
  if (detectionPoints.value.length > 0) {
    detectionPoints.value.forEach((item, index) => {
      getWebMonitoringData(item.value, item.label, outcome, index)
    })
  }
})
onMounted(() => {
  if (detectionPoints.value.length > 0) {
    detectionPoints.value.forEach((item, index) => {
      getWebMonitoringData(item.value, item.label, outcome, index)
    })
  }
})
onUnmounted(() => {
  clearInterval(timer)
  clearInterval(countDown)
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
    <div class="row justify-end items-center">
      <div class="text-grey-7">剩余刷新时间</div>
      <q-circular-progress
        show-value
        class="text-light-blue q-ma-md"
        :value="renovateTime"
        max="60"
        size="50px"
        color="light-blue"
      />
    </div>
    <div class="row q-mt-lg">
      <div class="col-12">
        <q-card flat bordered class="no-border-radius">
          <histogram-chart :x-axis-time="xAxis" :chart-series="chartSeries"/>
        </q-card>
      </div>
<!--      <div class="col-6 q-mt-md">-->
<!--        <q-card flat bordered class="no-border-radius">-->
<!--        <pie-chart :chart-data="statusPieData"></pie-chart>-->
<!--        </q-card>-->
<!--      </div>-->
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
