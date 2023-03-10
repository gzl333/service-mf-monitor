<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, toRefs } from 'vue'
import * as echarts from 'echarts/core'
import { TitleComponent, ToolboxComponent, TooltipComponent, GridComponent, LegendComponent, MarkLineComponent, MarkPointComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([TitleComponent, ToolboxComponent, TooltipComponent, GridComponent, LegendComponent, MarkLineComponent, MarkPointComponent, LineChart, CanvasRenderer, UniversalTransition])

const props = defineProps({
  option: {
    type: Object,
    required: true
  }
})
console.log(props)
const container = ref<HTMLElement>()
onMounted(() => {
  const chart = echarts.init(container.value!)
  chart.setOption(props.option)
  const { option } = toRefs(props)
  watch(option, () => {
    chart.clear()
    // 每次刷新时,清空图表实例,再重新渲染,防止占用cpu过高导致页面卡顿
    chart.setOption(props.option)
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
  <div class="WebMonitorStatusLine" style="width: 100%">
    <div ref="container" :style="{ width: '100%', height: '450px' }"></div>
  </div>
</template>

<style lang="scss" scoped>
.LineChart {
}
</style>
