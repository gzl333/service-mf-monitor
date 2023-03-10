<script setup lang="ts">
import { ref, computed, onBeforeMount, onBeforeUnmount } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import monitor from 'src/api/monitor'
import { date } from 'quasar'
import { i18n } from 'boot/i18n'
import $bus from 'src/hooks/bus'

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
const columns = computed(() => [
  { name: 'id', label: (() => tc('任务id'))(), align: 'center', field: 'id' },
  { name: 'name', label: (() => tc('任务名称'))(), align: 'center', field: 'name' },
  { name: 'url', label: (() => tc('监控url'))(), align: 'center', field: 'url' },
  // { name: 'user', label: '用户', align: 'center', field: 'user' },
  { name: 'remark', label: (() => tc('备注'))(), align: 'center', field: 'remark' },
  { name: 'creation', label: (() => tc('创建时间'))(), align: 'center', field: 'creation' },
  {
    name: 'operation',
    label: (() => tc('操作'))(),
    field: 'operation',
    align: 'center'
  }
])
const tableRow = ref([])
const isLoad = ref(false)
const paginationTable = ref({
  page: 1,
  count: 0,
  rowsPerPage: 5
})
const changePagination = () => {
  getAllTaskData()
}
const changePageSize = () => {
  paginationTable.value.page = 1
  getAllTaskData()
}
const getAllTaskData = async () => {
  isLoad.value = true
  const res = await monitor.monitor.getMonitorWebsite({ query: { page: paginationTable.value.page, page_size: paginationTable.value.rowsPerPage } })
  if (res.status === 200) {
    tableRow.value = res.data.results
    paginationTable.value.count = res.data.count
    isLoad.value = false
  }
}
$bus.on('renovate', async (value: boolean) => {
  if (value) {
    await getAllTaskData()
  }
})
onBeforeMount(() => {
  getAllTaskData()
})
onBeforeUnmount(() => {
  $bus.off('renovate')
})
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
              {{ paginationTable.count }}
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
            <div class="q-mr-sm">{{ date.formatDate(tableRow[0]?.creation, 'YYYY-MM-DD HH:mm') }}</div>
          </div>
          <div class="row justify-between">
            <div>日志监控告警</div>
            <div class="q-mr-sm">{{ date.formatDate(tableRow[0]?.creation, 'YYYY-MM-DD HH:mm') }}</div>
          </div>
          <div class="row justify-between">
            <div>日志监控告警</div>
            <div class="q-mr-sm">{{ date.formatDate(tableRow[0]?.creation, 'YYYY-MM-DD HH:mm') }}</div>
          </div>
          <div class="row justify-between">
            <div>日志监控告警</div>
            <div class="q-mr-sm">{{ date.formatDate(tableRow[0]?.creation, 'YYYY-MM-DD HH:mm') }}</div>
          </div>
        </div>
      </q-card>
    </div>
    <div class="row q-mt-xl">
      <q-table
        flat
        class="col"
        table-header-class="bg-grey-1 text-grey"
        :rows="tableRow"
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
            <!--          <q-td key="user" :props="props">-->
            <!--            {{ props.row.user.username }}-->
            <!--          </q-td>-->
            <q-td key="remark" :props="props" class="no-padding">
              {{ props.row.remark ? props.row.remark : '无备注' }}
            </q-td>
            <q-td key="creation" :props="props" class="no-padding">
              {{ date.formatDate(props.row.creation, 'YYYY-MM-DD HH:mm') }}
            </q-td>
            <q-td key="operation" :props="props" class="no-padding">
              <q-btn color="primary" unelevated no-caps @click="store.triggerReviseTaskDialog({ id: props.row.id, name: props.row.name, url: props.row.url, remark: props.row.remark })">
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
    <div class="row q-mt-lg text-grey justify-between items-center">
      <div class="row items-center">
        <span class="q-pr-md" v-if="i18n.global.locale === 'zh'">共{{ paginationTable.count }}条数据</span>
        <span class="q-pr-md" v-else>{{ paginationTable.count }} pieces of data in total</span>
        <q-select color="grey" v-model="paginationTable.rowsPerPage" :options="[5,10,15,20]" dense options-dense
                  borderless @update:model-value="changePageSize">
        </q-select>
        <span>/{{ tc('page') }}</span>
      </div>
      <q-pagination
        v-model="paginationTable.page"
        :max="Math.ceil(paginationTable.count/paginationTable.rowsPerPage)"
        :max-pages="9"
        direction-links
        boundary-links
        icon-first="skip_previous"
        icon-last="skip_next"
        icon-prev="fast_rewind"
        icon-next="fast_forward"
        @update:model-value="changePagination"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
