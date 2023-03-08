<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import { GridComponent } from 'echarts/components'
import { BarChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([GridComponent, BarChart, CanvasRenderer])

// const props = defineProps({
//   chartData: {
//     type: Array,
//     required: false
//   }
// })
const container = ref<HTMLElement>()
// defineExpose({ })
onMounted(() => {
  const chart = echarts.init(container.value!)
  const option = computed(() => ({
    title: {
      text: '近5分钟实时状态',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: ['14:34', '14:35', '14:36', '14:37', '14:38']
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [
      {
        data: [
          200,
          {
            value: 500,
            itemStyle: {
              color: '#a90000'
            }
          },
          400,
          401,
          404
        ],
        type: 'bar'
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
  <div class="HistogramChart" style="width: 100%">
    <div ref="container" :style="{ width: '100%', height: '400px' }"></div>
  </div>
</template>

<style lang="scss" scoped>
.LineChart {
}
</style>
