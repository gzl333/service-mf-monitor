<script setup lang="ts">
import { onMounted, ref, toRefs, watch, onUnmounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import china from 'assets/map/China.json'
import { GeoJSONSourceInput } from 'echarts/types/src/coord/geo/geoTypes'

const props = defineProps({
  option: {
    type: Object,
    required: true
  }
})

const container = ref<HTMLElement>()
let myChart: any
const roamMap = (flag: number) => {
  const currentZoom = myChart.getOption().geo[0].zoom
  let increaseAmplitude
  if (flag === 1) {
    increaseAmplitude = 0.8
  } else {
    increaseAmplitude = 1.4
  }
  if ((currentZoom * increaseAmplitude >= 0.7) && (currentZoom * increaseAmplitude <= 150)) {
    myChart.setOption({
      geo: {
        zoom: currentZoom * increaseAmplitude
      }
    })
  }
}
defineExpose({ roamMap })
onMounted(() => {
  const chart: any = echarts.init(container.value!)
  myChart = chart
  echarts.registerMap('china', china as GeoJSONSourceInput)
  chart.setOption(props.option)
  chart.on('globalout', function () {
    const point = chart.getOption().geo[0].center
    const zoom = chart.getOption().geo[0].zoom
    // 用于以坐标来判断边界,拖拽出界后弹回
    if (point !== null && zoom <= 7 && ((point[0] < 80.1 || point[0] > 127.8) || (point[1] < 24.1 || point[1] > 30.8))) {
      chart.setOption({
        geo: {
          center: null
        }
      })
    }
  })
  chart.on('mouseup', function () {
    const point = chart.getOption().geo[0].center
    const zoom = chart.getOption().geo[0].zoom
    if (point !== null && zoom <= 7 && ((point[0] < 80.1 || point[0] > 127.8) || (point[1] < 24.1 || point[1] > 30.8))) {
      chart.setOption({
        geo: {
          center: null
        }
      })
    }
  })
  const { option } = toRefs(props)
  watch(option, () => {
    // 每次刷新时,清空图表实例,再重新渲染,防止占用cpu过高导致页面卡顿
    chart.clear()
    chart.setOption(props.option)
  }, { deep: true })
})
// 用于图表自适应大小
const chartResize = () => {
  myChart.resize()
}
window.addEventListener('resize', chartResize)
onBeforeUnmount(() => {
  window.removeEventListener('resize', chartResize)
})
onUnmounted(() => {
  // 清空Echarts渲染图表
  myChart.clear()
  echarts.dispose(myChart)
})

</script>
<template>
  <q-card flat bordered class="row">
    <div ref="container" class="col-12" style="height: 600px"/>
  </q-card>
</template>
<style lang="scss" scoped>
.MapChart {
}
</style>
