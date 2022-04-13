<script setup lang="ts">
import { ref } from 'vue'
import monitor from '../../api/index'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})
const emits = defineEmits(['is-emit'])

const storageData: any = ref([])
const isShowHealth = ref(true)
const isShowClusterTotal = ref(true)
const isShowClusterUsed = ref(true)
const isShowOSD = ref(true)
const getStorageQuery = async (payload: { service_id: string }) => {
  const storageQuery: string[] = ['health_status', 'cluster_total_bytes', 'cluster_total_used_bytes', 'osd_in', 'osd_out', 'osd_up', 'osd_down']
  const config = {
    query: {
      service_id: payload.service_id,
      query: ''
    }
  }
  const hostDataArr = []
  let length = 0
  config.query.query = storageQuery[0]
  await monitor.monitor.api.getMonitorCephQuery(config).then((res) => {
    length = res.data.length
  })
  for (let i = 0; i < length; i++) {
    const storageObject: Record<string, string> = {}
    for (const item of storageQuery) {
      config.query.query = item
      await monitor.monitor.api.getMonitorCephQuery(config).then((res) => {
        if (!storageObject.name) {
          storageObject.name = res.data[i].monitor.name
        }
        if (!storageObject.service_id) {
          storageObject.service_id = res.data[i].monitor.service_id
        }
        if (res.data[i].value !== null) {
          storageObject[item] = res.data[i].value[1]
        }
      }).catch((error) => {
        console.log(error)
      })
    }
    hostDataArr.push(storageObject)
  }
  return hostDataArr
}
void getStorageQuery({ service_id: props.id }).then((res) => {
  storageData.value = res
})
const getData = async (payload: { service_id: string, query: string, num: number }) => {
  const config = {
    query: {
      service_id: payload.service_id,
      query: payload.query
    }
  }
  await monitor.monitor.api.getMonitorCephQuery(config).then((res) => {
    if (res.data[payload.num].value !== null) {
      storageData.value[payload.num][payload.query] = res.data[payload.num].value[1]
    }
  })
}
const refresh = async (payload: { service_id: string, query: string, num: number }) => {
  if (payload.query === 'health_status') {
    isShowHealth.value = false
    void await getData({
      service_id: payload.service_id,
      query: payload.query,
      num: payload.num
    })
    isShowHealth.value = true
  } else if (payload.query === 'cluster_total_bytes') {
    isShowClusterTotal.value = false
    void await getData({
      service_id: payload.service_id,
      query: payload.query,
      num: payload.num
    })
    isShowClusterTotal.value = true
  } else if (payload.query === 'cluster_total_used_bytes') {
    isShowClusterUsed.value = false
    void await getData({
      service_id: payload.service_id,
      query: payload.query,
      num: payload.num
    })
    isShowClusterUsed.value = true
  } else {
    isShowOSD.value = false
    const arr = payload.query.split(',')
    for (const item of arr) {
      void await getData({
        service_id: payload.service_id,
        query: item,
        num: payload.num
      })
    }
    isShowOSD.value = true
  }
}
const intervalRefresh = () => {
  isShowHealth.value = false
  isShowClusterTotal.value = false
  isShowClusterUsed.value = false
  isShowOSD.value = false
  void getStorageQuery({ service_id: props.id }).then((res) => {
    storageData.value = res
    isShowHealth.value = true
    isShowClusterTotal.value = true
    isShowClusterUsed.value = true
    isShowOSD.value = true
    emits('is-emit', true)
  })
}
defineExpose({ intervalRefresh })
</script>

<template>
  <div class="StorageCluster">
    <div class="q-mt-md" v-for="(item, index) in storageData" :key="index">
      <div class="text-subtitle1 text-weight-bold">{{ item.name }}</div>
      <div class="row q-col-gutter-xs">
        <div class="col-6 row q-col-gutter-sm">
          <div class="col-4">
            <q-card flat bordered class="my-card q-pb-md no-border-radius">
              <div class="row">
                <div class="col-11 text-center">集群状态</div>
                <q-icon class="col-1" name="loop" size="xs" v-show="isShowHealth"
                        @click="refresh({ service_id: item.service_id, query: 'health_status', num: index })"/>
              </div>
              <div :class="!item.health_status ? 'text-center text-h4 q-mt-xl q-pb-xl' : item.health_status === '0' ? 'text-positive text-center text-h4 text-weight-bold q-mt-xl q-pb-xl' : item.health_status === '1' ?
                    'text-warning text-center text-h4 text-weight-bold q-mt-xl q-pb-xl' : 'text-negative text-center text-h4 text-weight-bold q-mt-xl q-pb-xl'">
                {{ !item.health_status ? '暂无数据' : item.health_status === '0' ? 'Healthy' : item.health_status === '1' ? 'Warning' : 'Fatal' }}
              </div>
            </q-card>
          </div>
          <div class="col-4">
            <q-card flat bordered class="q-pb-md no-border-radius">
              <div class="row">
                <div class="col-11 text-center">集群容量</div>
                <q-icon name="loop" class="col-1" size="xs" v-show="isShowClusterTotal"
                        @click="refresh({ service_id: item.service_id, query: 'cluster_total_bytes', num: index })"/>
              </div>
              <div class="text-center text-h4 q-mt-xl q-pb-xl">
                {{ !item.cluster_total_bytes ? '暂无数据' : (item.cluster_total_bytes / Math.pow(1024, 5)).toFixed(2) + 'PiB' }}
              </div>
            </q-card>
          </div>
          <div class="col-4">
            <q-card flat bordered class="q-pb-md no-border-radius">
              <div class="row">
                <div class="col-11 text-center">当前容量</div>
                <q-icon name="loop" class="col-1" size="xs" v-show="isShowClusterUsed"
                        @click="refresh({ service_id: item.service_id, query: 'cluster_total_used_bytes', num: index })"/>
              </div>
              <div class="text-center text-h4 q-mt-xl q-pb-xl">
                {{ !item.cluster_total_used_bytes ? '暂无数据' : (item.cluster_total_used_bytes / Math.pow(1024, 4)).toFixed(2) + 'TiB' }}
              </div>
            </q-card>
          </div>
        </div>
        <div class="col-5">
          <q-card flat bordered class="no-border-radius q-pb-sm">
            <div class="row q-pb-xs">
              <div class="col-11 text-center">OSD状态</div>
              <q-icon name="loop" class="col-1" size="xs" v-show="isShowOSD"
                      @click="refresh({ service_id: item.service_id, query: 'osd_in,osd_out,osd_up,osd_down', num: index })"/>
            </div>
            <div class="row q-ml-md q-mt-xs q-pb-xs">
              <div class="row col-12 q-ml-md q-pb-sm">
                <div class="col-5">
                  <q-card flat bordered class="no-border-radius">
                    <div class="text-center">OSD IN</div>
                    <div :class="!item.osd_in ? 'text-center text-h6 q-mt-xs' : 'text-center text-h5 text-weight-bold text-positive q-mt-xs'">
                      {{ !item.osd_in ? '暂无数据' : item.osd_in }}
                    </div>
                  </q-card>
                </div>
                <div class="col-5 q-ml-lg">
                  <q-card flat bordered class="no-border-radius">
                    <div class="text-center">OSD UP</div>
                    <div :class="!item.osd_up ? 'text-center text-h6 q-mt-xs' : 'text-center text-h5 text-weight-bold text-positive q-mt-xs'">
                      {{ !item.osd_up ? '暂无数据' : item.osd_up }}
                    </div>
                  </q-card>
                </div>
                <div class="col-5 q-mt-sm">
                  <q-card flat bordered class="no-border-radius">
                    <div class="text-center">OSD OUT</div>
                    <div :class="!item.osd_out ? 'text-center text-h6 q-mt-xs' : 'text-center text-h5 text-weight-bold q-mt-xs'">
                      {{ !item.osd_out ? '暂无数据' : item.osd_out }}
                    </div>
                  </q-card>
                </div>
                <div class="col-5 q-ml-lg q-mt-sm">
                  <q-card flat bordered class="no-border-radius">
                    <div class="text-center">OSD DOWN</div>
                    <div :class="!item.osd_down ? 'text-center text-h6 q-mt-xs' : 'text-center text-h5 text-weight-bold q-mt-xs'">
                      {{ !item.osd_down ? '暂无数据' : item.osd_down }}
                    </div>
                  </q-card>
                </div>
              </div>
            </div>
          </q-card>
        </div>
        <div class="col-1">
          <q-card flat bordered class="no-border-radius q-pb-sm">
            <div class="text-center q-mt-lg q-pb-lg">
              <p class="text-primary text-h6">Go To Grafana</p>
              <p class="text-h7">详细信息</p>
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
