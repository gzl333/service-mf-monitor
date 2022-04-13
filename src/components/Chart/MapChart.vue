<script setup lang="ts">
import { onMounted, ref, toRefs, watch, onUnmounted } from 'vue'
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
onMounted(() => {
  const chart: any = echarts.init(container.value!)
  myChart = chart
  echarts.registerMap('china', china as GeoJSONSourceInput)
  chart.setOption(props.option)
  chart.on('globalout', function () {
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
    chart.clear()
    chart.setOption(props.option)
  }, { deep: true })
})
onUnmounted(() => {
  myChart.clear()
  echarts.dispose(myChart)
})

</script>
<template>
  <div class="MapChart row">
    <div ref="container" style="width: 95%; height: 100%;"/>
    <div style="background-color: #FAFAFA; width: 5%;" class="row column justify-end">
      <q-btn outline color="white" text-color="black" icon="add" class="q-mb-md" @click="roamMap(0)"/>
      <q-btn outline color="white" text-color="black" icon="remove" @click="roamMap(1)"/>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.MapChart {
}
</style>
