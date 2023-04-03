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
// defineExpose({ })
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
      left: 70,
      right: 50,
      bottom: 50
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
          if (params[i].value > 0) {
            if ((i + 1) % 5 === 0) {
              num += Number(params[i].value)
              totalArr.push(num.toFixed(2))
              num = 0
            } else {
              num += Number(params[i].value)
            }
          } else {
            num += Number(params[i].value * -1)
            totalArr.push(num.toFixed(2))
            num = 0
          }
        }
        let relVal = today + ' ' + params[0].name
        for (let i = 0, l = params.length; i < l; i++) {
          if (params[i].value > 0) {
            if (i >= 0 && i % 5 === 0) {
              const dId = params[i].seriesId.slice(0, params[i].seriesId.lastIndexOf('-'))
              relVal += `<br/>${params[i].seriesName.slice(0, params[i].seriesName.indexOf('-'))}<span class="text-primary text-weight-bold"> ${tc('状态码') + ':' + props.statusObj[dId][params[i].dataIndex][1] + ' ' + tc('总耗时') + totalArr[i / 5] + tc('毫秒')}</span><br/>
              ${params[i].marker + params[i].seriesName.slice(params[i].seriesName.indexOf('-') + 1)}：${params[i].value + tc('毫秒')}`
            } else {
              if ((i + 1) % 5 === 0) {
                relVal += '<br/>' + params[i].marker + params[i].seriesName.slice(params[i].seriesName.indexOf('-') + 1) + ' : ' + params[i].value + tc('毫秒') +
                    '<br/>' + '<hr/>'
              } else {
                relVal += '<br/>' + params[i].marker + params[i].seriesName.slice(params[i].seriesName.indexOf('-') + 1) + ' : ' + params[i].value + tc('毫秒')
              }
            }
          } else {
            const dId = params[i].seriesId.slice(0, params[i].seriesId.lastIndexOf('-'))
            relVal += `<br/>${params[i].seriesName.slice(0, params[i].seriesName.indexOf('-'))}<span class="text-primary text-weight-bold"> ${tc('状态码') + ':' + props.statusObj[dId][params[i].dataIndex][1] + ' ' + tc('总耗时') + totalArr[i] + tc('毫秒')}</span><br/>
              ${params[i].marker + params[i].seriesName.slice(params[i].seriesName.indexOf('-') + 1)}：${params[i].value * -1 + tc('毫秒')}`
          }
        }
        return relVal
      }
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: true,
        data: props.xAxisTime
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: tc('请求耗时'),
        scale: true,
        boundaryGap: [0.2, 0.2],
        splitLine: {
          show: false
        },
        axisLabel: {
          formatter: `{value} ${tc('毫秒')}`
        }
      }
    ],
    series: props.chartSeries
  }))
  const waitOption = {
    title: {
      text: tc('正在获取监控数据,大约一分钟之后会产生监控数据'),
      x: 'center',
      y: 'center',
      textStyle: {
        fontSize: 20,
        fontWeight: 'normal'
      }
    }
  }
  // const nullOption = {
  //   title: {
  //     text: tc('暂无数据，请稍后刷新页面重新查看'),
  //     x: 'center',
  //     y: 'center',
  //     textStyle: {
  //       fontSize: 20,
  //       fontWeight: 'normal'
  //     }
  //   }
  // }
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
  if (props.chartSeries?.length > 0 && props.xAxisTime?.length > 0 && props.status === 'normal') {
    chart.setOption(option.value, true)
  } else {
    if (props.status === 'wait') {
      chart.setOption(waitOption, true)
    } else if (props.status === 'error') {
      chart.setOption(errorOption, true)
    }
  }
  watch(props, () => {
    if (props.chartSeries?.length > 0 && props.xAxisTime?.length > 0 && props.status === 'normal') {
      chart.setOption(option.value, true)
    } else {
      if (props.status === 'wait') {
        chart.setOption(waitOption, true)
      } else if (props.status === 'error') {
        chart.setOption(errorOption, true)
      }
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
    <div ref="container" :style="{ width: '100%', height: '600px' }"></div>
  </div>
</template>

<style lang="scss" scoped>
.WebHistogramLineChart {
}
</style>
