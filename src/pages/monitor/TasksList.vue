<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import monitor from '../../api/index'
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

// const store = useStore()
// const route = userRoute()
// const router = useRouter()
const tc = i18n.global.tc
const columns = computed(() => [
  { name: 'id', label: '任务id', align: 'center', field: 'id' },
  { name: 'name', label: '任务名称', align: 'center', field: 'name' },
  { name: 'url', label: '监控url', align: 'center', field: 'url' },
  // { name: 'user', label: '用户', align: 'center', field: 'user' },
  { name: 'remark', label: '备注', align: 'center', field: 'remark' },
  { name: 'creation', label: '创建时间', align: 'center', field: 'creation' },
  {
    name: 'operation',
    label: (() => tc('操作'))(),
    field: 'operation',
    align: 'center'
  }
])
const tableRow = ref([])
onBeforeMount(async () => {
  const res = await monitor.monitor.api.getMonitorWebsite()
  console.log(res)
  tableRow.value = res.data.results
  console.log(tableRow.value)
})
</script>

<template>
  <div class="TasksList">
    <q-table
      id="ServerUsageTable"
      flat
      table-header-class="bg-grey-1 text-grey"
      :rows="tableRow"
      :columns="columns"
      row-key="name"
      color="primary"
      :loading-label="tc('notifyLoading')"
      :no-data-label="tc('noData')"
      hide-pagination
      :pagination="{ rowsPerPage: 0 }"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="id" :props="props">
            {{ props.row.id }}
          </q-td>
          <q-td key="name" :props="props">
            {{ props.row.name }}
          </q-td>
          <q-td key="url" :props="props">
            {{ props.row.url }}
          </q-td>
<!--          <q-td key="user" :props="props">-->
<!--            {{ props.row.user.username }}-->
<!--          </q-td>-->
          <q-td key="remark" :props="props">
            {{ props.row.remark }}
          </q-td>
          <q-td key="creation" :props="props">
            {{ date.formatDate(props.row.creation, 'YYYY-MM-DD HH:mm') }}
          </q-td>
          <q-td key="operation" :props="props">
            <q-btn color="primary" unelevated no-caps>
              {{ tc('修改') }}
            </q-btn>
            <q-btn class="q-ml-xs" color="primary" unelevated no-caps>
              {{ tc('删除') }}
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-separator/>
  </div>
</template>

<style lang="scss" scoped>
</style>
