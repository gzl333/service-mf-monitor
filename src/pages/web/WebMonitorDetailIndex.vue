<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { useRoute, useRouter } from 'vue-router'
import monitor from 'src/api/monitor'
import { i18n } from 'boot/i18n'
import { date, Notify } from 'quasar'
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
    receive_replica: 1
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
const startTimeStamp = Math.round(nowTime / 1000 - 1800)
const durationTotalArr: {[key: string]: [number, string][]} = {}
const xAxis = ref<string[]>([])
const chartSeries = ref<Record<string, unknown>[]>([])
const statusObj = ref<Record<string, any>>({})
const lastTimeStamp = ref()
const renovateTime = ref(60)
const isNewCreate = ref(true)
const isHaveChange = ref(false)
const tab = ref('recent')
const chartStatus = ref<'wait' | 'normal' | 'error'>('wait')
// 存在x轴时间戳数组
const xTimeStamp: number[] = []
const normalColor = ['#8085e9', '#a5c2d5', '#73C0DE', '#8AC070', '#5470C6']
const errorColor = ['#EE6666', '#FD7F55', '#c12c44', '#FFC936', '#FEA147']
const getWebMonitoringData = async (detectId: string, name: string, start: number, step:number, index: number) => {
  // 先请求获取状态码，再去请求获取耗时，因为图表通过正负区分方向，状态码异常时需要 * -1，所以需要先获取状态码之后再去请求耗时
  // 一次请求数据时间段为十分钟
  const statusResp = await monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'http_status_code', start, detection_point_id: detectId, step }, path: { id: taskId } })
  if (statusResp.data.length > 0 && statusResp.data.findIndex((item: WebMonitorInterface) => item.metric.monitor === 'example') === -1) {
    if (statusResp.status === 200) {
      // 存放状态元组
      const seriesData: [number, string][] = []
      // 存在x轴时间数据数组
      const xTime: string[] = []
      statusResp.data.forEach((status: WebMonitorInterface, index: number) => {
        status.values.forEach((item: [number, string]) => {
          // 时间数据只存储一次，避免多次存储
          if (index === 0) {
            // 时间戳转化为HH:mm:ss格式
            if (step === 60) {
              const formattedString = date.formatDate(item[0] * 1000, 'HH:mm:ss')
              xTime.push(formattedString)
            } else {
              const formattedString = date.formatDate(item[0] * 1000, 'MM-DD HH:mm')
              xTime.push(formattedString)
            }
            xTimeStamp.push(item[0])
          }
          seriesData.push(item)
        })
      })
      statusObj.value[detectId] = seriesData
      xAxis.value = xTime
      // lastTimeStamp为x轴最后一次时间，用于计算下一次刷新的时间
      lastTimeStamp.value = xTimeStamp[xTimeStamp.length - 1]
    }
    const durationTotalResp = await monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'duration_seconds', start, detection_point_id: detectId, step }, path: { id: taskId } })
    if (durationTotalResp.status === 200 && durationTotalResp.data.length > 0) {
      durationTotalArr[detectId] = durationTotalResp.data[0].values
    }
    const durationResp = await monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'http_duration_seconds', start, detection_point_id: detectId, step }, path: { id: taskId } })
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
                  position: duration.metric.phase === 'transfer' ? 'top' : duration.metric.phase === 'tls' ? 'inside' : 'bottom',
                  // 自定义顶部文字写判断
                  formatter: function (val: Record<string, any>) {
                    // transfer为最顶部一段柱状图，echarts label不能控制单独某一段，只能控制一个整体
                    // connect为底部一段柱状图
                    // 其他区间的柱状图label返回空
                    if (val.seriesId.indexOf('transfer') !== -1) {
                      return (Number(durationTotalArr[detectId][val.dataIndex][1]) * 1000).toFixed(2)
                    } else if (val.seriesId.indexOf('connect') !== -1) {
                      if (val.seriesIndex === 0) {
                        return `${val.seriesIndex + 1}`
                      } else if (val.seriesIndex > 0 && val.seriesIndex % 5 === 0) {
                        // seriesIndex为按照顺序叠加的每一段柱状图的索引，每个整体为5段，所以seriesIndex为5的倍数，用于判断第几个探针
                        return `${val.seriesIndex / 5 + 1}`
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
                color: function (val: Record<string, any>) {
                  if (val.value > 0) {
                    return normalColor[durationIndex]
                  } else {
                    return errorColor[durationIndex]
                  }
                }
              }
            },
            data: durationSeriesData
          }
        )
      })
      if (isNewCreate.value === true) {
        isNewCreate.value = false
        chartStatus.value = 'normal'
      } else {
        chartStatus.value = 'normal'
      }
    }
  } else if (statusResp.data.length > 0 && statusResp.data.findIndex((item: WebMonitorInterface) => item.metric.monitor === 'example') !== -1) {
    chartStatus.value = 'error'
  } else if (statusResp.data.length === 0) {
    chartStatus.value = 'wait'
  }
}
// 每一分钟刷新获取数据方法
const getWebMonitoringLastData = async (id: string, name: string, start: number) => {
  const statusResp = await monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'http_status_code', start, detection_point_id: id, step: 60 }, path: { id: taskId } })
  if (statusResp.status === 200) {
    if (statusResp.data[0].values[statusResp.data[0].values.length - 1][0] !== xTimeStamp[xTimeStamp.length - 1]) {
      isHaveChange.value = true
      xTimeStamp.shift()
      xTimeStamp.push(statusResp.data[0].values[statusResp.data[0].values.length - 1][0])
      // 将数组中最早时间第一个值删除，向数组最后添加最新时刻的数据
      if (statusObj.value[id] && statusObj.value[id].length >= 30) {
        statusObj.value[id].shift()
      }
      if (statusObj.value[id]) {
        statusObj.value[id].push(statusResp.data[0].values[statusResp.data[0].values.length - 1])
      } else {
        statusObj.value[id] = statusResp.data[0].values[statusResp.data[0].values.length - 1]
      }
      lastTimeStamp.value = statusResp.data[0].values[statusResp.data[0].values.length - 1][0]
    }
  }
  if (isHaveChange.value) {
    const durationTotalResp = await monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'duration_seconds', start, detection_point_id: id, step: 60 }, path: { id: taskId } })
    if (durationTotalResp.status === 200) {
      if (durationTotalArr[id]) {
        if (durationTotalArr[id].length >= 30) {
          durationTotalArr[id].shift()
        }
        durationTotalArr[id].push(durationTotalResp.data[0].values[durationTotalResp.data[0].values.length - 1])
      } else {
        durationTotalArr[id] = durationTotalResp.data[0].values[durationTotalResp.data[0].values.length - 1]
      }
    }
    const durationResp = await monitor.monitor.getMonitorWebsiteQueryRange({ query: { query: 'http_duration_seconds', start, detection_point_id: id, step: 60 }, path: { id: taskId } })
    if (durationResp.status === 200) {
      chartSeries.value.forEach((bar: Record<string, any>) => {
        // 根据探针名找到该探针的图表数据
        if (bar.name.indexOf(name) !== -1) {
          if (bar.data.length >= 30) {
            bar.data.shift()
          }
          durationResp.data.forEach((duration: WebMonitorInterface) => {
            // 判断是哪个阶段耗时，替换数据
            if (duration.metric.phase === bar.id.slice(bar.id.lastIndexOf('-') + 1, bar.id.length)) {
              // 刷新时因为存在时间误差，后端可能返回一个值或两个值
              if (statusObj.value[id][statusObj.value[id].length - 1][1] === '200') {
                bar.data.push((Number(duration.values[duration.values.length - 1][1]) * 1000).toFixed(2))
              } else {
                bar.data.push((Number(duration.values[duration.values.length - 1][1]) * -1000).toFixed(2))
              }
            }
          })
        }
      })
    }
  }
}
const refreshData = async () => {
  isHaveChange.value = false
  const formattedString = date.formatDate((lastTimeStamp.value + 60) * 1000, 'HH:mm:ss')
  for (const detect of detectionPoints.value) {
    await getWebMonitoringLastData(detect.value, detect.label, lastTimeStamp.value)
  }
  if (isHaveChange.value) {
    // 动态删除添加x轴的值
    if (xAxis.value.length >= 30) {
      xAxis.value.shift()
    }
    xAxis.value.push(formattedString)
    clearInterval(Number(dynamicRefreshTimer))
    dynamicRefreshTimer = setInterval(() => {
      if (!isNewCreate.value) {
        refreshData()
      }
    }, 60000)
    renovateTime.value = 60
  } else {
    Notify.create({
      message: tc('已是最新数据'),
      color: 'secondary',
      position: 'bottom',
      timeout: 3000,
      multiLine: false
    })
  }
}
const refreshAll = async (time: number, step: number) => {
  detectionPoints.value.forEach((item, index) => {
    getWebMonitoringData(item.value, item.label, time, step, index)
  })
}
const changeChatTab = (val: string) => {
  clearInterval(Number(dynamicRefreshTimer))
  clearInterval(Number(countDownTimer))
  xAxis.value = []
  chartSeries.value = []
  const nowTime = new Date().getTime()
  if (val === 'recent') {
    const startTime = Math.round(nowTime / 1000 - 1800)
    refreshAll(startTime, 60)
  } else if (val === 'day') {
    const startTime = Math.round(nowTime / 1000 - 86400)
    const step = 2880
    refreshAll(startTime, step)
  } else if (val === 'week') {
    const startTime = Math.round(nowTime / 1000 - 604800)
    const step = 20160
    refreshAll(startTime, step)
  } else {
    const startTime = Math.round(nowTime / 1000 - 2592000)
    const step = 86400
    refreshAll(startTime, step)
  }
  renovateTime.value = 60
  countDownTimer = setInterval(() => {
    if (renovateTime.value > 0) {
      renovateTime.value--
    }
  }, 1000)
  dynamicRefreshTimer = setInterval(() => {
    refreshData()
  }, 60000)
}
let dynamicRefreshTimer: NodeJS.Timer | null
let countDownTimer: NodeJS.Timer | null
const goBack = () => {
  router.go(-1)
}
const firstRefreshTimer = setTimeout(() => {
  if (isNewCreate.value) {
    const startTime = Math.round(nowTime / 1000 - 1800)
    refreshAll(startTime, 60)
  }
}, 90000)
watch(isNewCreate, () => {
  if (!isNewCreate.value) {
    countDownTimer = setInterval(() => {
      if (renovateTime.value > 0) {
        renovateTime.value--
      }
    }, 1000)
    dynamicRefreshTimer = setInterval(() => {
      refreshData()
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
      getWebMonitoringData(item.value, item.label, startTimeStamp, 60, index)
    })
  }
})
onMounted(() => {
  if (detectionPoints.value.length > 0) {
    detectionPoints.value.forEach((item, index) => {
      getWebMonitoringData(item.value, item.label, startTimeStamp, 60, index)
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
    <div class="row justify-center">
      <div class="text-h6">
        <div>
          <span>{{ tc('监控任务名称') }}：</span>
          <span class="text-primary">{{ store.tables.webMonitorTable.byId[taskId]?.name }}</span>
        </div>
        <div>
          <span>{{ tc('监控任务url') }}：</span>
          <span class="text-primary">{{ store.tables.webMonitorTable.byId[taskId]?.url }}</span>
        </div>
        <div>
          <span>{{ tc('备注') }}：</span>
          <span class="text-primary">{{ store.tables.webMonitorTable.byId[taskId]?.remark === '' ? tc('暂无备注') : store.tables.webMonitorTable.byId[taskId]?.remark }}</span>
        </div>
      </div>
    </div>
    <div class="row justify-between items-center">
      <div>
        <div v-for="(item, index) in detectionPoints" :key="item.value">{{ `${tc('探针')}${index + 1}：${ i18n.global.locale === 'zh' ? item.label : item.labelEn}` }}</div>
      </div>
      <div class="row items-center" v-if="!isNewCreate">
        <div class="text-grey-7">{{ tc('剩余更新新时间') }}</div>
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
        <q-btn flat no-caps color="primary" :label="tc('更新数据')" @click="refreshData"/>
      </div>
      <div v-else>{{ tc('请稍后，等待刷新中') }}</div>
    </div>
    <div>
      <div class="col-auto">
        <q-tabs
            class="col-auto"
            v-model="tab"
            active-color="primary"
            align="left"
            inline-label
            @update:model-value="changeChatTab"
          >
            <q-tab class="q-px-none q-py-none q-mr-md"
                   no-caps
                   :ripple="false"
                   name="recent"
                   icon="las la-clock"
                   :label="tc('最近实时数据')"/>
            <q-tab class="q-px-none q-py-none q-mr-md"
                   no-caps
                   :ripple="false"
                   name="day"
                   icon="las la-calendar-check"
                   :label="tc('最近一天数据')"/>
            <q-tab class="q-px-none q-py-none q-mr-md"
                   no-caps
                   :ripple="false"
                   name="week"
                   icon="las la-clipboard-list"
                   :label="tc('最近一周数据')"/>
            <q-tab class="q-px-none q-py-none q-mr-md"
                   no-caps
                   :ripple="false"
                   name="month"
                   icon="las la-calendar"
                   :label="tc('最近一个月数据')"/>
          </q-tabs>
        <q-separator/>
      </div>
      <div>
        <q-tab-panels v-model="tab">
          <q-tab-panel class="q-pa-none overflow-hidden" name="recent">
            <div class="row q-mt-lg">
              <div class="col-12">
                <q-card flat bordered class="no-border-radius">
                  <web-histogram-line-chart :status-obj="statusObj" :x-axis-time="xAxis" :chart-series="chartSeries" :status="chartStatus"/>
                </q-card>
              </div>
            </div>
          </q-tab-panel>
          <q-tab-panel class="q-pa-none overflow-hidden" name="day">
            <div class="row q-mt-lg">
              <div class="col-12">
                <q-card flat bordered class="no-border-radius">
                  <web-histogram-line-chart :status-obj="statusObj" :x-axis-time="xAxis" :chart-series="chartSeries" :status="chartStatus"/>
                </q-card>
              </div>
            </div>
          </q-tab-panel>
          <q-tab-panel class="q-pa-none overflow-hidden" name="week">
            <div class="row q-mt-lg">
              <div class="col-12">
                <q-card flat bordered class="no-border-radius">
                  <web-histogram-line-chart :status-obj="statusObj" :x-axis-time="xAxis" :chart-series="chartSeries" :status="chartStatus"/>
                </q-card>
              </div>
            </div>
          </q-tab-panel>
          <q-tab-panel class="q-pa-none overflow-hidden" name="month">
            <div class="row q-mt-lg">
              <div class="col-12">
                <q-card flat bordered class="no-border-radius">
                  <web-histogram-line-chart :status-obj="statusObj" :x-axis-time="xAxis" :chart-series="chartSeries" :status="chartStatus"/>
                </q-card>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
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
