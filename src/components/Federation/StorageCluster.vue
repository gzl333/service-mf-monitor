<script setup lang="ts">
import { Ref, ref } from 'vue'
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

const cephData: Ref = ref([])
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
  const cephDataArr = []
  let cephLength = 0
  config.query.query = storageQuery[0]
  await monitor.monitor.api.getMonitorCephQuery(config).then((res) => {
    cephLength = res.data.length
  })
  for (let i = 0; i < cephLength; i++) {
    const storageObject: Record<string, string> = {}
    for (const ceph of storageQuery) {
      config.query.query = ceph
      await monitor.monitor.api.getMonitorCephQuery(config).then((res) => {
        if (!storageObject.name) {
          storageObject.name = res.data[i].monitor.name
        }
        if (!storageObject.monitor_unit_id) {
          storageObject.monitor_unit_id = res.data[i].monitor.id
        }
        if (res.data[i].value !== null) {
          storageObject[ceph] = res.data[i].value[1]
        }
      }).catch((error) => {
        console.log(error)
      })
    }
    cephDataArr.push(storageObject)
  }
  return cephDataArr
}
void getStorageQuery(props.unitCeph.id).then((res) => {
  cephData.value = res
})
const refreshGetData = async (monitor_unit_id: string, query: string, itemIndex: number) => {
  const config = {
    query: {
      monitor_unit_id,
      query
    }
  }
  await monitor.monitor.api.getMonitorCephQuery(config).then((res) => {
    if (res.data[itemIndex].value !== null) {
      cephData.value[itemIndex][query] = res.data[itemIndex].value[1]
    }
  })
}
const refresh = async (monitor_unit_id: string, query: string, itemIndex: number) => {
  if (query === 'health_status') {
    isShowHealth.value = false
    void await refreshGetData(monitor_unit_id, query, itemIndex)
    isShowHealth.value = true
  } else if (query === 'cluster_total_bytes') {
    isShowClusterTotal.value = false
    void await refreshGetData(monitor_unit_id, query, itemIndex)
    isShowClusterTotal.value = true
  } else if (query === 'cluster_total_used_bytes') {
    isShowClusterUsed.value = false
    void await refreshGetData(monitor_unit_id, query, itemIndex)
    isShowClusterUsed.value = true
  } else {
    isShowOSD.value = false
    const arr = query.split(',')
    for (const item of arr) {
      void await refreshGetData(monitor_unit_id, item, itemIndex)
    }
    isShowOSD.value = true
  }
}
const intervalRefresh = () => {
  isShowHealth.value = false
  isShowClusterTotal.value = false
  isShowClusterUsed.value = false
  isShowOSD.value = false
  void getStorageQuery(props.unitCeph.id).then((res) => {
    cephData.value = res
    isShowHealth.value = true
    isShowClusterTotal.value = true
    isShowClusterUsed.value = true
    isShowOSD.value = true
    emits('is-emit', true)
  })
}
const goToGrafana = () => {
  window.open(props.unitCeph.grafana_url)
}
defineExpose({ intervalRefresh })
</script>

<template>
  <div class="StorageCluster">
    <div class="q-mt-lg" v-for="(item, index) in cephData" :key="index">
      <div class="text-subtitle1 text-weight-bold">{{ item.name }}</div>
      <div class="row q-col-gutter-xs q-mt-sm">
        <div class="col-6 row q-col-gutter-sm">
          <div class="col-4">
            <q-card flat bordered class="my-card no-border-radius" style="height: 190px">
              <div class="row">
                <div class="col-11 text-center">{{ tc('集群状态') }}</div>
                <q-icon class="col-1" name="loop" size="xs" v-show="isShowHealth"
                        @click="refresh(item.monitor_unit_id,'health_status', index)"/>
              </div>
              <div :class="!item.health_status ? 'text-center text-h4 q-mt-xl' : item.health_status === '0' ? 'text-positive text-center text-h4 text-weight-bold q-mt-xl' : item.health_status === '1' ?
                    'text-warning text-center text-h4 text-weight-bold q-mt-xl' : 'text-negative text-center text-h4 text-weight-bold q-mt-xl'">
                {{ !item.health_status ? tc('暂无数据') : item.health_status === '0' ? 'Healthy' : item.health_status === '1' ? 'Warning' : 'Fatal' }}
              </div>
            </q-card>
          </div>
          <div class="col-4">
            <q-card flat bordered class="q-pb-md no-border-radius" style="height: 190px">
              <div class="row">
                <div class="col-11 text-center">{{ tc('集群容量') }}</div>
                <q-icon name="loop" class="col-1" size="xs" v-show="isShowClusterTotal"
                        @click="refresh(item.monitor_unit_id,'cluster_total_bytes', index)"/>
              </div>
              <div class="text-center text-h4 q-mt-xl">
                {{ !item.cluster_total_bytes ? tc('暂无数据') : (item.cluster_total_bytes / Math.pow(1024, 5)).toFixed(2) + 'PiB' }}
              </div>
            </q-card>
          </div>
          <div class="col-4">
            <q-card flat bordered class="q-pb-md no-border-radius" style="height: 190px">
              <div class="row">
                <div class="col-11 text-center">{{ tc('当前容量') }}</div>
                <q-icon name="loop" class="col-1" size="xs" v-show="isShowClusterUsed"
                        @click="refresh(item.monitor_unit_id,'cluster_total_used_bytes', index)"/>
              </div>
              <div class="text-center text-h4 q-mt-xl">
                {{ !item.cluster_total_used_bytes ? tc('暂无数据') : (item.cluster_total_used_bytes / Math.pow(1024, 4)).toFixed(2) + 'TiB' }}
              </div>
            </q-card>
          </div>
        </div>
        <div class="col-5">
          <q-card flat bordered class="no-border-radius" style="height: 190px">
            <div class="row">
              <div class="col-11 text-center">{{ tc('OSD状态') }}</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="isShowOSD"
                      @click="refresh(item.monitor_unit_id,'osd_in,osd_out,osd_up,osd_down', index)"/>
            </div>
            <div class="row q-ml-md q-mt-md">
              <div class="row col-12 q-ml-md">
                <div class="col-5">
                  <q-card flat bordered class="no-border-radius">
                    <div class="text-center">OSD IN</div>
                    <div :class="!item.osd_in ? 'text-center text-h6 q-mt-xs' : 'text-center text-h5 text-weight-bold text-positive q-mt-xs'">
                      {{ !item.osd_in ? tc('暂无数据') : item.osd_in }}
                    </div>
                  </q-card>
                </div>
                <div class="col-5 q-ml-lg">
                  <q-card flat bordered class="no-border-radius">
                    <div class="text-center">OSD UP</div>
                    <div :class="!item.osd_up ? 'text-center text-h6 q-mt-xs' : 'text-center text-h5 text-weight-bold text-positive q-mt-xs'">
                      {{ !item.osd_up ? tc('暂无数据') : item.osd_up }}
                    </div>
                  </q-card>
                </div>
                <div class="col-5 q-mt-sm">
                  <q-card flat bordered class="no-border-radius">
                    <div class="text-center">OSD OUT</div>
                    <div :class="!item.osd_out ? 'text-center text-h6 q-mt-xs' : 'text-center text-h5 text-weight-bold q-mt-xs'">
                      {{ !item.osd_out ? tc('暂无数据') : item.osd_out }}
                    </div>
                  </q-card>
                </div>
                <div class="col-5 q-ml-lg q-mt-sm">
                  <q-card flat bordered class="no-border-radius">
                    <div class="text-center">OSD DOWN</div>
                    <div :class="!item.osd_down ? 'text-center text-h6 q-mt-xs' : 'text-center text-h5 text-weight-bold q-mt-xs'">
                      {{ !item.osd_down ? tc('暂无数据') : item.osd_down }}
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
  </div>
</template>

<style lang="scss" scoped>
.StoragePage {
}
</style>
