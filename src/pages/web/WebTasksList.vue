<script setup lang="ts">
import { ref, computed } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { date } from 'quasar'
import { i18n } from 'boot/i18n'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
// const route = useRoute()
// const router = useRouter()
const { tc } = i18n.global
const webMonitorTaskRow = computed(() => store.getWebMonitorTaskTable())
const columns = computed(() => [
  { name: 'id', label: (() => tc('任务id'))(), align: 'center', field: 'id' },
  { name: 'name', label: (() => tc('任务名称'))(), align: 'center', field: 'name' },
  { name: 'url', label: (() => tc('监控url'))(), align: 'center', field: 'url' },
  { name: 'remark', label: (() => tc('备注'))(), align: 'center', field: 'remark' },
  { name: 'creation', label: (() => tc('创建时间'))(), align: 'center', field: 'creation' },
  { name: 'operation', label: (() => tc('操作'))(), field: 'operation', align: 'center' }
])
const isLoad = ref(false)
</script>

<template>
  <div class="TasksList">
    <div class="row">
      <q-card flat bordered class="my-card col-4 no-border-radius">
        <div class="q-mt-sm row justify-between">
          <div>
            <div class="text-subtitle1 text-grey-8 q-ml-sm">
              当前监控任务
            </div>
            <div class="text-h5 q-mt-xs q-ml-lg">
              {{ webMonitorTaskRow.length }}
            </div>
          </div>
          <div>
            <div class="text-subtitle1 text-grey-8 q-mr-sm">
              实时告警
            </div>
            <div class="text-h5 text-negative q-mt-xs q-ml-lg">
              0
            </div>
          </div>
        </div>
        <q-separator class="q-mt-sm"/>
        <div class="text-grey-8 q-pb-sm q-ml-sm q-mt-sm">
          <span>最新告警信息：</span>
          <div class="row justify-between">
            <div>日志监控告警</div>
            <div class="q-mr-sm">{{ date.formatDate(webMonitorTaskRow[0]?.creation, 'YYYY-MM-DD HH:mm') }}</div>
          </div>
          <div class="row justify-between">
            <div>日志监控告警</div>
            <div class="q-mr-sm">{{ date.formatDate(webMonitorTaskRow[0]?.creation, 'YYYY-MM-DD HH:mm') }}</div>
          </div>
          <div class="row justify-between">
            <div>日志监控告警</div>
            <div class="q-mr-sm">{{ date.formatDate(webMonitorTaskRow[0]?.creation, 'YYYY-MM-DD HH:mm') }}</div>
          </div>
          <div class="row justify-between">
            <div>日志监控告警</div>
            <div class="q-mr-sm">{{ date.formatDate(webMonitorTaskRow[0]?.creation, 'YYYY-MM-DD HH:mm') }}</div>
          </div>
        </div>
      </q-card>
    </div>
    <div class="row q-mt-md">
      <q-table
        flat
        class="col"
        table-header-class="bg-grey-1 text-grey"
        :rows="webMonitorTaskRow"
        :columns="columns"
        :loading="isLoad"
        row-key="name"
        color="primary"
        :loading-label="tc('notifyLoading')"
        :no-data-label="tc('noData')"
        hide-pagination
        :pagination="{ rowsPerPage: 0 }"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="id" :props="props" class="no-padding">
              <q-btn flat color="primary" label="查看详情" @click="navigateToUrl(`/my/monitor/web/detail/${props.row.id}`)"/>
              <span>{{ props.row.id }}</span>
            </q-td>
            <q-td key="name" :props="props" class="no-padding">
              {{ props.row.name }}
            </q-td>
            <q-td key="url" :props="props" class="no-padding">
              {{ props.row.url }}
            </q-td>
            <q-td key="remark" :props="props" class="no-padding">
              {{ props.row.remark ? props.row.remark : '无备注' }}
            </q-td>
            <q-td key="creation" :props="props" class="no-padding">
              {{ date.formatDate(props.row.creation, 'YYYY-MM-DD HH:mm') }}
            </q-td>
            <q-td key="operation" :props="props" class="no-padding">
              <q-btn color="primary" unelevated no-caps @click="store.triggerReviseTaskDialog(props.row.id)">
                {{ tc('修改') }}
              </q-btn>
              <q-btn class="q-ml-xs" color="primary" unelevated no-caps @click="store.triggerDeleteTaskDialog(props.row.id)">
                {{ tc('删除') }}
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <q-separator/>
  </div>
</template>

<style lang="scss" scoped>
</style>
