<script setup lang="ts">
import { i18n } from 'boot/i18n'

interface UnitCephInterface {
  cluster_total_bytes: string
  cluster_total_used_bytes: string
  health_status: string
  osd_down: string
  osd_in: string
  osd_out: string
  osd_up: string
}

const props = defineProps({
  unitCephData: {
    type: Object as () => UnitCephInterface,
    required: false
  },
  unitId: {
    type: String,
    required: false
  },
  grafanaUrl: {
    type: String,
    required: false
  }
})

// const emits = defineEmits(['is-emit'])
const { tc } = i18n.global
// const goToGrafana = () => {
//   window.open(props.grafanaUrl)
// }
</script>

<template>
  <div class="CephCluster">
    <div class="row justify-between q-pb-sm">
        <div class="col-6 row q-col-gutter-xs">
          <div class="col">
            <q-card flat class="my-card no-border-radius boxRightBorder" style="height: 190px">
              <div class="text-center">{{ tc('集群状态') }}</div>
              <div v-if="props.unitCephData?.health_status" :class="props.unitCephData?.health_status === '0' ? 'text-positive text-center text-h4 text-weight-bold q-mt-xl' : props.unitCephData?.health_status === '1' ?
                    'text-warning text-center text-h4 text-weight-bold q-mt-xl' : 'text-negative text-center text-h4 text-weight-bold q-mt-xl'">
                {{ props.unitCephData?.health_status === '0' ? 'Healthy' : props.unitCephData?.health_status === '1' ? 'Warning' : 'Fatal' }}
              </div>
              <div v-else class="row justify-center q-mt-xl">
                <q-spinner
                  color="primary"
                  size="3em"
                />
              </div>
            </q-card>
          </div>
          <div class="col">
            <q-card flat bordered class="no-border-radius" style="height: 190px">
              <div class="text-center">{{ tc('集群容量') }}</div>
              <div v-if="props.unitCephData?.cluster_total_bytes" class="text-center text-h4 q-mt-xl">
                {{ props.unitCephData?.cluster_total_bytes !== '暂无数据' && props.unitCephData?.cluster_total_bytes !== '获取数据出错' ? (props.unitCephData?.cluster_total_bytes / Math.pow(1024, 5)).toFixed(2) + 'PiB' : props.unitCephData?.cluster_total_bytes }}
              </div>
              <div v-else class="row justify-center q-mt-xl">
                <q-spinner
                  color="primary"
                  size="3em"
                />
              </div>
            </q-card>
          </div>
          <div class="col">
            <q-card flat bordered class="no-border-radius" style="height: 190px">
              <div class="text-center">{{ tc('当前容量') }}</div>
              <div v-if="props.unitCephData?.cluster_total_used_bytes" class="text-center text-h4 q-mt-xl">
                {{ props.unitCephData?.cluster_total_used_bytes !== '暂无数据' && props.unitCephData?.cluster_total_used_bytes !== '获取数据出错' ? (props.unitCephData?.cluster_total_used_bytes / Math.pow(1024, 4)).toFixed(2) + 'TiB' : tc(props.unitCephData?.cluster_total_used_bytes) }}
              </div>
              <div v-else class="row justify-center q-mt-xl">
                <q-spinner
                  color="primary"
                  size="3em"
                />
              </div>
            </q-card>
          </div>
        </div>
        <div class="col-6">
          <q-card flat class="no-border-radius boxLeftBorder" style="height: 190px">
            <div class="text-center">{{ tc('OSD状态') }}</div>
            <div class="row justify-evenly q-mt-md">
              <q-card flat bordered class="col-5 no-border-radius" style="height: 60px">
                <div class="text-center">OSD IN</div>
                <div v-if="props.unitCephData?.osd_in" :class="props.unitCephData?.osd_in !== '暂无数据' && props.unitCephData?.osd_in !== '获取数据出错' ? 'text-center text-h5 q-mt-xs text-positive' : 'text-center text-h6 q-mt-xs'">
                  {{ props.unitCephData?.osd_in }}
                </div>
                <div v-else class="row justify-center q-mt-xs">
                  <q-spinner
                    color="primary"
                    size="2em"
                  />
                </div>
              </q-card>
              <q-card flat bordered class="col-5 no-border-radius" style="height: 60px">
                <div class="text-center">OSD UP</div>
                <div v-if="props.unitCephData?.osd_up" :class="props.unitCephData?.osd_up !== '暂无数据' && props.unitCephData?.osd_up !== '获取数据出错' ? 'text-center text-h5 q-mt-xs text-positive' : 'text-center text-h6 q-mt-xs'">
                  {{ props.unitCephData?.osd_up }}
                </div>
                <div v-else class="row justify-center q-mt-xs">
                  <q-spinner
                    color="primary"
                    size="2em"
                  />
                </div>
              </q-card>
              <q-card flat bordered class="col-5 q-mt-sm no-border-radius" style="height: 60px">
                <div class="text-center">OSD OUT</div>
                <div v-if="props.unitCephData?.osd_out" class="text-center text-h5 q-mt-xs">
                  {{ props.unitCephData?.osd_out }}
                </div>
                <div v-else class="row justify-center q-mt-xs">
                  <q-spinner
                    color="primary"
                    size="2em"
                  />
                </div>
              </q-card>
              <q-card flat bordered class="col-5 q-mt-sm no-border-radius" style="height: 60px">
                <div class="text-center">OSD DOWN</div>
                <div v-if="props.unitCephData?.osd_down" class="text-center text-h5 q-mt-xs">
                  {{ props.unitCephData?.osd_down }}
                </div>
                <div v-else class="row justify-center q-mt-xs">
                  <q-spinner
                    color="primary"
                    size="2em"
                  />
                </div>
              </q-card>
            </div>
          </q-card>
        </div>
<!--        <div class="col-1">-->
<!--          <q-card flat class="no-border-radius boxLeftBorder" style="height: 190px">-->
<!--            <div class="text-center q-mt-xl">-->
<!--              <div class="text-primary cursor-pointer text-subtitle1" @click="goToGrafana">-->
<!--                <div>Go To</div>-->
<!--                <div>Grafana</div>-->
<!--              </div>-->
<!--              <div class="q-mt-sm">{{ tc('查看详细信息') }}</div>-->
<!--            </div>-->
<!--          </q-card>-->
<!--        </div>-->
      </div>
  </div>
</template>

<style lang="scss" scoped>
.CephCluster {
  .boxRightBorder {
    border-top: 1px solid #DDDDDD;
    border-bottom: 1px solid #DDDDDD;
    border-right: 1px solid #DDDDDD;
  }
  .boxLeftBorder {
    border-top: 1px solid #DDDDDD;
    border-bottom: 1px solid #DDDDDD;
    border-left: 1px solid #DDDDDD;
  }
}
</style>
