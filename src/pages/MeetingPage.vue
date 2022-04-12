<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import MapChart from 'components/MapChart.vue'
import { $api } from '../api/monitor'
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
// import { i18n } from 'boot/i18n'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

// const store = useStore()
// const route = useRoute()
// const router = useRouter()
// const tc = i18n.global.tc
// console.log(monitor.monitor)
const statusData = ref([])
const pingData = ref([])
// 表格数据
const tableRow = ref([])
// 刷新相关数据
const isRefresh = ref(true)
const disable = ref(false)
// 全国地图需要的数据
const countryFilterData = ref([])
const countrySeries: any = ref([])
// 全国数据
const nationalData: any = ref([])
// 所有服务经纬度数据
const coordinateData: Record<string, any> = ref({})
// 搜索过滤后的数据
const searchFilterData: any = ref([])
// 搜索条件
const searchQuery = ref({
  status: '2',
  name: ''
})
const tableData = computed(() => {
  if (searchQuery.value.name !== '' && searchQuery.value.status !== '2') {
    return tableRow.value.filter((item: Record<string, any>) => item.status === searchQuery.value.status && (item.name.toLowerCase().includes(searchQuery.value.name.toLowerCase()) || item.ipv4.toString().indexOf(searchQuery.value.name.trim()) !== -1))
  } else if (searchQuery.value.name === '' && searchQuery.value.status !== '2') {
    return tableRow.value.filter((item: Record<string, any>) => item.status === searchQuery.value.status)
  } else if (searchQuery.value.name !== '' && searchQuery.value.status === '2') {
    return tableRow.value.filter((item: Record<string, any>) => item.name.toLowerCase().includes(searchQuery.value.name.toLowerCase().trim()) || item.ipv4.toString().indexOf(searchQuery.value.name.trim()) !== -1)
  } else {
    return tableRow.value
  }
})
const initialPagination = ref({
  page: 1
})
const statusOptions = [
  {
    value: '2',
    label: '全部'
  },
  {
    value: '1',
    label: '在线'
  },
  {
    value: '0',
    label: '离线'
  }
]
const refreshSelection = ref({
  label: '每30s刷新',
  value: 30
})
const refreshOptions = [
  {
    label: '每30s刷新',
    value: 30
  },
  {
    label: '每1min刷新',
    value: 60
  },
  {
    label: '每10min刷新',
    value: 600
  },
  {
    label: '每30min刷新',
    value: 1800
  },
  {
    label: '每1h刷新',
    value: 3600
  }
]
const columns = [
  {
    name: 'name',
    required: true,
    label: '名称',
    align: 'center',
    field: 'name'
  },
  {
    name: 'ipv4',
    align: 'center',
    label: 'ip地址',
    field: 'ipv4',
    style: 'width: 200px'
  },
  {
    name: 'status',
    align: 'center',
    label: '状态',
    field: 'status',
    style: 'width: 50px'
  },
  {
    name: 'ping',
    align: 'center',
    label: 'ping',
    field: 'ping',
    style: 'width: 200px'
  },
  {
    name: 'longitude',
    align: 'center',
    label: '经度',
    field: 'longitude',
    style: 'width: 150px'
  },
  {
    name: 'latitude',
    align: 'center',
    label: '纬度',
    field: 'latitude',
    style: 'width: 150px'
  }
]
// const style = 'path://M807.4 938.5c-139.5-8-250.2-31.7-250.2-173.2v-95.5c0-35.5 72.5-64.3 108-64.3h0.3l0.9-152.4c0-8.5-6.9-15.4-15.4-15.4H373.2c-8.5 0-15.4 6.9-15.4 15.4l0.6 148.7c33.6 2.1 103.8 30 103.8 64.1v95.5c0 142.2-111.8 168.4-252.3 175.3l-0.1 0.3 0.9 71.5c0 8.5 6.9 15.4 15.4 15.4h568.1c8.5 0 15.4-6.9 15.4-15.4l-0.8-69.8-1.4-0.2zM598.2 64.5V18.6c0-8.5-6.9-15.4-15.4-15.4H428.6c-8.5 0-15.4 6.9-15.4 15.4V67C212.1 111.8 61.7 291.3 61.7 506c0 153.6 77 289.2 194.4 370.3l42.7-136.7C236 681 196.7 597.4 196.7 504.7c0-177.4 143.8-321.3 321.3-321.3s321.3 143.8 321.3 321.3c0 97.9-43.8 185.5-112.8 244.5l40.1 127.4C884.2 795.4 961.4 659.7 961.4 506c0-218.8-156.2-401.1-363.2-441.5z'
const countryOption = computed(() => ({
  backgroundColor: '#FAFAFA',
  title: {
    text: '视频会议节点网络状态-全国',
    left: 'center',
    textStyle: {
      color: '#000000'
    }
  },
  tooltip: {
    trigger: 'item',
    formatter: function (params: any) {
      if (params.seriesType === 'effectScatter') {
        const status = params.data.status === '0' ? '<span style="color: red">离线</span>' : '<span style="color: green">在线</span>'
        return params.data.name + '<br/>' + '状态:' + status
      } else if (params.seriesType === 'lines') {
        const name = params.data.fromName + '——' + params.data.toName
        const status = params.data.status === '0' ? '<span style="color: red">离线</span>' : '<span style="color: green">在线</span>'
        const ipv4 = params.data.ipv4
        if (params.data.status === '0') {
          return name + '<br/>' + '状态:' + status + '</br>' + 'IP地址:' + ipv4
        } else {
          return name + '<br/>' + '状态:' + status + '</br>' + 'ping值:' + params.data.ping + '</br>' + 'IP地址:' + ipv4
        }
      } else {
        return params.name
      }
    }
  },
  geo: {
    map: 'china',
    label: {
      emphasis: {
        show: true,
        color: '#012248'
      }
    },
    roam: true,
    scaleLimit: {
      min: 1,
      max: 150
    },
    top: '30%',
    left: '31%',
    zoom: 1.5,
    itemStyle: {
      normal: {
        areaColor: '#E6E6E6',
        borderColor: 'skyblue',
        borderWidth: 1
      },
      emphasis: {
        areaColor: '#F5A9A9'
      }
    }
  },
  series: countrySeries.value
}))
const convertData = function (data: any) {
  const res = []
  for (let i = 0; i < data.length; i++) {
    const dataItem = data[i]
    if (dataItem[1].latitude !== 0 && dataItem[1].longitude !== 0) {
      const fromCoords = [116.342428, 39.99322]
      const toCoords = coordinateData.value[dataItem[1].name]
      if (fromCoords && toCoords) {
        res.push({
          fromName: dataItem[0].name,
          toName: dataItem[1].name,
          coords: [fromCoords, toCoords],
          value: dataItem[1].value,
          status: dataItem[1].status,
          ping: dataItem[1].ping,
          ipv4: dataItem[1].ipv4
        })
      }
    }
  }
  return res
}
const convertPointData = function (data: any) {
  const res = []
  for (let i = 0; i < data.length; i++) {
    const dataItem = data[i]
    if (dataItem[1].latitude !== 0 && dataItem[1].longitude !== 0) {
      res.push({
        name: dataItem[1].name,
        value: coordinateData.value[dataItem[1].name].concat([dataItem[1].value]),
        status: dataItem[1].status
      })
    }
  }
  return res
}
const getCountryData = (data: any[]) => {
  countrySeries.value = []
  const dataArr = []
  dataArr.push(data)
  dataArr.forEach(function (item) {
    countrySeries.value.push(
      {
        type: 'lines',
        zlevel: 1,
        symbol: ['none'],
        symbolSize: 9,
        effect: {
          show: false,
          period: 6,
          trailLength: 0.3,
          // symbol: style,
          symbolSize: 5
        },
        lineStyle: {
          normal: {
            // 线段颜色
            color: function (item1: Record<string, any>) {
              if (item1.data.status === '0') {
                return '#FF0000'
              } else {
                return '#00FF00'
              }
            },
            width: 1.2,
            opacity: 0.6,
            curveness: 0.2
          }
        },
        data: convertData(item)
      },
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 1,
        rippleEffect: {
          brushType: 'stroke',
          number: 2,
          scale: 4
        },
        label: {
          normal: {
            show: true,
            // color: '#012248',
            position: 'right',
            formatter: '{b}'
          }
        },
        symbolSize: function (val: number[]) {
          return val[2]
        },
        itemStyle: {
          normal: {
            // 点的颜色
            color: '#5882FA'
          },
          emphasis: {
            areaColor: '#2B91B7'
          }
        },
        data: convertPointData(item)
      })
  })
}
const getStatusData = async () => {
  const config = {
    query: {
      query: 'node_status'
    }
  }
  let response: any = []
  await $api.api.getMonitorVideoQuery(config).then((res: any) => {
    response = res.data
  })
  return response
}
const getDelayData = async () => {
  const config = {
    query: {
      query: 'node_lantency'
    }
  }
  let response: any = []
  await $api.api.getMonitorVideoQuery(config).then((res: any) => {
    response = res.data
  })
  return response
}
const handleStatusData = () => {
  const startObj = {
    name: '信息化大厦'
  }
  statusData.value.forEach((item: Record<string, any>) => {
    item.value.forEach((item1: Record<string, any>) => {
      const outArr = []
      outArr.push(item1.metric.longitude)
      outArr.push(item1.metric.latitude)
      coordinateData.value[item1.metric.name] = outArr
      const inArr = []
      const inObj: Record<string, any> = {}
      inArr.push(startObj)
      inObj.name = item1.metric.name
      inObj.value = 4
      inObj.status = item1.value[1]
      inObj.ipv4 = item1.metric.ipv4s
      inObj.longitude = item1.metric.longitude
      inObj.latitude = item1.metric.latitude
      inArr.push(inObj)
      nationalData.value.push(inArr)
    })
  })
}
const handlePingData = () => {
  pingData.value.forEach((item: Record<string, any>) => {
    item.value.forEach((item1: Record<string, any>) => {
      nationalData.value.forEach((item2: Record<string, string | number | number[]>[]) => {
        if (item2[1].name === item1.metric.name) {
          item2[1].ping = item1.value[1]
        }
      })
    })
  })
  return nationalData.value
}
const getTableRow = () => {
  tableRow.value = nationalData.value.map((item: Record<string, string | number | number[]>[]) => item[1])
}
const change = (val: Record<string, string>) => {
  searchQuery.value.status = val.value
}
let timer = setInterval(() => {
  void refresh()
}, refreshSelection.value.value * 1000)
const openOrClose = () => {
  disable.value = !disable.value
  if (disable.value === true) {
    clearInterval(timer)
  } else {
    timer = setInterval(() => {
      void refresh()
    }, refreshSelection.value.value * 1000)
  }
}
const refresh = () => {
  coordinateData.value = {}
  nationalData.value = []
  void initialization()
}
const initialization = async () => {
  isRefresh.value = false
  statusData.value = await getStatusData()
  handleStatusData()
  pingData.value = await getDelayData()
  countryFilterData.value = handlePingData()
  getCountryData(countryFilterData.value)
  getTableRow()
  initialPagination.value.page = 1
  isRefresh.value = true
}
onMounted(() => {
  void initialization()
})
onUnmounted(() => {
  clearInterval(timer)
})
watch(refreshSelection, () => {
  clearInterval(timer)
  timer = setInterval(() => {
    void refresh()
  }, refreshSelection.value.value * 1000)
})
watch(tableData, () => {
  searchFilterData.value = []
  initialPagination.value.page = 1
  tableData.value.forEach((item: Record<string, number | string | number[]>) => {
    searchFilterData.value.push(countryFilterData.value.find((item1: Record<string, string | number | number[]>[]) => item1[1].name === item.name))
  })
  getCountryData(searchFilterData.value)
})
</script>

<template>
  <div class="FederationMonitorVideoMeeting">
    <q-card flat bordered class="row">
      <map-chart :option="countryOption" style="width: 1228px; height: 600px"></map-chart>
    </q-card>
    <q-card flat class="q-mt-lg">
      <div class="row justify-between q-mt-md">
        <div class="col-6 row">
          <q-select outlined dense v-model="searchQuery.status" :options="statusOptions" map-options option-value="value" label="状态" class="col-2" @update:model-value="change"/>
          <q-input outlined dense v-model="searchQuery.name" placeholder="筛选单位名称或IP地址" class="col-6  q-ml-md">
            <template v-slot:append v-if="searchQuery.name !== ''">
              <q-icon name="close" @click="searchQuery.name = ''" class="cursor-pointer"/>
            </template>
          </q-input>
        </div>
        <div class="col-6 row justify-end">
          <q-icon name="refresh" size="md" v-show="isRefresh" @click="refresh" class="col-2"/>
          <q-btn color="primary" :label="disable === true ? '打开自动刷新' : '关闭自动刷新'" class="col-2 q-mr-md q-pa-none" @click="openOrClose" unelevated/>
          <q-select outlined dense v-model="refreshSelection" :options="refreshOptions" label="刷新时间" class="col-5" :disable = "disable"/>
        </div>
      </div>
      <q-table
        flat
        table-header-class="bg-grey-1 text-grey"
        :rows="tableData"
        :columns="columns"
        :rows-per-page-options="[10, 15, 20, 25, 50, 0]"
        v-model:pagination="initialPagination"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="name" :props="props">
              <div>{{ props.row.name }}</div>
            </q-td>
            <q-td key="ipv4" :props="props">
              <span v-for="(item, index) in props.row.ipv4" :key="index">{{ item }}</span>
            </q-td>
            <q-td key="status" :props="props" :class="props.row.status === '0' ? 'text-negative' : 'text-positive'">
              {{ props.row.status === '0' ? '离线' : '在线' }}
            </q-td>
            <q-td key="ping" :props="props" :class="parseFloat(props.row.ping) > 1 ? 'text-red' : ''">
              {{ (parseFloat(props.row.ping) * 1000).toFixed(3) }}ms
            </q-td>
            <q-td key="longitude" :props="props">
              <div>{{ props.row.longitude }}</div>
            </q-td>
            <q-td key="latitude" :props="props">
              <div>{{ props.row.latitude }}</div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<style lang="scss" scoped>
.MeetingPage {
}
</style>
