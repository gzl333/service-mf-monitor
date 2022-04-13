<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
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
const lineData: any = ref([])
const getChartData = () => {
  lineData.value = props.chartData
  lineData.value.unshift(0)
}
const refreshChart = (data: []) => {
  lineData.value = data
}
defineExpose({ refreshChart })
onMounted(() => {
  const chart = echarts.init(container.value!)
  getChartData()
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
        data: lineData.value,
        type: 'line',
        symbol: 'none'
      }
    ]
  }))
  chart.setOption(option.value)
  watch(option, () => {
    chart.setOption(option.value)
  })
})
</script>

<template>
  <div class="LineChart">
    <div ref="container" :style="{ width: '205px', height: '40px' }"></div>
  </div>
</template>

<style lang="scss" scoped>
.StoragePage {
}
</style>
