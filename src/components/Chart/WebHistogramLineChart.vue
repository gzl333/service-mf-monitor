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

const props = defineProps({
  xAxisTime: {
    type: Array,
    required: true
  },
  legendData: {
    type: Array,
    required: true
  },
  chartSeries: {
    type: Array,
    required: true
  }
})
const container = ref<HTMLElement>()
// defineExpose({ })
onMounted(() => {
  const chart = echarts.init(container.value!)
  const option = computed(() => ({
    title: {
      text: '实时网站监控汇总图',
      left: 'center'
    },
    grid: {
      top: 120,
      left: 50,
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
        let relVal = params[0].name
        for (let i = 0, l = params.length; i < l; i++) {
          if (params[i].seriesType === 'bar') {
            relVal += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + '状态码为' + params[i].value
          } else {
            relVal += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + params[i].value + '毫秒'
          }
        }
        return relVal
      }
    },
    legend: {
      padding: [60, 0, 0, 0],
      itemStyle: {
        borderWidth: 0
      },
      data: props.legendData
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
        name: '请求耗时',
        scale: true,
        min: 0,
        boundaryGap: [0.2, 0.2],
        splitLine: {
          show: false
        }
      },
      {
        type: 'value',
        name: '状态码',
        max: 600,
        axisLine: {
          show: false,
          lineStyle: {
            color: '#000000'
          }
        },
        axisTick: {
          show: false,
          lineStyle: {
            color: '#000000'
          }
        },
        axisLabel: {
          textStyle: {
            color: '#000000' // 坐标值得具体的颜色
          }
        },
        splitLine: {
          show: true
        }
      }
    ],
    series: props.chartSeries
  }))
  chart.setOption(option.value)
  watch(props, () => {
    chart.setOption(option.value)
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
.LineChart {
}
</style>
