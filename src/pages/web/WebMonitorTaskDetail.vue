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
    phase?: string
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
const isNewCreate = ref(true)
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
const getWebMonitoringData = async (detectId: string, name: string, start: number, index: number) => {
  // 先请求获取状态码，再去请求获取耗时，因为图表通过正负区分方向，状态码异常时需要 * -1，所以需要先获取状态码之后再去请求耗时
  // 一次请求数据时间段为十分钟
  const statusResp = await monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'http_status_code', start, detection_point_id: detectId, step: 60 }, path: { id: taskId } })
  if (statusResp.status === 200 && statusResp.data.length > 0) {
    // 存放状态元组
    const seriesData: [number, string][] = []
    // 存在x轴时间数据数组
    const xTime: string[] = []
    // 存在x轴时间戳数组
    const xTimeStamp: number[] = []
    statusResp.data.forEach((status: WebMonitorInterface, index: number) => {
      status.values.forEach((item: [number, string]) => {
        // 时间数据只存储一次，避免多次存储
        if (index === 0) {
          // 时间戳转化为HH:mm:ss格式
          const formattedString = date.formatDate(item[0] * 1000, 'HH:mm:ss')
          xTime.push(formattedString)
          xTimeStamp.push(item[0])
        }
        seriesData.push(item)
      })
    })
    statusObj.value[detectId] = seriesData
    xAxis.value = xTime
    // lastTimeStamp为x轴最后一次时间，用于计算下一次刷新的时间
    lastTimeStamp = xTimeStamp[xTimeStamp.length - 1]
  }
  const durationResp = await monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'http_duration_seconds', start: outcome, detection_point_id: detectId, step: 60 }, path: { id: taskId } })
  if (durationResp.status === 200 && durationResp.data.length > 0) {
    // 存放耗时数据数组
    let durationSeriesData: string[] = []
    // 用于给每段柱形添加不同的name，echarts要求多柱形堆加name需不一致
    let stageName = ''
    durationResp.data.forEach((duration: WebMonitorInterface, durationIndex: number) => {
      durationSeriesData = []
      duration.values.forEach((item: [number, string], itemIndex: number) => {
        // 如果状态码异常 需要 * -1
        if (itemIndex < statusObj.value[detectId].length) {
          if (statusObj.value[detectId][itemIndex][1] === '200') {
            durationSeriesData.push((Number(item[1]) * 1000).toFixed(2))
          } else {
            durationSeriesData.push((Number(item[1]) * 1000 * -1).toFixed(2))
          }
        }
      })
      if (duration.metric.phase === 'connect') {
        stageName = 'TCP连接建立耗时'
      } else if (duration.metric.phase === 'processing') {
        stageName = '处理请求耗时'
      } else if (duration.metric.phase === 'resolve') {
        stageName = 'DNS解析耗时'
      } else if (duration.metric.phase === 'tls') {
        stageName = 'TLS连接协商耗时'
      } else {
        stageName = '转移响应耗时'
      }
      // chartSeries为echarts图表数据
      chartSeries.value.push(
        {
          name: name + '-' + stageName,
          id: detectId + '-' + duration.metric.phase,
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
                  // transfer为最顶部一段柱状图，echarts label不能控制单独某一段，只能控制一个整体
                  // connect为底部一段柱状图
                  // 其他区间的柱状图label返回空
                  if (val.seriesId.indexOf('transfer') !== -1) {
                    // seriesId为每个柱状图的id
                    const index = val.seriesId.lastIndexOf('-')
                    // 从柱状图id中截取出来探针id
                    const str = val.seriesId.slice(0, index)
                    // 从statusObj中获取状态码
                    let status
                    if (val.dataIndex < statusObj.value[str].length) {
                      status = statusObj.value[str][val.dataIndex][1]
                    }
                    if (status === '200') {
                      return '{a|' + status + '}'
                    } else {
                      return '{b|' + status + '}'
                    }
                  } else if (val.seriesId.indexOf('connect') !== -1) {
                    if (val.seriesIndex === 0) {
                      return `探针${val.seriesIndex + 1}`
                    } else if (val.seriesIndex > 0 && val.seriesIndex % 5 === 0) {
                      // seriesIndex为按照顺序叠加的每一段柱状图的索引，每个整体为5段，所以seriesIndex为5的倍数，用于判断第几个探针
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
              color: color[durationIndex]
            }
          },
          data: durationSeriesData
        }
      )
    })
    if (isNewCreate.value === true) {
      isNewCreate.value = false
    }
  }
}
// 每一分钟刷新获取数据方法
const getWebMonitoringLastData = async (id: string, name: string, start: number) => {
  const statusResp = await monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'http_status_code', start, detection_point_id: id, step: 60 }, path: { id: taskId } })
  if (statusResp.status === 200) {
    // 将数组中最早时间第一个值删除，向数组最后添加最新时刻的数据
    if (statusObj.value[id].length >= 10) {
      statusObj.value[id].shift()
    }
    if (statusResp.data[0].values.length === 1) {
      statusObj.value[id].push(statusResp.data[0].values[0])
    } else {
      statusObj.value[id].push(statusResp.data[0].values[1])
    }
  }
  const durationResp = await monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'http_duration_seconds', start, detection_point_id: id, step: 60 }, path: { id: taskId } })
  if (durationResp.status === 200) {
    chartSeries.value.forEach((bar: Record<string, any>) => {
      // 根据探针名找到该探针的图表数据
      if (bar.name.indexOf(name) !== -1) {
        if (bar.data.length >= 10) {
          bar.data.shift()
        }
        durationResp.data.forEach((duration: WebMonitorInterface) => {
          // 判断是哪个阶段耗时，替换数据
          if (duration.metric.phase === bar.id.slice(bar.id.lastIndexOf('-') + 1, bar.id.length)) {
            // 刷新时因为存在时间误差，后端可能返回一个值或两个值
            if (duration.values.length === 1) {
              bar.data.push((Number(duration.values[0][1]) * 1000).toFixed(2))
            } else {
              bar.data.push((Number(duration.values[1][1]) * 1000).toFixed(2))
            }
          }
        })
      }
    })
  }
}
const refreshData = async () => {
  const formattedString = date.formatDate((lastTimeStamp + 60) * 1000, 'HH:mm:ss')
  // 动态删除添加x轴的值
  if (xAxis.value.length >= 10) {
    xAxis.value.shift()
  }
  xAxis.value.push(formattedString)
  for (const detect of detectionPoints.value) {
    await getWebMonitoringLastData(detect.value, detect.label, lastTimeStamp)
  }
  // 每次刷新时，最新时间需要加上60秒
  lastTimeStamp = lastTimeStamp + 60
}
const refreshAll = () => {
  isNewCreate.value = true
  xAxis.value = []
  chartSeries.value = []
  const nowTime = new Date().getTime()
  const startTime = Math.round(nowTime / 1000 - 600)
  detectionPoints.value.forEach((item, index) => {
    getWebMonitoringData(item.value, item.label, startTime, index)
  })
}
const goBack = () => {
  router.go(-1)
}
// 每一分钟动态刷新一次数据
let dynamicRefreshTimer: NodeJS.Timer | null
// 计算刷新倒计时
let countDownTimer: NodeJS.Timer | null
const firstRefreshTimer = setTimeout(() => {
  if (isNewCreate.value) {
    refreshAll()
  }
}, 80000)
watch(isNewCreate, () => {
  if (!isNewCreate.value) {
    countDownTimer = setInterval(() => {
      if (!isNewCreate.value) {
        // 当前时间戳
        const nowTimeStamp = Math.round(new Date().getTime() / 1000)
        // 存在时间误差
        if (lastTimeStamp + 60 <= nowTimeStamp) {
          renovateTime.value = lastTimeStamp + 120 - nowTimeStamp
        } else {
          renovateTime.value = lastTimeStamp + 60 - nowTimeStamp
        }
      }
    }, 1000)
    dynamicRefreshTimer = setInterval(() => {
      if (!isNewCreate.value) {
        refreshData()
      }
    }, 60000)
  } else {
    clearInterval(Number(dynamicRefreshTimer))
    clearInterval(Number(countDownTimer))
    renovateTime.value = 60
  }
})
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
  clearInterval(Number(dynamicRefreshTimer))
  clearInterval(Number(countDownTimer))
  clearTimeout(firstRefreshTimer)
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
    <div class="row justify-center q-gutter-x-lg">
      <div>监控任务名称：{{ store.tables.webMonitorTable.byId[taskId]?.name }}</div>
      <div>监控任务url：{{ store.tables.webMonitorTable.byId[taskId]?.url }}</div>
      <div>备注：
        <span v-if="store.tables.webMonitorTable.byId[taskId]?.remark !== ''">
          {{ store.tables.webMonitorTable.byId[taskId]?.remark }}
      </span>
        <span v-else>
          暂无备注
        </span>
      </div>
    </div>
    <div class="row justify-between items-center">
      <div>
        <div v-for="(item, index) in detectionPoints" :key="item.value">{{ `探针${index + 1}：${item.label}` }}</div>
      </div>
      <div class="row items-center" v-if="!isNewCreate">
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
        <q-btn flat color="primary" label="刷新" @click="refreshAll"/>
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
