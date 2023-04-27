<script setup lang="ts">
// import { ref } from 'vue'
import { i18n } from 'boot/i18n'

// interface MonitorInterface {
//   creation: string
//   id: string
//   job_tag: string
//   name: string
//   name_en: string
// }
//
// interface MetricInterface {
//   group_type: string
//   instance: string
//   job: string
//   receive_cluster: string
//   receive_replica: string
//   tenant_id: string
//   type?: string
//   __name__: string
// }

// interface DetailInterface {
//   metric: MetricInterface
//   monitor: MonitorInterface
//   value: [number, string]
// }

interface UnitTidbInterface {
  connections_count: any[]
  current_storage_size: any[]
  pd_nodes: any[]
  qps: any[]
  region_count: any[]
  region_health: any
  server_cpu_usage: any[]
  server_cpu_usage_max: string
  server_disk_usage: any[]
  server_disk_usage_max: string
  server_mem_usage: any[]
  server_mem_usage_max: string
  storage: any[]
  storage_capacity: any[]
  tidb_nodes: any[]
  tikv_nodes: any[]
  totalConnect: number
  totalQbs: number
}

const props = defineProps({
  unitServersData: {
    type: Object as () => UnitTidbInterface,
    required: false
  }
})
// const emits = defineEmits(['is-emit', 'is-back'])
const { tc } = i18n.global
</script>

<template>
  <div class="ServerCluster">
    <div class="q-pt-md q-pb-lg">
      <div class="row justify-between" style="height: 140px">
        <q-card flat class="my-card col-2 text-center no-border-radius edgeBorder">
          <q-card-section>
            <div class="text-subtitle1">{{ tc('pd节点') }}</div>
          </q-card-section>
          <q-card-section class="q-pt-xs">
            <div v-if="props.unitServersData?.pd_nodes">
              <div v-if="props.unitServersData?.pd_nodes.length > 0" class="text-h4">
                <span
                  :class="props.unitServersData?.pd_nodes.filter(item => item.value[1] === '1').length === props.unitServersData?.pd_nodes.length ? '' : 'text-negative'">{{ props.unitServersData?.pd_nodes.filter(item => item.value[1] === '1').length }}</span>
                <span>{{ '/' + props.unitServersData?.pd_nodes.length }}</span>
              </div>
              <div v-else class="text-h5">
                {{ tc('暂无数据') }}
              </div>
            </div>
            <div v-else class="row justify-center q-mt-xs">
              <q-spinner
                color="primary"
                size="2em"
              />
            </div>
          </q-card-section>
          <q-tooltip class="bg-white" anchor="center right" self="center left" :offset="[10, 10]">
            <q-card class="my-card text-black">
              <q-card-section v-for="(item, index) in props.unitServersData?.pd_nodes" :key="index">
                <span class="text-grey-8">{{ tc('实例') }}：</span>
                <span>{{ item.metric.instance }}</span>
                <span class="q-ml-md text-grey-8">{{ tc('状态') }}：</span>
                <span
                  :class="item.value[1] === '1' ? 'text-weight-bold text-positive' : 'text-weight-bold text-negative' ">{{
                    item.value[1] === '1' ? tc('正常') : tc('异常')
                  }}</span>
              </q-card-section>
            </q-card>
          </q-tooltip>
        </q-card>
        <q-card flat class="my-card col-2 text-center no-border-radius boxLeftBorder">
          <q-card-section>
            <div class="text-subtitle1">{{ tc('tidb节点') }}</div>
          </q-card-section>
          <q-card-section class="q-pt-xs">
            <div v-if="props.unitServersData?.tidb_nodes">
              <div v-if="props.unitServersData?.tidb_nodes.length > 0" class="text-h4">
                <span
                  :class="props.unitServersData?.tidb_nodes.filter(item => item.value[1] === '1').length === props.unitServersData?.tidb_nodes.length ? '' : 'text-negative'">{{ props.unitServersData?.tidb_nodes.filter(item => item.value[1] === '1').length }}</span>
                <span>{{ '/' + props.unitServersData?.tidb_nodes.length }}</span>
              </div>
              <div v-else class="text-h5">
                {{ tc('暂无数据') }}
              </div>
            </div>
            <div v-else class="row justify-center q-mt-xs">
              <q-spinner
                color="primary"
                size="2em"
              />
            </div>
          </q-card-section>
          <q-tooltip class="bg-white" anchor="center right" self="center left" :offset="[10, 10]">
            <q-card class="my-card text-black">
              <q-card-section v-for="(item, index) in props.unitServersData?.tidb_nodes" :key="index">
                <span class="text-grey-8">{{ tc('实例') }}：</span>
                <span>{{ item.metric.instance }}</span>
                <span class="q-ml-md text-grey-8">{{ tc('状态') }}：</span>
                <span
                  :class="item.value[1] === '1' ? 'text-weight-bold text-positive' : 'text-weight-bold text-negative' ">{{
                    item.value[1] === '1' ? tc('正常') : tc('异常')
                  }}</span>
              </q-card-section>
            </q-card>
          </q-tooltip>
        </q-card>
        <q-card flat class="my-card col-2 text-center no-border-radius boxLeftBorder">
          <q-card-section>
            <div class="text-subtitle1">{{ tc('tikv节点') }}</div>
          </q-card-section>
          <q-card-section class="q-pt-xs">
            <div class="text-h4" v-if="props.unitServersData?.tikv_nodes">
              <div v-if="props.unitServersData?.tikv_nodes.length > 0" class="text-h4">
                <span
                  :class="props.unitServersData?.tikv_nodes.filter(item => item.value[1] === '1').length === props.unitServersData?.tikv_nodes.length ? '' : 'text-negative'">{{ props.unitServersData?.tikv_nodes.filter(item => item.value[1] === '1').length }}</span>
                <span>{{ '/' + props.unitServersData?.tikv_nodes.length }}</span>
              </div>
              <div v-else class="text-h5">
                {{ tc('暂无数据') }}
              </div>
            </div>
            <div v-else class="row justify-center q-mt-xs">
              <q-spinner
                color="primary"
                size="2em"
              />
            </div>
          </q-card-section>
          <q-tooltip class="bg-white" anchor="center right" self="center left" :offset="[10, 10]">
            <q-card class="my-card text-black">
              <q-card-section v-for="(item, index) in props.unitServersData?.tikv_nodes" :key="index">
                <span class="text-grey-8">{{ tc('实例') }}：</span>
                <span>{{ item.metric.instance }}</span>
                <span class="q-ml-md text-grey-8">{{ tc('状态') }}：</span>
                <span
                  :class="item.value[1] === '1' ? 'text-weight-bold text-positive' : 'text-weight-bold text-negative' ">{{
                    item.value[1] === '1' ? tc('正常') : tc('异常')
                  }}</span>
              </q-card-section>
            </q-card>
          </q-tooltip>
        </q-card>
        <q-card flat class="my-card col-6 no-border-radius boxLeftBorder">
          <q-card-section>
            <div class="text-subtitle1 text-center">Region Health</div>
          </q-card-section>
          <div v-if="props.unitServersData?.region_count && props.unitServersData?.region_health" class="text-center">
            <div
              v-if="props.unitServersData?.region_count.length > 0 && props.unitServersData?.region_health.length > 0"
              class="row">
              <div class="col">
                <div class="text-h5 text-positive">{{ props.unitServersData?.region_count[0].value[1] }}</div>
                <div>good</div>
              </div>
              <div class="col">
                <div :class="props.unitServersData?.region_health.find(item => item.metric.type.includes('down')).value[1] === '0' ? 'text-h5 text-positive' : 'text-h5 text-negative'">
                  {{ props.unitServersData?.region_health.find(item => item.metric.type.includes('down')).value[1] }}
                </div>
                <div>down</div>
              </div>
              <div class="col">
                <div :class="props.unitServersData?.region_health.find(item => item.metric.type.includes('empty')).value[1] === '0' ? 'text-h5 text-positive' : 'text-h5 text-negative'">
                  {{ props.unitServersData?.region_health.find(item => item.metric.type.includes('empty')).value[1] }}
                </div>
                <div>empty</div>
              </div>
              <div class="col">
                <div :class="props.unitServersData?.region_health.find(item => item.metric.type.includes('extra')).value[1] === '0' ? 'text-h5 text-positive' : 'text-h5 text-negative'">
                  {{ props.unitServersData?.region_health.find(item => item.metric.type.includes('extra')).value[1] }}
                </div>
                <div>extra</div>
              </div>
              <div class="col">
                <div :class="props.unitServersData?.region_health.find(item => item.metric.type.includes('miss')).value[1] === '0' ? 'text-h5 text-positive' : 'text-h5 text-negative'">
                  {{ props.unitServersData?.region_health.find(item => item.metric.type.includes('miss')).value[1] }}
                </div>
                <div>miss</div>
              </div>
              <div class="col">
                <div :class="props.unitServersData?.region_health.find(item => item.metric.type.includes('pending')).value[1] === '0' ? 'text-h5 text-positive' : 'text-h5 text-negative'">
                  {{ props.unitServersData?.region_health.find(item => item.metric.type.includes('pending')).value[1] }}
                </div>
                <div>pending</div>
              </div>
              <div class="col">
                <div :class="props.unitServersData?.region_health.find(item => item.metric.type.includes('oversized')).value[1] === '0' ? 'text-h5 text-positive' : 'text-h5 text-negative'">{{
                    props.unitServersData?.region_health.find(item => item.metric.type.includes('oversized')).value[1]
                  }}
                </div>
                <div>oversized</div>
              </div>
            </div>
            <div v-else class="text-h5">
              {{ tc('暂无数据') }}
            </div>
          </div>
          <div v-else class="row justify-center q-mt-xs">
            <q-spinner
              color="primary"
              size="2em"
            />
          </div>
        </q-card>
      </div>
      <div class="row justify-between q-mt-sm" style="height: 140px">
        <q-card flat class="my-card col-2 text-center no-border-radius edgeBorder">
          <q-card-section>
            <div class="text-subtitle1">{{ tc('集群存储容量') }}</div>
          </q-card-section>
          <q-card-section>
            <div v-if="props.unitServersData?.storage_capacity && props.unitServersData?.current_storage_size">
              <div
                v-if="props.unitServersData?.storage_capacity.length > 0 && props.unitServersData?.current_storage_size.length > 0"
                class="row justify-between">
                <div>
                  <div class="text-h5">
                    {{ (props.unitServersData?.storage_capacity[0].value[1] / 1024 / 1024 / 1024 / 1024).toFixed(2) }}TB
                  </div>
                  <div>total</div>
                </div>
                <div>
                  <div class="text-h5 text-positive">
                    {{ (props.unitServersData?.current_storage_size[0].value[1] / 1024 / 1024 / 1024).toFixed(2) }}GB
                  </div>
                  <div>current</div>
                </div>
              </div>
              <div v-else class="text-h5">
                {{ tc('暂无数据') }}
              </div>
            </div>
            <div v-else class="row justify-center q-mt-xs">
              <q-spinner
                color="primary"
                size="2em"
              />
            </div>
          </q-card-section>
        </q-card>
        <q-card flat class="my-card col-2 text-center no-border-radius boxLeftBorder">
          <q-card-section>
            <div class="text-subtitle1">{{ tc('连接数') }}</div>
          </q-card-section>
          <q-card-section>
            <div v-if="props.unitServersData?.connections_count">
              <div v-if="props.unitServersData?.connections_count.length > 0">
                <div class="text-h5 text-positive">
                  {{ props.unitServersData?.totalConnect }}
                </div>
                <div>current</div>
              </div>
              <div v-else class="text-h5">
                {{ tc('暂无数据') }}
              </div>
            </div>
            <div v-else class="row justify-center q-mt-xs">
              <q-spinner
                color="primary"
                size="2em"
              />
            </div>
          </q-card-section>
          <q-tooltip class="bg-white" anchor="center right" self="center left" :offset="[10, 10]">
            <q-card class="my-card text-black">
              <q-card-section v-for="(item, index) in props.unitServersData?.connections_count" :key="index">
                <span class="text-grey-8">{{ tc('实例') }}：</span>
                <span>{{ item.metric.instance }}</span>
                <span class="q-ml-md text-grey-8">{{ tc('连接数') }}：</span>
                <span class="text-weight-bold">{{ item.value[1] }}</span>
              </q-card-section>
            </q-card>
          </q-tooltip>
        </q-card>
        <q-card flat class="my-card col-2 text-center no-border-radius boxLeftBorder">
          <q-card-section>
            <div class="text-subtitle1">QPS</div>
          </q-card-section>
          <q-card-section>
            <div v-if="props.unitServersData?.qps">
              <div v-if="props.unitServersData?.qps.length > 0">
                <div class="text-h5">
                  {{ props.unitServersData?.totalQbs }}
                </div>
                <div>current</div>
              </div>
              <div v-else class="text-h5">
                {{ tc('暂无数据') }}
              </div>
            </div>
            <div v-else class="row justify-center q-mt-xs">
              <q-spinner
                color="primary"
                size="2em"
              />
            </div>
          </q-card-section>
          <q-tooltip class="bg-white" anchor="center right" self="center left" :offset="[10, 10]">
            <q-card class="my-card text-black">
              <div v-for="(item, index) in props.unitServersData?.qps" :key="index" class="q-py-sm q-px-md">
                <span class="text-grey-8">{{ tc('类别') }}：</span>
                <span>{{ item.metric.type }}</span>
                <span class="q-ml-md text-grey-9">{{ tc('每秒请求数') }}：</span>
                <span class="text-weight-bold">{{ Math.round(item.value[1]) }}</span>
              </div>
            </q-card>
          </q-tooltip>
        </q-card>
        <q-card flat class="my-card col-2 text-center no-border-radius boxLeftBorder">
          <q-card-section class="row justify-between text-subtitle1">
            <div>{{ tc('主机CPU利用率') }}</div>
            <div>MAX</div>
          </q-card-section>
          <q-card-section>
            <div v-if="props.unitServersData?.server_cpu_usage">
              <div v-if="props.unitServersData?.server_cpu_usage.length > 0">
                <div class="text-h5">
                  {{ props.unitServersData?.server_cpu_usage_max }}%
                </div>
                <div>current</div>
              </div>
              <div v-else class="text-h5">
                {{ tc('暂无数据') }}
              </div>
            </div>
            <div v-else class="row justify-center q-mt-xs">
              <q-spinner
                color="primary"
                size="2em"
              />
            </div>
          </q-card-section>
          <q-tooltip class="bg-white" anchor="center right" self="center left" :offset="[10, 10]">
            <q-card class="my-card text-black">
              <q-card-section v-for="(item, index) in props.unitServersData?.server_cpu_usage" :key="index">
                <span class="text-grey-8">{{ tc('实例') }}：</span>
                <span>{{ item.metric.instance }}</span>
                <span class="q-ml-md text-grey-8">{{ tc('利用率') }}：</span>
                <span class="text-weight-bold">{{ Number(item.value[1]).toFixed(2) }}%</span>
              </q-card-section>
            </q-card>
          </q-tooltip>
        </q-card>
        <q-card flat class="my-card col-2 text-center no-border-radius boxLeftBorder">
          <q-card-section class="row justify-between text-subtitle1">
            <div>{{ tc('主机内存利用率') }}</div>
            <div>MAX</div>
          </q-card-section>
          <q-card-section>
            <div v-if="props.unitServersData?.server_mem_usage">
              <div v-if="props.unitServersData?.server_mem_usage.length > 0">
                <div class="text-h5">
                  {{ props.unitServersData?.server_mem_usage_max }}%
                </div>
                <div>current</div>
              </div>
              <div v-else class="text-h5">
                {{ tc('暂无数据') }}
              </div>
            </div>
            <div v-else class="row justify-center q-mt-xs">
              <q-spinner
                color="primary"
                size="2em"
              />
            </div>
          </q-card-section>
          <q-tooltip class="bg-white" anchor="center right" self="center left" :offset="[10, 10]">
            <q-card class="my-card text-black">
              <q-card-section v-for="(item, index) in props.unitServersData?.server_mem_usage" :key="index">
                <span class="text-grey-8">{{ tc('实例') }}：</span>
                <span>{{ item.metric.instance }}</span>
                <span class="q-ml-md text-grey-8">{{ tc('利用率') }}：</span>
                <span class="text-weight-bold">{{ Number(item.value[1]).toFixed(2) }}%</span>
              </q-card-section>
            </q-card>
          </q-tooltip>
        </q-card>
        <q-card flat class="my-card col-2 text-center no-border-radius boxLeftBorder">
          <q-card-section class="row justify-between text-subtitle1">
            <div>{{ tc('主机磁盘利用率') }}</div>
            <div>MAX</div>
          </q-card-section>
          <q-card-section>
            <div v-if="props.unitServersData?.server_disk_usage">
              <div v-if="props.unitServersData?.server_disk_usage.length > 0">
                <div class="text-h5">
                  {{ props.unitServersData?.server_disk_usage_max }}%
                </div>
                <div>current</div>
              </div>
              <div v-else class="text-h5">
                {{ tc('暂无数据') }}
              </div>
            </div>
            <div v-else class="row justify-center q-mt-xs">
              <q-spinner
                color="primary"
                size="2em"
              />
            </div>
          </q-card-section>
          <q-tooltip class="bg-white" anchor="bottom middle" self="center left">
            <q-card class="my-card text-black">
              <q-card-section v-for="(item, index) in props.unitServersData?.server_disk_usage" :key="index">
                <span class="text-grey-8">{{ tc('实例') }}：</span>
                <span>{{ item.metric.instance }}</span>
                <span class="q-ml-md text-grey-8">{{ tc('利用率') }}：</span>
                <span class="text-weight-bold">{{ Number(item.value[1]).toFixed(2) }}%</span>
              </q-card-section>
            </q-card>
          </q-tooltip>
        </q-card>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ServerCluster {
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

  .edgeBorder {
    border-top: 1px solid #DDDDDD;
    border-bottom: 1px solid #DDDDDD;
  }
}
</style>
