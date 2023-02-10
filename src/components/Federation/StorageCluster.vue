<script setup lang="ts">
import { ref } from 'vue'
import monitor from '../../api/index'
import { i18n } from 'boot/i18n'

const props = defineProps({
  unitCeph: {
    type: Object,
    required: true
  }
})

const emits = defineEmits(['is-emit'])
const { tc } = i18n.global
const monitorCephData: Record<string, any> = ref({})
const isShowHealth = ref(true)
const isShowClusterTotal = ref(true)
const isShowClusterUsed = ref(true)
const isShowOSD = ref(true)
const getStorageQuery = async (monitor_unit_id: string) => {
  const storageQuery: string[] = ['health_status', 'cluster_total_bytes', 'cluster_total_used_bytes', 'osd_in', 'osd_out', 'osd_up', 'osd_down']
  const config = {
    query: {
      monitor_unit_id,
      query: ''
    }
  }
  const storageObject: {[key: string]: string } = {}
  storageObject.grafana_url = props.unitCeph.grafana_url
  storageObject.unitName = props.unitCeph.name
  for (const query of storageQuery) {
    config.query.query = query
    await monitor.monitor.api.getMonitorCephQuery(config).then((res) => {
      if (res.data[0].value !== null) {
        storageObject[query as keyof typeof storageObject] = res.data[0].value[1]
      } else {
        storageObject[query as keyof typeof storageObject] = '暂无数据'
      }
    }).catch((error) => {
      console.log(error)
      storageObject[query as keyof typeof storageObject] = '获取数据出错'
    })
  }
  isShowHealth.value = true
  isShowClusterTotal.value = true
  isShowClusterUsed.value = true
  isShowOSD.value = true
  return storageObject
}
getStorageQuery(props.unitCeph.id).then((res) => {
  monitorCephData.value = res
})
const refreshGetData = async (monitor_unit_id: string, query: string) => {
  const config = {
    query: {
      monitor_unit_id,
      query
    }
  }
  await monitor.monitor.api.getMonitorCephQuery(config).then((res) => {
    if (res.data[0].value !== null) {
      monitorCephData.value[query] = res.data[0].value[1]
    } else {
      monitorCephData[query] = '暂无数据'
    }
  })
}
const refresh = async (monitor_unit_id: string, query: string) => {
  if (query === 'health_status') {
    isShowHealth.value = false
    void await refreshGetData(monitor_unit_id, query)
    isShowHealth.value = true
  } else if (query === 'cluster_total_bytes') {
    isShowClusterTotal.value = false
    void await refreshGetData(monitor_unit_id, query)
    isShowClusterTotal.value = true
  } else if (query === 'cluster_total_used_bytes') {
    isShowClusterUsed.value = false
    void await refreshGetData(monitor_unit_id, query)
    isShowClusterUsed.value = true
  } else {
    isShowOSD.value = false
    const arr = query.split(',')
    for (const item of arr) {
      void await refreshGetData(monitor_unit_id, item)
    }
    isShowOSD.value = true
  }
}
const intervalRefresh = async (isLast: boolean) => {
  isShowHealth.value = false
  isShowClusterTotal.value = false
  isShowClusterUsed.value = false
  isShowOSD.value = false
  monitorCephData.value = await getStorageQuery(props.unitCeph.id)
  if (isLast) {
    emits('is-emit')
  }
}
const goToGrafana = () => {
  window.open(props.unitCeph.grafana_url)
}
defineExpose({ intervalRefresh })
</script>

<template>
  <div class="StorageCluster">
    <div class="text-subtitle1 text-weight-bold q-mt-lg">{{ props.unitCeph.name }}</div>
    <div class="row q-col-gutter-xs q-mt-sm">
        <div class="col-6 row q-col-gutter-sm">
          <div class="col-4">
            <q-card flat bordered class="my-card no-border-radius" style="height: 190px">
              <div class="row">
                <div class="col-11 text-center">{{ tc('集群状态') }}</div>
                <q-icon class="col-1" name="loop" size="xs" v-show="isShowHealth" @click="refresh(props.unitCeph.id,'health_status')"/>
              </div>
              <div :class="!monitorCephData.health_status ? 'text-center text-h4 q-mt-xl' : monitorCephData.health_status === '0' ? 'text-positive text-center text-h4 text-weight-bold q-mt-xl' : monitorCephData.health_status === '1' ?
                    'text-warning text-center text-h4 text-weight-bold q-mt-xl' : 'text-negative text-center text-h4 text-weight-bold q-mt-xl'">
                {{ !monitorCephData.health_status ? tc('正在获取') : monitorCephData.health_status === '0' ? 'Healthy' : monitorCephData.health_status === '1' ? 'Warning' : 'Fatal' }}
              </div>
            </q-card>
          </div>
          <div class="col-4">
            <q-card flat bordered class="no-border-radius" style="height: 190px">
              <div class="row">
                <div class="col-11 text-center">{{ tc('集群容量') }}</div>
                <q-icon name="loop" class="col-1" size="xs" v-show="isShowClusterTotal" @click="refresh(props.unitCeph.id,'cluster_total_bytes')"/>
              </div>
              <div class="text-center text-h4 q-mt-xl">
                {{ monitorCephData.cluster_total_bytes && monitorCephData.cluster_total_bytes !== '暂无数据' && monitorCephData.cluster_total_bytes !== '获取数据出错' ? (monitorCephData.cluster_total_bytes / Math.pow(1024, 5)).toFixed(2) + 'PiB'
                : !monitorCephData.cluster_total_bytes ? tc('正在获取') : tc(monitorCephData.cluster_total_bytes) }}
              </div>
            </q-card>
          </div>
          <div class="col-4">
            <q-card flat bordered class="no-border-radius" style="height: 190px">
              <div class="row">
                <div class="col-11 text-center">{{ tc('当前容量') }}</div>
                <q-icon name="loop" class="col-1" size="xs" v-show="isShowClusterUsed" @click="refresh(props.unitCeph.id,'cluster_total_used_bytes')"/>
              </div>
              <div class="text-center text-h4 q-mt-xl">
                {{ monitorCephData.cluster_total_used_bytes  && monitorCephData.cluster_total_used_bytes !== '暂无数据' && monitorCephData.cluster_total_used_bytes !== '获取数据出错' ? (monitorCephData.cluster_total_used_bytes / Math.pow(1024, 4)).toFixed(2) + 'TiB'
                : !monitorCephData.cluster_total_used_bytes ? tc('正在获取') : tc(monitorCephData.cluster_total_used_bytes) }}
              </div>
            </q-card>
          </div>
        </div>
        <div class="col-5">
          <q-card flat bordered class="no-border-radius" style="height: 190px">
            <div class="row">
              <div class="col-11 text-center">{{ tc('OSD状态') }}</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="isShowOSD" @click="refresh(props.unitCeph.id,'osd_in,osd_out,osd_up,osd_down')"/>
            </div>
            <div class="row q-ml-md q-mt-md">
              <div class="row col-12 q-ml-md">
                <div class="col-5">
                  <q-card flat bordered class="no-border-radius">
                    <div class="text-center">OSD IN</div>
                    <div :class="monitorCephData.osd_in && monitorCephData.osd_in !== '暂无数据' && monitorCephData.osd_in !== '正在获取' ? 'text-center text-h5 q-mt-xs text-positive' : 'text-center text-h6 q-mt-xs'">
                      {{ monitorCephData.osd_in ? monitorCephData.osd_in : tc('正在获取') }}
                    </div>
                  </q-card>
                </div>
                <div class="col-5 q-ml-lg">
                  <q-card flat bordered class="no-border-radius">
                    <div class="text-center">OSD UP</div>
                    <div :class="monitorCephData.osd_up && monitorCephData.osd_up !== '暂无数据' && monitorCephData.osd_up !== '正在获取' ? 'text-center text-h5 q-mt-xs text-positive' : 'text-center text-h6 q-mt-xs'">
                      {{ monitorCephData.osd_up ? monitorCephData.osd_up : tc('正在获取') }}
                    </div>
                  </q-card>
                </div>
                <div class="col-5 q-mt-sm">
                  <q-card flat bordered class="no-border-radius">
                    <div class="text-center">OSD OUT</div>
                    <div class="text-center text-h6 q-mt-xs">
                      {{ monitorCephData.osd_out ? monitorCephData.osd_out : tc('正在获取') }}
                    </div>
                  </q-card>
                </div>
                <div class="col-5 q-ml-lg q-mt-sm">
                  <q-card flat bordered class="no-border-radius">
                    <div class="text-center">OSD DOWN</div>
                    <div class="text-center text-h6 q-mt-xs">
                      {{ monitorCephData.osd_down ? monitorCephData.osd_down : tc('正在获取') }}
                    </div>
                  </q-card>
                </div>
              </div>
            </div>
          </q-card>
        </div>
        <div class="col-1">
          <q-card flat bordered class="no-border-radius" style="height: 190px">
            <div class="text-center q-mt-xl">
              <div class="text-primary cursor-pointer text-subtitle1" @click="goToGrafana">
                <div>Go To</div>
                <div>Grafana</div>
              </div>
              <div class="q-mt-sm">{{ tc('查看详细信息') }}</div>
            </div>
          </q-card>
        </div>
      </div>
  </div>
</template>

<style lang="scss" scoped>
.StoragePage {
}
</style>
