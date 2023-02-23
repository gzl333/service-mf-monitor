<script setup lang="ts">
import LineChart from 'components/Chart/LineChart.vue'
import { i18n } from 'boot/i18n'

const props = defineProps({
  unitServersData: {
    type: Object,
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
console.log('props', props)
// const emits = defineEmits(['is-emit', 'is-back'])
const { tc } = i18n.global
const goToGrafana = () => {
  window.open(props.grafanaUrl)
}
</script>

<template>
  <div class="ServerCluster">
    <div class="row q-mt-sm q-pb-sm justify-around">
      <div class="col-2">
        <q-card flat bordered class="no-border-radius" style="height: 120px; width: 193px">
          <div class="text-center">{{ tc('主机数') }}</div>
          <div v-if="props.unitServersData?.host_count" class="text-center text-h4 q-mt-lg">
            {{ props.unitServersData?.host_count }}
          </div>
          <div v-else class="row justify-center q-mt-lg">
            <q-spinner
              color="primary"
              size="3em"
            />
          </div>
        </q-card>
        <q-card flat bordered class="no-border-radius q-mt-xs" style="height: 85px; width: 193px">
          <div v-if="props.unitServersData?.host_count && props.unitServersData?.host_up_count" class="row" style="height: 85px">
            <div style="width: 95px">
              <div class="text-center">{{ tc('在线') }}</div>
              <div
                :class="props.unitServersData?.host_up_count === '暂无数据' || props.unitServersData?.host_up_count === '获取数据出错' ? 'text-center text-h6 q-mt-sm' : 'text-center text-h5 text-positive q-mt-sm'">
                {{ props.unitServersData?.host_up_count }}
              </div>
            </div>
            <q-separator vertical/>
            <div style="width: 95px">
              <div class="text-center">{{ tc('掉线') }}</div>
              <div
                :class="props.unitServersData?.host_count === '暂无数据' || props.unitServersData?.host_count === '获取数据出错' || props.unitServersData?.host_up_count === '暂无数据' || props.unitServersData?.host_up_count === '获取数据出错' ? 'text-center text-h6 q-mt-sm' : 'text-center text-h5 text-negative q-mt-sm'">
                {{
                  props.unitServersData?.host_count !== '暂无数据' && props.unitServersData?.host_count !== '获取数据出错' && props.unitServersData?.host_up_count !== '暂无数据' && props.unitServersData?.host_up_count !== '获取数据出错' ? (parseFloat(props.unitServersData?.host_count) - parseFloat(props.unitServersData?.host_up_count)) : '暂无数据'
                }}
              </div>
            </div>
          </div>
          <div v-else class="row justify-center q-mt-md">
            <q-spinner
              color="primary"
              size="3em"
            />
          </div>
        </q-card>
      </div>
      <div class="col-2">
        <q-card flat bordered class="no-border-radius" style="height: 209px">
          <div class="text-center">{{ tc('集群状态') }}</div>
          <div v-if="props.unitServersData?.health_status" :class="props.unitServersData?.health_status === '0' ? 'text-positive text-center text-h4 text-weight-bold q-mt-xl' :
            props.unitServersData?.health_status === '1' ? 'text-warning text-center text-h4 text-weight-bold q-mt-xl' : 'text-negative text-center text-h4 text-weight-bold q-mt-xl'">
            {{
              props.unitServersData?.health_status === '0' ? 'Healthy' : props.unitServersData?.health_status === '1' ? 'Warning' : 'Fatal'
            }}
          </div>
          <div v-else class="row justify-center q-mt-xl">
            <q-spinner
              color="primary"
              size="3em"
            />
          </div>
        </q-card>
      </div>
      <div class="col-2">
        <q-card flat bordered class="no-border-radius" style="height: 120px; width: 193px">
          <div class="text-center">{{ tc('平均CPU使用率') }}</div>
          <div v-if="props.unitServersData?.cpu_usage">
            <div class="text-center text-h4 q-mt-md">
              {{
                props.unitServersData?.cpu_usage !== '暂无数据' && props.unitServersData?.cpu_usage !== '获取数据出错' ? (parseFloat(props.unitServersData?.cpu_usage).toFixed(2) + '%') : props.unitServersData?.cpu_usage
              }}
            </div>
            <line-chart
              :chartData="[props.unitServersData?.cpu_usage, props.unitServersData?.min_cpu_usage, props.unitServersData?.max_cpu_usage]"></line-chart>
          </div>
          <div v-else class="row justify-center q-mt-lg">
            <q-spinner
              color="primary"
              size="3em"
            />
          </div>
        </q-card>
        <q-card flat bordered class="q-mt-xs no-border-radius" style="height: 85px; width: 193px">
          <div class="row" style="height: 85px" v-if="props.unitServersData?.max_cpu_usage && props.unitServersData?.min_cpu_usage">
            <div style="width: 95px">
              <div class="text-center">{{ tc('最大') }}</div>
              <div
                :class="props.unitServersData?.max_cpu_usage !== '暂无数据' && props.unitServersData?.max_cpu_usage !== '获取数据出错' ? 'text-center text-h5 q-mt-md' : 'text-center text-h6 q-mt-md'">
                {{
                  props.unitServersData?.max_cpu_usage !== '暂无数据' && props.unitServersData?.max_cpu_usage !== '获取数据出错' ? (parseFloat(props.unitServersData?.max_cpu_usage).toFixed(2) + '%') : props.unitServersData?.max_cpu_usage
                }}
              </div>
            </div>
            <q-separator vertical/>
            <div style="width: 95px">
              <div class="text-center">{{ tc('最小') }}</div>
              <div
                :class="props.unitServersData?.min_cpu_usage !== '暂无数据' && props.unitServersData?.min_cpu_usage !== '获取数据出错' ? 'text-center text-h5 q-mt-md' : 'text-center text-h6 q-mt-md'">
                {{
                  props.unitServersData?.min_cpu_usage !== '暂无数据' && props.unitServersData?.min_cpu_usage !== '获取数据出错' ? (parseFloat(props.unitServersData?.min_cpu_usage).toFixed(2) + '%') : tc(props.unitServersData?.min_cpu_usage)
                }}
              </div>
            </div>
          </div>
          <div v-else class="row justify-center q-mt-md">
            <q-spinner
              color="primary"
              size="3em"
            />
          </div>
        </q-card>
      </div>
      <div class="col-2">
        <q-card flat bordered class="no-border-radius" style="height: 120px; width: 193px">
          <div class="text-center">{{ tc('平均内存使用率') }}</div>
          <div v-if="props.unitServersData?.mem_usage">
            <div class="text-center text-h4 q-mt-md">
              {{
                props.unitServersData?.mem_usage && props.unitServersData?.mem_usage !== '暂无数据' && props.unitServersData?.mem_usage !== '获取数据出错' ? (parseFloat(props.unitServersData?.mem_usage).toFixed(2) + '%') : props.unitServersData?.mem_usage
              }}
            </div>
            <line-chart
              :chartData="[props.unitServersData?.mem_usage, props.unitServersData?.min_mem_usage, props.unitServersData?.max_mem_usage]"></line-chart>
          </div>
          <div v-else class="row justify-center q-mt-lg">
            <q-spinner
              color="primary"
              size="3em"
            />
          </div>
        </q-card>
        <q-card flat bordered class="no-border-radius q-mt-xs" style="height: 85px; width: 193px">
          <div class="row" style="height: 85px"
               v-if="props.unitServersData?.max_mem_usage && props.unitServersData?.min_mem_usage">
            <div style="width: 95px">
              <div class="text-center">{{ tc('最大') }}</div>
              <div
                :class="props.unitServersData?.max_mem_usage !== '暂无数据' && props.unitServersData?.max_mem_usage !== '获取数据出错' ? 'text-center text-h5 q-mt-md' : 'text-center text-h6 q-mt-md'">
                {{
                  props.unitServersData?.max_mem_usage !== '暂无数据' && props.unitServersData?.max_mem_usage !== '获取数据出错' ? (parseFloat(props.unitServersData?.max_mem_usage).toFixed(2) + '%') : tc(props.unitServersData?.max_mem_usage)
                }}
              </div>
            </div>
            <q-separator vertical/>
            <div style="width: 95px">
              <div class="text-center">{{ tc('最小') }}</div>
              <div
                :class="props.unitServersData?.min_mem_usage && props.unitServersData?.min_mem_usage !== '暂无数据' && props.unitServersData?.min_mem_usage !== '获取数据出错' ? 'text-center text-h5 q-mt-md' : 'text-center text-h6 q-mt-md'">
                {{
                  props.unitServersData?.min_mem_usage !== '暂无数据' && props.unitServersData?.min_mem_usage !== '获取数据出错' ? (parseFloat(props.unitServersData?.min_mem_usage).toFixed(2) + '%') : tc(props.unitServersData?.min_mem_usage)
                }}
              </div>
            </div>
          </div>
          <div v-else class="row justify-center q-mt-md">
            <q-spinner
              color="primary"
              size="3em"
            />
          </div>
        </q-card>
      </div>
      <div class="col-2">
        <q-card flat bordered class="no-border-radius" style="height: 120px;width: 193px">
          <div class="text-center">{{ tc('平均硬盘使用率') }}</div>
          <div v-if="props.unitServersData?.disk_usage">
            <div class="text-center text-h4 q-mt-md">
              {{
                props.unitServersData?.disk_usage && props.unitServersData?.disk_usage !== '暂无数据' && props.unitServersData?.disk_usage !== '获取数据出错' ? (parseFloat(props.unitServersData?.disk_usage).toFixed(2) + '%') : props.unitServersData?.disk_usage
              }}
            </div>
            <line-chart
              :chartData="[props.unitServersData?.disk_usage, props.unitServersData?.min_disk_usage, props.unitServersData?.max_disk_usage]"></line-chart>
          </div>
          <div v-else class="row justify-center q-mt-lg">
            <q-spinner
              color="primary"
              size="3em"
            />
          </div>
        </q-card>
        <q-card flat bordered class="no-border-radius q-mt-xs" style="height: 85px; width: 193px">
          <div class="row" style="height: 85px"
               v-if="props.unitServersData?.max_disk_usage && props.unitServersData?.min_disk_usage">
            <div style="width: 95px">
              <div class="text-center">{{ tc('最大') }}</div>
              <div
                :class="props.unitServersData?.max_disk_usage !== '暂无数据' && props.unitServersData?.max_disk_usage !== '获取数据出错' ? 'text-center text-h5 q-mt-md' : 'text-center text-h6 q-mt-md'">
                {{
                  props.unitServersData?.max_disk_usage !== '暂无数据' && props.unitServersData?.max_disk_usage !== '获取数据出错' ? (parseFloat(props.unitServersData?.max_disk_usage).toFixed(2) + '%') : tc(props.unitServersData?.max_disk_usage)
                }}
              </div>
            </div>
            <q-separator vertical/>
            <div style="width: 95px">
              <div class="text-center">{{ tc('最小') }}</div>
              <div
                :class="props.unitServersData?.min_disk_usage !== '暂无数据' && props.unitServersData?.min_disk_usage !== '获取数据出错' ? 'text-center text-h5 q-mt-md' : 'text-center text-h6 q-mt-md'">
                {{
                  props.unitServersData?.min_disk_usage !== '暂无数据' && props.unitServersData?.min_disk_usage !== '获取数据出错' ? (parseFloat(props.unitServersData?.min_disk_usage).toFixed(2) + '%') : tc(props.unitServersData?.min_disk_usage)
                }}
              </div>
            </div>
          </div>
          <div v-else class="row justify-center q-mt-md">
            <q-spinner
              color="primary"
              size="3em"
            />
          </div>
        </q-card>
      </div>
      <div class="col-1">
        <q-card flat bordered class="no-border-radius" style="height: 209px">
          <div class="text-center q-mt-xl">
            <div class="text-primary cursor-pointer" @click="goToGrafana">
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
.ServerCluster {
}
</style>
