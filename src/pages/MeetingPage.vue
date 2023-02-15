<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import MapChart from 'components/Chart/MapChart.vue'
import { MeetingStatusInterface, StartPointInterface, EndPointInterface, StatusArrayInterface } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import monitor from '../api/index'
import { i18n } from 'boot/i18n'

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
const { tc } = i18n.global
const mapRef = ref()
// 刷新相关数据
const isRefresh = ref(true)
const disable = ref(false)
// 表格数据
const tableRow = ref<EndPointInterface[]>([])
// 全国地图需要的数据
const countrySeries: Record<string, any> = ref([])
// 搜索条件
const searchQuery = ref({
  status: '2',
  name: ''
})
const initialPagination = ref({
  page: 1
})
let meetingStatusData: MeetingStatusInterface[] = []
let meetingPingData: MeetingStatusInterface[] = []
// 所有服务经纬度数据
let coordinateData: Record<string, number[]> = {}
// 全国所有节点数据
let nationalNodeData: Array<[StartPointInterface, EndPointInterface]> = []
// 搜索过滤后的数据
let searchFilterData: any[] = []
const translationMapping = {
  北京市: 'Beijing',
  天津市: 'Tianjin',
  河北省: 'Hebei',
  山西省: 'Shanxi',
  内蒙古自治区: 'Inner Mongoria',
  辽宁省: 'Liaoning',
  吉林省: 'Jilin',
  黑龙江省: 'Heilongjiang',
  上海市: 'Shanghai',
  江苏省: 'Jiangsu',
  浙江省: 'Zhejiang',
  安徽省: 'Anhui',
  福建省: 'Fujian',
  江西省: 'Jiangxi',
  山东省: 'Shandong',
  台湾省: 'Taiwan',
  河南省: 'Henan',
  湖北省: 'Hubei',
  湖南省: 'Hunan',
  广东省: 'Guangdong',
  广西壮族自治区: 'Guangxi',
  海南省: 'Hainan',
  香港特别行政区: 'Hong Kong',
  澳门特别行政区: 'Macao',
  重庆市: 'Chongqing',
  四川省: 'Sichuan',
  贵州省: 'Guizhou',
  云南省: 'Yunnan',
  西藏自治区: 'Tibet',
  陕西省: 'Shaanxi',
  甘肃省: 'Gansu',
  青海省: 'Qinghai',
  宁夏回族自治区: 'Ningxia',
  新疆维吾尔自治区: 'Xinjiang',
  南海诸岛: 'South China Sea Islands'
}
// 筛选表格数据
const tableData = computed(() => {
  if (searchQuery.value.name !== '' && searchQuery.value.status !== '2') {
    return tableRow.value.filter(item => item.status === searchQuery.value.status && (item.name.toLowerCase().includes(searchQuery.value.name.toLowerCase()) || item.ipv4.toString().indexOf(searchQuery.value.name.trim()) !== -1))
  } else if (searchQuery.value.name === '' && searchQuery.value.status !== '2') {
    return tableRow.value.filter(item => item.status === searchQuery.value.status)
  } else if (searchQuery.value.name !== '' && searchQuery.value.status === '2') {
    return tableRow.value.filter(item => item.name.toLowerCase().includes(searchQuery.value.name.toLowerCase().trim()) || item.ipv4.toString().indexOf(searchQuery.value.name.trim()) !== -1)
  } else {
    return tableRow.value
  }
})
const statusOptions = [
  {
    value: '2',
    label: '全部',
    labelEn: 'All'
  },
  {
    value: '1',
    label: '在线',
    labelEn: 'Online'
  },
  {
    value: '0',
    label: '离线',
    labelEn: 'Offline'
  }
]
const refreshSelection = ref({
  label: '每30s刷新',
  labelEn: 'Refresh every 30 seconds',
  value: 30
})
const refreshOptions = [
  {
    label: '每30s刷新',
    labelEn: 'Refresh every 30 seconds',
    value: 30
  },
  {
    label: '每1min刷新',
    labelEn: 'Refresh every 1 minute',
    value: 60
  },
  {
    label: '每10min刷新',
    labelEn: 'Refresh every 10 minutes',
    value: 600
  },
  {
    label: '每30min刷新',
    labelEn: 'Refresh every 30 minutes',
    value: 1800
  },
  {
    label: '每1h刷新',
    labelEn: 'Refresh every 1 hour',
    value: 3600
  }
]
const columns = computed(() => [
  {
    name: 'name',
    required: true,
    label: (() => tc('名称'))(),
    align: 'center',
    field: 'name'
  },
  {
    name: 'ipv4',
    align: 'center',
    label: (() => tc('ip地址'))(),
    field: 'ipv4',
    style: 'width: 200px'
  },
  {
    name: 'status',
    align: 'center',
    label: (() => tc('状态'))(),
    field: 'status',
    style: 'width: 50px'
  },
  {
    name: 'ping',
    align: 'center',
    label: 'Ping',
    field: 'ping',
    style: 'width: 200px'
  },
  {
    name: 'longitude',
    align: 'center',
    label: (() => tc('经度'))(),
    field: 'longitude',
    style: 'width: 150px'
  },
  {
    name: 'latitude',
    align: 'center',
    label: (() => tc('纬度'))(),
    field: 'latitude',
    style: 'width: 150px'
  }
])
const countryOption = computed(() => ({
  backgroundColor: '#FAFAFA',
  title: {
    text: tc('视频会议节点网络状态-全国'),
    left: 'center',
    textStyle: {
      color: '#000000'
    }
  },
  toolbox: {
    bottom: 30,
    right: 30,
    itemSize: 41,
    orient: 'vertical',
    itemGap: 8,
    iconStyle: {
      color: '#5B5B5B',
      borderWidth: 0
    },
    feature: {
      myEnlarge: {
        show: true,
        icon: 'path://M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z',
        onclick: function () {
          mapRef.value.roamMap(0)
        }
      },
      myNarrow: {
        show: true,
        icon: 'path://M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z',
        onclick: function () {
          mapRef.value.roamMap(1)
        }
      }
    }
  },
  tooltip: {
    trigger: 'item',
    formatter: function (params: Record<string, any>) {
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
    },
    nameMap: i18n.global.locale === 'en' ? translationMapping : ''
  },
  series: countrySeries.value
}))
const convertData = function (data: Array<[StartPointInterface, EndPointInterface]>) {
  console.log(data)
  const res = []
  for (let i = 0; i < data.length; i++) {
    const dataItem = data[i]
    if (dataItem[1].latitude !== 0 && dataItem[1].longitude !== 0) {
      const fromCoords = [116.342428, 39.99322]
      const toCoords = coordinateData[dataItem[1].name]
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
const convertPointData = function (data: Array<[StartPointInterface, EndPointInterface]>) {
  const res = []
  for (let i = 0; i < data.length; i++) {
    const dataItem = data[i]
    if (dataItem[1].latitude !== 0 && dataItem[1].longitude !== 0) {
      res.push({
        name: dataItem[1].name,
        value: coordinateData[dataItem[1].name].concat([dataItem[1].value]),
        status: dataItem[1].status
      })
    }
  }
  return res
}
const getCountryData = (data: Array<[StartPointInterface, EndPointInterface]>) => {
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
const getMeetingStatusData = async (query: string) => {
  const config = {
    query: {
      query
    }
  }
  let response: MeetingStatusInterface[] = []
  await monitor.monitor.api.getMonitorVideoQuery(config).then((res) => {
    response = res.data
  }).catch((error) => {
    console.log(error)
  })
  return response
}
const handleStatusData = () => {
  const startObj = {
    name: tc('信息化大厦')
  }
  meetingStatusData.forEach(meeting => {
    meeting.value.forEach(state => {
      const longLatArr = []
      longLatArr.push(state.metric.longitude)
      longLatArr.push(state.metric.latitude)
      coordinateData[state.metric.name] = longLatArr
      const nodeArr: any = []
      const nodeObj: EndPointInterface = {
        ipv4: [],
        latitude: 0,
        longitude: 0,
        name: '',
        ping: '',
        status: '',
        value: 0
      }
      nodeArr.push(startObj)
      nodeObj.name = state.metric.name
      nodeObj.value = 4
      nodeObj.status = state.value[1]
      nodeObj.ipv4 = state.metric.ipv4s
      nodeObj.longitude = state.metric.longitude
      nodeObj.latitude = state.metric.latitude
      nodeArr.push(nodeObj)
      nationalNodeData.push(nodeArr)
    })
  })
}
const handlePingData = () => {
  meetingPingData.forEach(meeting => {
    meeting.value.forEach((ping: StatusArrayInterface) => {
      nationalNodeData.forEach((node: [StartPointInterface, EndPointInterface]) => {
        if (node[1].name === ping.metric.name) {
          node[1].ping = ping.value[1]
        }
      })
    })
  })
  tableRow.value = nationalNodeData.map(item => item[1])
  console.log(tableRow.value)
}
const initialization = async () => {
  isRefresh.value = false
  meetingStatusData = await getMeetingStatusData('node_status')
  handleStatusData()
  meetingPingData = await getMeetingStatusData('node_lantency')
  handlePingData()
  getCountryData(nationalNodeData)
  initialPagination.value.page = 1
  isRefresh.value = true
}
initialization()
const change = (val: Record<string, string>) => {
  searchQuery.value.status = val.value
}
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
  coordinateData = {}
  nationalNodeData = []
  void initialization()
}
let timer = setInterval(() => {
  void refresh()
}, refreshSelection.value.value * 1000)
watch(refreshSelection, () => {
  clearInterval(timer)
  timer = setInterval(() => {
    void refresh()
  }, refreshSelection.value.value * 1000)
})
watch(tableData, () => {
  searchFilterData = []
  initialPagination.value.page = 1
  tableData.value.forEach(row => {
    searchFilterData.push(nationalNodeData.find(node => node[1].name === row.name))
  })
  getCountryData(searchFilterData)
})
onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="MeetingPage">
    <map-chart :option="countryOption" ref="mapRef"></map-chart>
    <div class="row justify-between q-mt-lg items-center">
        <div class="col-6 row">
          <q-select outlined dense v-model="searchQuery.status"  map-options :options="statusOptions" :label="tc('状态')" class="col-2" @update:model-value="change"
                    :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'"/>
          <q-input outlined dense v-model="searchQuery.name" :placeholder="tc('筛选单位名称或IP地址')" class="col-6  q-ml-md">
            <template v-slot:append v-if="searchQuery.name !== ''">
              <q-icon name="close" @click="searchQuery.name = ''" class="cursor-pointer"/>
            </template>
          </q-input>
        </div>
        <div class="col-6 row justify-end items-center">
          <q-icon class="q-mr-lg" name="refresh" size="lg" v-show="isRefresh" @click="refresh"/>
          <q-btn no-caps unelevated class="q-mr-md" color="primary" :label="disable === true ? tc('打开自动刷新') : tc('关闭自动刷新')" @click="openOrClose" />
          <q-select outlined dense v-model="refreshSelection" :disable="disable" :options="refreshOptions" :label="tc('刷新时间')" class="col-5" :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'" />
        </div>
      </div>
    <q-table
        flat
        table-header-class="bg-grey-1 text-grey"
        :rows="tableData"
        :columns="columns"
        :rows-per-page-options="[10, 15, 20, 25, 50, 0]"
        v-model:pagination="initialPagination"
        :no-data-label="tc('暂无数据')"
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
              {{ props.row.status === '0' ? tc('离线') : tc('在线') }}
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
  </div>
</template>

<style lang="scss" scoped>
.MeetingPage {
}
</style>
