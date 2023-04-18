<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent
} from 'echarts/components'
import { BarChart, LineChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  BarChart,
  LineChart,
  CanvasRenderer,
  UniversalTransition
])
import { i18n } from 'boot/i18n'
const props = defineProps({
  statusObj: {
    type: Object,
    required: true
  },
  xAxisTime: {
    type: Array,
    required: true
  },
  chartSeries: {
    type: Array,
    required: true
  },
  status: {
    type: String,
    required: true
  }
})
const container = ref<HTMLElement>()
const { tc } = i18n.global
onMounted(() => {
  const chart = echarts.init(container.value!)
  const option = computed(() => ({
    title: {
      text: tc('实时网站监控汇总图'),
      left: 'center'
    },
    grid: {
      top: 120,
      left: 85,
      right: 50,
      bottom: 70
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#283b56'
        }
      },
      formatter: function (params: Record<string, any>) {
        const date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const today = year + '-' + month + '-' + day
        const totalArr = []
        let num = 0
        for (let i = 0, l = params.length; i < l; i++) {
          if (params[i].value !== '' && params[i].value > 1) {
            if ((i + 1) % 5 === 0) {
              num += Number(params[i].value)
              totalArr.push(num.toFixed(2))
              num = 0
            } else {
              num += Number(params[i].value)
            }
          } else if (params[i].value !== '' && params[i].value < 1) {
            if (params.length > 1) {
              if ((i + 1) % 5 === 0) {
                num += params[i].value * 100000
                totalArr.push(num)
                num = 0
              } else {
                num += params[i].value * 100000
              }
            } else {
              totalArr.push(params[i].value * 100000)
            }
          }
        }
        let relVal
        if (params[0].seriesName.indexOf('recent') !== -1) {
          relVal = today + ' ' + params[0].name
        } else {
          relVal = year + '-' + params[0].name
        }
        for (let i = 0, l = params.length; i < l; i++) {
          if (params[i].value !== '' && params[i].value > 1) {
            if (i >= 0 && i % 5 === 0) {
              const dId = params[i].seriesId.slice(0, params[i].seriesId.lastIndexOf('-'))
              relVal += `<br/>${params[i].seriesName.slice(0, params[i].seriesName.indexOf('-'))}<span class="text-primary text-weight-bold"> ${tc('状态码') + ':' +
              props.statusObj[dId][params[i].dataIndex][1] + ' ' + tc('总耗时') + (Number(totalArr[i / 5]) / 100).toFixed(2) + tc('毫秒')}</span><br/>
              ${params[i].marker + params[i].seriesName.slice(params[i].seriesName.indexOf('-') + 1)}：${(params[i].value / 100).toFixed(2) + tc('毫秒')}`
            } else {
              if ((i + 1) % 5 === 0) {
                relVal += '<br/>' + params[i].marker + params[i].seriesName.slice(params[i].seriesName.indexOf('-') + 1) + ' : ' + (params[i].value / 100).toFixed(2) + tc('毫秒') +
                    '<br/>' + '<hr/>'
              } else {
                relVal += '<br/>' + params[i].marker + params[i].seriesName.slice(params[i].seriesName.indexOf('-') + 1) + ' : ' + (params[i].value / 100).toFixed(2) + tc('毫秒')
              }
            }
          } else if (params[i].value !== '' && params[i].value < 1) {
            if (i >= 0 && i % 5 === 0) {
              const dId = params[i].seriesId.slice(0, params[i].seriesId.lastIndexOf('-'))
              relVal += `<br/>${params[i].seriesName.slice(0, params[i].seriesName.indexOf('-'))}<span class="text-primary text-weight-bold"> ${tc('状态码') + ':' +
              props.statusObj[dId][params[i].dataIndex][1] + ' ' + tc('总耗时') + Number(totalArr[i / 5]).toFixed(2) + tc('毫秒')}</span><br/>
              ${params[i].marker + params[i].seriesName.slice(params[i].seriesName.indexOf('-') + 1)}：${(params[i].value * 100000).toFixed(2) + tc('毫秒')}`
            } else {
              if ((i + 1) % 5 === 0) {
                relVal += '<br/>' + params[i].marker + params[i].seriesName.slice(params[i].seriesName.indexOf('-') + 1) + ' : ' + (params[i].value * 100000).toFixed(2) + tc('毫秒') +
                  '<br/>' + '<hr/>'
              } else {
                relVal += '<br/>' + params[i].marker + params[i].seriesName.slice(params[i].seriesName.indexOf('-') + 1) + ' : ' + (params[i].value * 100000).toFixed(2) + tc('毫秒')
              }
            }
            // const dId = params[i].seriesId.slice(0, params[i].seriesId.lastIndexOf('-'))
            // relVal += `<br/>${params[i].seriesName.slice(0, params[i].seriesName.indexOf('-'))}<span class="text-primary text-weight-bold"> ${tc('状态码') + ':' +
            // props.statusObj[dId][params[i].dataIndex][1] + ' ' + tc('总耗时') + totalArr[i] + tc('毫秒')}</span><br/>
            //   ${params[i].marker + params[i].seriesName.slice(params[i].seriesName.indexOf('-') + 1)}：${(params[i].value * 100000).toFixed(2) + tc('毫秒')}`
          }
        }
        return relVal
      }
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: true,
        offset: 20,
        data: props.xAxisTime
      }
    ],
    yAxis: [
      {
        type: 'log',
        name: tc('请求耗时'),
        scale: true,
        logBase: 10,
        max: 1000000,
        boundaryGap: [0.2, 0.2],
        splitLine: {
          show: false
        },
        axisLine: {
          show: true
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          formatter: function (value: number) {
            if (value > 1) {
              if (value / 100 > 1) {
                return value / 100 + '毫秒'
              } else if (value / 100 === 1) {
                return '1毫秒'
              } else {
                return '0.5毫秒'
              }
              // return Math.sqrt(value) + '毫秒'
            } else if (value === 1) {
              return '0毫秒'
            } else {
              const x = String(value).indexOf('.') + 1// 得到小数点的位置
              const y = String(value).length - x// 小数点的位数
              if (value * Math.pow(10, 2 * y) / 100 >= 1) {
                return parseInt(String(value * Math.pow(10, 2 * y))) / 100 + '毫秒'
              } else {
                return '0.5毫秒'
              }
            }
          }
        }
      }
    ],
    series: props.chartSeries
  }))
  const errorOption = {
    title: {
      text: tc('历史数据有误，正在修正中'),
      x: 'center',
      y: 'center',
      textStyle: {
        fontSize: 20,
        fontWeight: 'normal'
      }
    }
  }
  watch(props, () => {
    if (props.status === 'normal') {
      chart.setOption(option.value, true)
    } else {
      chart.setOption(errorOption, true)
    }
  }, { deep: true })
  const chartResize = () => {
    chart.resize()
  }
  window.addEventListener('resize', chartResize)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', chartResize)
  })
})
</script>

<template>
  <div class="HistogramChart" style="width: 100%">
    <div ref="container" :style="{ width: '100%', height: '650px' }"></div>
  </div>
</template>

<style lang="scss" scoped>
.WebHistogramLineChart {
}
</style>
