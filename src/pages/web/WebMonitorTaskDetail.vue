<script setup lang="ts">
// import { ref, computed, onBeforeMount, onBeforeUnmount } from 'vue'
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
import { useRoute, useRouter } from 'vue-router'
// import WebTaskLineChart from 'components/Chart/WebTaskLineChart.vue'
// import monitor from 'src/api/monitor'
// import { date } from 'quasar'
import { i18n } from 'boot/i18n'
import PieChart from 'components/Chart/PieChart.vue'
import HistogramChart from 'components/Chart/HistogramChart.vue'
// import $bus from 'src/hooks/bus'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

// const store = useStore()
const route = useRoute()
console.log(route)
const router = useRouter()
const { tc } = i18n.global
const goBack = () => {
  router.go(-1)
}
</script>

<template>
  <div class="WebMonitorTaskDetail">
    <div class="row title-area">
      <div class="col">
        <q-btn icon="arrow_back_ios" color="primary" flat unelevated dense
               @click="goBack"/>
        {{ tc('网站监控详情') }}
      </div>
    </div>
    <div class="row q-mt-xl justify-between">
      <div class="col-5">
        <q-card flat bordered>
          <histogram-chart chart-data="/"></histogram-chart>
        </q-card>
      </div>
      <div class="col-5">
        <pie-chart chart-data="/"></pie-chart>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

.title-area {
  width: 1230px;
  text-align: left;
  color: $primary;
  font-size: large;
  font-weight: bold;
}
</style>
