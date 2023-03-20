<script setup lang="ts">
import { computed, ref, onMounted, watch, onUnmounted } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { useRoute, useRouter } from 'vue-router'
import monitor from 'src/api/monitor'
import { i18n } from 'boot/i18n'
import { date } from 'quasar'
import WebHistogramLineChart from 'components/Chart/WebHistogramLineChart.vue'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])
interface WebMonitorInterface {
  metric: {
    group: string
    instance: string
    job: string
    monitor: string
    receive_cluster: string
    receive_replica: string
    tenant_id: string
    url: string
    urlhash: string
    __name__: string
  },
  values: [number, string][]
}
interface WebMonitorDurationInterface {
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
  },
  values: [number, string][]
}
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
const statusObj = ref<Record<string, any>>({})
// const obj1: any = {
//   'a1cfc71a-be4f-11ed-b6f8-c800dfc12405': [
//     [1678948657, '200'],
//     [1678948717, '200'],
//     [1678948777, '404'],
//     [1678948837, '200'],
//     [1678948897, '500'],
//     [1678948957, '200'],
//     [1678949017, '200'],
//     [1678949077, '401'],
//     [1678949137, '200'],
//     [1678949197, '200']
//   ],
//   'cd34c504-be4f-11ed-8273-c800dfc12405': [
//     [1678948657, '200'],
//     [1678948717, '200'],
//     [1678948777, '404'],
//     [1678948837, '200'],
//     [1678948897, '500'],
//     [1678948957, '200'],
//     [1678949017, '200'],
//     [1678949077, '401'],
//     [1678949137, '200'],
//     [1678949197, '200']
//   ]
// }
const color = ['#7cb5ec', '#f7a35c', '#8085e9', '#a5c2d5', '#cbab4f', '#76a871', '#a56f8f', '#c12c44', '#9f7961', '#76a871', '#6f83a5',
  '#0f4fb8', '#106dcf', '#b3d74c', '#74aae3', '#5cdec6', '#3526de', '#9d65ee', '#a8b3e3', '#6bc1b7', '#549ee2', '#6e98d6']
const getWebMonitoringData = async (id: string, name: string, start: number, index: number) => {
  await monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'http_status_code', start, detection_point_id: id, step: 60 }, path: { id: taskId } }).then((resp) => {
    const seriesData: [number, string][] = []
    const xTime: string[] = []
    const xTimeStamp: number[] = []
    resp.data.forEach((item: WebMonitorInterface, index: number) => {
      item.values.forEach((item1: [number, string]) => {
        if (index === 0) {
          const formattedString = date.formatDate(item1[0] * 1000, 'HH:mm:ss')
          xTime.push(formattedString)
          xTimeStamp.push(item1[0])
        }
        seriesData.push(item1)
      })
    })
    statusObj.value[id] = seriesData
    xAxis.value = xTime
    lastTimeStamp = xTimeStamp[xTimeStamp.length - 1]
  }).catch((error) => {
    console.log(error)
  })
  await monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'http_duration_seconds', start: outcome, detection_point_id: id, step: 60 }, path: { id: taskId } }).then((resp) => {
    let durationSeriesData: string[] = []
    let stageName = ''
    resp.data.forEach((item: WebMonitorDurationInterface, index1: number) => {
      durationSeriesData = []
      item.values.forEach((item1: [number, string], index2: number) => {
        if (statusObj.value[id][index2][1] === '200') {
          durationSeriesData.push((Number(item1[1]) * 1000).toFixed(2))
        } else {
          durationSeriesData.push((Number(item1[1]) * 1000 * -1).toFixed(2))
        }
      })
      if (item.metric.phase === 'connect') {
        stageName = 'TCP连接建立耗时'
      } else if (item.metric.phase === 'processing') {
        stageName = '处理请求耗时'
      } else if (item.metric.phase === 'resolve') {
        stageName = 'DNS解析耗时'
      } else if (item.metric.phase === 'tls') {
        stageName = 'TLS连接协商耗时'
      } else {
        stageName = '转移响应耗时'
      }
      chartSeries.value.push(
        {
          name: name + '-' + stageName,
          id: id + '-' + item.metric.phase + index,
          type: 'bar',
          stack: 'bar' + index,
          itemStyle: {
            normal: {
              label: {
                show: true,
                fontSize: 12,
                distance: 10,
                position: 'bottom',
                // 自定义顶部文字写判断
                formatter: function (val: Record<string, any>) {
                  if (val.seriesId.indexOf('transfer') !== -1) {
                    const index = val.seriesId.lastIndexOf('-')
                    const str = val.seriesId.slice(0, index)
                    // return '200' + ' ' + val.dataIndex + ' ' + val.componentIndex + ' ' + val.seriesIndex
                    const status = statusObj.value[str][val.dataIndex][1]
                    if (status === '200') {
                      return '{a|' + status + '}'
                    } else {
                      return '{b|' + status + '}'
                    }
                  } else if (val.seriesId.indexOf('connect') !== -1) {
                    if (val.seriesIndex === 0) {
                      return `探针${val.seriesIndex + 1}`
                    } else if (val.seriesIndex > 0 && val.seriesIndex % 5 === 0) {
                      return `探针${val.seriesIndex / 5 + 1}`
                    }
                  } else {
                    return ''
                  }
                },
                rich: {
                  a: {
                    color: 'green',
                    lineHeight: 10
                  },
                  b: {
                    color: 'red',
                    lineHeight: 10
                  }
                }
              },
              color: color[index1]
            }
          },
          data: durationSeriesData
        }
      )
    })
  }).catch((error) => {
    console.log(error)
  })
}
const getWebMonitoringLastData = async (id: string, name: string, start: number) => {
  await monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'http_status_code', start, detection_point_id: id, step: 60 }, path: { id: taskId } }).then((resp) => {
    statusObj.value[id].shift()
    statusObj.value[id].push(resp.data[0].values[1])
  }).catch((error) => {
    console.log(error)
  })
  await monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'http_duration_seconds', start, detection_point_id: id, step: 60 }, path: { id: taskId } }).then((resp) => {
    chartSeries.value.forEach((item: Record<string, any>) => {
      if (item.name.indexOf(name) !== -1) {
        item.data.shift()
        resp.data.forEach((item1: WebMonitorDurationInterface) => {
          if (item1.metric.phase === item.id.slice(item.id.lastIndexOf('-') + 1, item.id.length - 1)) {
            if (item1.values.length === 1) {
              item.data.push((Number(item1.values[0][1]) * 1000).toFixed(2))
            } else {
              item.data.push((Number(item1.values[1][1]) * 1000).toFixed(2))
            }
          }
        })
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
  if (lastTimeStamp + 60 <= nowTimeStamp) {
    renovateTime.value = lastTimeStamp + 120 - nowTimeStamp
  } else {
    renovateTime.value = lastTimeStamp + 60 - nowTimeStamp
  }
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
    <div class="row justify-between items-center">
      <div>
        <div>当前监控任务url：{{ store.tables.webMonitorTable.byId[taskId]?.url }}</div>
        <div v-for="(item, index) in detectionPoints" :key="item.value">{{ `探针${index + 1}：${item.label}` }}</div>
      </div>
      <div class="row items-center">
        <div class="text-grey-7">剩余刷新时间</div>
        <q-circular-progress
          show-value
          class="text-light-blue q-ma-md"
          :value="renovateTime"
          size="50px"
          max="60"
          color="light-blue"
          track-color="grey-3"
        >
          {{ renovateTime }}s
        </q-circular-progress>
      </div>
    </div>
    <div class="row q-mt-lg">
      <div class="col-12">
        <q-card flat bordered class="no-border-radius">
          <web-histogram-line-chart :x-axis-time="xAxis" :chart-series="chartSeries"/>
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
