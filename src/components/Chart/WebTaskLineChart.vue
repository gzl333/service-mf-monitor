<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import { GridComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([GridComponent, LineChart, CanvasRenderer, UniversalTransition])

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
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        show: false
      }
    ],
    yAxis: [
      {
        type: 'value',
        show: false
      }
    ],
    series: [
      {
        name: 'WebTaskLine',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 0
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 1,
              color: '#3366cc'
            }
          ])
        },
        emphasis: {
          focus: 'series'
        },
        data: [5, 10, 5, 30, 10, 40, 5, 30, 5, 45, 10, 5, 15, 5, 35, 10, 45, 0, 60, 5, 75, 75, 80, 85, 30, 10, 5, 80, 100]
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
    <div ref="container" :style="{ width: '100%', height: '60px' }"></div>
  </div>
</template>

<style lang="scss" scoped>
.LineChart {
}
</style>
