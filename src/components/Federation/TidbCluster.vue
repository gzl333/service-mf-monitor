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
// const emits = defineEmits(['is-emit', 'is-back'])
const { tc } = i18n.global
const goToGrafana = () => {
  window.open(props.grafanaUrl)
}
</script>

<template>
  <div class="ServerCluster">
    <div class="row q-mt-sm q-pb-sm q-gutter-x-xs">
      <div class="col">
        <q-card flat class="no-border-radius boxRightBorder" style="height: 120px">
          <div class="text-center">{{ tc('pd节点') }}</div>
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
        <q-card flat class="no-border-radius q-mt-xs row boxRightBorder" style="height: 85px">
            <div class="col">
              <div class="text-center">{{ tc('tidb节点') }}</div>
              <div v-if="props.unitServersData?.host_up_count"
                :class="props.unitServersData?.host_up_count === '暂无数据' || props.unitServersData?.host_up_count === '获取数据出错' ? 'text-center text-h6 q-mt-sm' : 'text-center text-h5 text-positive q-mt-sm'">
                {{ props.unitServersData?.host_up_count }}
              </div>
              <div v-else class="row justify-center q-mt-sm">
                <q-spinner
                  color="primary"
                  size="3em"
                />
              </div>
            </div>
            <q-separator vertical/>
            <div class="col">
              <div class="text-center">{{ tc('tivk节点') }}</div>
              <div v-if="props.unitServersData?.host_count && props.unitServersData?.host_up_count"
                :class="props.unitServersData?.host_count === '暂无数据' || props.unitServersData?.host_count === '获取数据出错' || props.unitServersData?.host_up_count === '暂无数据' || props.unitServersData?.host_up_count === '获取数据出错' ? 'text-center text-h6 q-mt-sm' : 'text-center text-h5 text-negative q-mt-sm'">
                {{
                  props.unitServersData?.host_count !== '暂无数据' && props.unitServersData?.host_count !== '获取数据出错' && props.unitServersData?.host_up_count !== '暂无数据' && props.unitServersData?.host_up_count !== '获取数据出错' ? (parseFloat(props.unitServersData?.host_count) - parseFloat(props.unitServersData?.host_up_count)) : '暂无数据'
                }}
              </div>
              <div v-else class="row justify-center q-mt-sm">
                <q-spinner
                  color="primary"
                  size="3em"
                />
              </div>
            </div>
        </q-card>
      </div>
      <div class="col">
        <q-card flat bordered class="no-border-radius" style="height: 103px">
          <div class="text-center">{{ tc('连接数') }}</div>
          <div v-if="props.unitServersData?.health_status" :class="props.unitServersData?.health_status === '0' ? 'text-positive text-center text-h4 text-weight-bold q-mt-xl' :
            props.unitServersData?.health_status === '1' ? 'text-warning text-center text-h4 text-weight-bold q-mt-xl' : 'text-negative text-center text-h4 text-weight-bold q-mt-xl'">
            {{
              props.unitServersData?.health_status === '0' ? 'Healthy' : props.unitServersData?.health_status === '1' ? 'Warning' : 'Fatal'
            }}
          </div>
          <div v-else class="row justify-center q-mt-md">
            <q-spinner
              color="primary"
              size="3em"
            />
          </div>
        </q-card>
        <q-card flat bordered class="no-border-radius q-mt-xs" style="height: 103px">
          <div class="text-center">{{ tc('每秒请求数') }}</div>
          <div v-if="props.unitServersData?.health_status" :class="props.unitServersData?.health_status === '0' ? 'text-positive text-center text-h4 text-weight-bold q-mt-xl' :
            props.unitServersData?.health_status === '1' ? 'text-warning text-center text-h4 text-weight-bold q-mt-xl' : 'text-negative text-center text-h4 text-weight-bold q-mt-xl'">
            {{
              props.unitServersData?.health_status === '0' ? 'Healthy' : props.unitServersData?.health_status === '1' ? 'Warning' : 'Fatal'
            }}
          </div>
          <div v-else class="row justify-center q-mt-md">
            <q-spinner
              color="primary"
              size="3em"
            />
          </div>
        </q-card>
      </div>
      <div class="col">
        <q-card flat bordered class="no-border-radius" style="height: 103px">
          <div class="text-center">{{ tc('副本数量') }}</div>
          <div v-if="props.unitServersData?.health_status" :class="props.unitServersData?.health_status === '0' ? 'text-positive text-center text-h4 text-weight-bold q-mt-xl' :
            props.unitServersData?.health_status === '1' ? 'text-warning text-center text-h4 text-weight-bold q-mt-xl' : 'text-negative text-center text-h4 text-weight-bold q-mt-xl'">
            {{
              props.unitServersData?.health_status === '0' ? 'Healthy' : props.unitServersData?.health_status === '1' ? 'Warning' : 'Fatal'
            }}
          </div>
          <div v-else class="row justify-center q-mt-md">
            <q-spinner
              color="primary"
              size="3em"
            />
          </div>
        </q-card>
        <q-card flat bordered class="no-border-radius q-mt-xs" style="height: 103px">
          <div class="text-center">{{ tc('副本状态') }}</div>
          <div v-if="props.unitServersData?.health_status" :class="props.unitServersData?.health_status === '0' ? 'text-positive text-center text-h4 text-weight-bold q-mt-xl' :
            props.unitServersData?.health_status === '1' ? 'text-warning text-center text-h4 text-weight-bold q-mt-xl' : 'text-negative text-center text-h4 text-weight-bold q-mt-xl'">
            {{
              props.unitServersData?.health_status === '0' ? 'Healthy' : props.unitServersData?.health_status === '1' ? 'Warning' : 'Fatal'
            }}
          </div>
          <div v-else class="row justify-center q-mt-md">
            <q-spinner
              color="primary"
              size="3em"
            />
          </div>
        </q-card>
      </div>
      <div class="col">
        <q-card flat bordered class="no-border-radius" style="height: 103px">
          <div class="text-center">{{ tc('存储总容量') }}</div>
          <div v-if="props.unitServersData?.health_status" :class="props.unitServersData?.health_status === '0' ? 'text-positive text-center text-h4 text-weight-bold q-mt-xl' :
            props.unitServersData?.health_status === '1' ? 'text-warning text-center text-h4 text-weight-bold q-mt-xl' : 'text-negative text-center text-h4 text-weight-bold q-mt-xl'">
            {{
              props.unitServersData?.health_status === '0' ? 'Healthy' : props.unitServersData?.health_status === '1' ? 'Warning' : 'Fatal'
            }}
          </div>
          <div v-else class="row justify-center q-mt-md">
            <q-spinner
              color="primary"
              size="3em"
            />
          </div>
        </q-card>
        <q-card flat bordered class="no-border-radius q-mt-xs" style="height: 103px">
          <div class="text-center">{{ tc('当前存储容量') }}</div>
          <div v-if="props.unitServersData?.health_status" :class="props.unitServersData?.health_status === '0' ? 'text-positive text-center text-h4 text-weight-bold q-mt-xl' :
            props.unitServersData?.health_status === '1' ? 'text-warning text-center text-h4 text-weight-bold q-mt-xl' : 'text-negative text-center text-h4 text-weight-bold q-mt-xl'">
            {{
              props.unitServersData?.health_status === '0' ? 'Healthy' : props.unitServersData?.health_status === '1' ? 'Warning' : 'Fatal'
            }}
          </div>
          <div v-else class="row justify-center q-mt-md">
            <q-spinner
              color="primary"
              size="3em"
            />
          </div>
        </q-card>
      </div>
      <div class="col">
        <q-card flat bordered class="no-border-radius" style="height: 120px">
          <div class="text-center">{{ tc('主机CPU使用率') }}</div>
          <div v-if="props.unitServersData?.disk_usage">
            <div class="text-center text-h4 q-mt-md">
              {{
                props.unitServersData?.disk_usage && props.unitServersData?.disk_usage !== '暂无数据' && props.unitServersData?.disk_usage !== '获取数据出错' ? (parseFloat(props.unitServersData?.disk_usage).toFixed(2) + '%') : props.unitServersData?.disk_usage
              }}
            </div>
            <line-chart :chartData="[props.unitServersData?.disk_usage, props.unitServersData?.min_disk_usage, props.unitServersData?.max_disk_usage]"></line-chart>
          </div>
          <div v-else class="row justify-center q-mt-lg">
            <q-spinner
              color="primary"
              size="3em"
            />
          </div>
        </q-card>
        <q-card flat bordered class="no-border-radius q-mt-xs row" style="height: 85px">
          <div class="col">
              <div class="text-center">{{ tc('主机内存使用率') }}</div>
              <div v-if="props.unitServersData?.max_disk_usage"
                :class="props.unitServersData?.max_disk_usage !== '暂无数据' && props.unitServersData?.max_disk_usage !== '获取数据出错' ? 'text-center text-h5 q-mt-md' : 'text-center text-h6 q-mt-md'">
                {{
                  props.unitServersData?.max_disk_usage !== '暂无数据' && props.unitServersData?.max_disk_usage !== '获取数据出错' ? (parseFloat(props.unitServersData?.max_disk_usage).toFixed(2) + '%') : props.unitServersData?.max_disk_usage
                }}
              </div>
            <div v-else class="row justify-center q-mt-sm">
              <q-spinner
                color="primary"
                size="3em"
              />
            </div>
            </div>
          <q-separator vertical/>
          <div class="col">
              <div class="text-center">{{ tc('主机硬盘使用率') }}</div>
              <div v-if="props.unitServersData?.min_disk_usage"
                :class="props.unitServersData?.min_disk_usage !== '暂无数据' && props.unitServersData?.min_disk_usage !== '获取数据出错' ? 'text-center text-h5 q-mt-md' : 'text-center text-h6 q-mt-md'">
                {{
                  props.unitServersData?.min_disk_usage !== '暂无数据' && props.unitServersData?.min_disk_usage !== '获取数据出错' ? (parseFloat(props.unitServersData?.min_disk_usage).toFixed(2) + '%') : props.unitServersData?.min_disk_usage
                }}
              </div>
            <div v-else class="row justify-center q-mt-sm">
              <q-spinner
                color="primary"
                size="3em"
              />
            </div>
            </div>
        </q-card>
      </div>
      <div class="col-1">
        <q-card flat class="no-border-radius boxLeftBorder" style="height: 209px">
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
