<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import { GridComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([GridComponent, LineChart, CanvasRenderer, UniversalTransition])

const props = defineProps({
  chartData: {
    type: Array,
    required: true
  }
})
const container = ref<HTMLElement>()
// defineExpose({ })
onMounted(() => {
  const chart = echarts.init(container.value!)
  const option = computed(() => ({
    grid: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    },
    xAxis: {
      type: 'category',
      show: false,
      boundaryGap: false,
      data: ['初始', '平均', '最小', '最大']
    },
    yAxis: {
      type: 'value',
      show: false,
      max: 100,
      splitLine: { show: false }
    },
    series: [
      {
        data: [0, props.chartData[0], props.chartData[1], props.chartData[2]],
        type: 'line',
        symbol: 'none'
      }
    ]
  }))
  chart.setOption(option.value)
  watch(option, () => {
    chart.setOption(option.value)
  })
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
  <div class="LineChart" style="width: 100%">
    <div ref="container" :style="{ width: '100%', height: '40px' }"></div>
  </div>
</template>

<style lang="scss" scoped>
.LineChart {
}
</style>
