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
  chartSeries: {
    type: Object,
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
      formatter: function (params: any) {
        let relVal = params[0].name
        for (let i = 0, l = params.length; i < l; i++) {
          if (i >= 0 && i % 5 === 0) {
            relVal += `<br/>${params[i].seriesName.slice(0, params[i].seriesName.indexOf('-'))}<br/>
${params[i].marker}${params[i].seriesName.slice(params[i].seriesName.indexOf('-') + 1)}：${params[i].value}毫秒`
          } else {
            relVal += '<br/>' + params[i].marker + params[i].seriesName.slice(params[i].seriesName.indexOf('-') + 1) + ' : ' + params[i].value + '毫秒'
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
        name: '请求耗时',
        scale: true,
        boundaryGap: [0.2, 0.2],
        splitLine: {
          show: false
        },
        axisLabel: {
          formatter: '{value} 毫秒'
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
.WebHistogramLineChart {
}
</style>
