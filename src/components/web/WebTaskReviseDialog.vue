<script lang="ts" setup>
import { ref } from 'vue'
import { useStore } from 'stores/store'
// import { useRoute/* , useRouter */ } from 'vue-router'
import { useDialogPluginComponent } from 'quasar'
import { i18n } from 'boot/i18n'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})
defineEmits([...useDialogPluginComponent.emits])
const store = useStore()
// const route = useRoute()
const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()
const { tc } = i18n.global
const query = ref({
  name: store.tables.webMonitorTable.byId[props.id].name,
  url: store.tables.webMonitorTable.byId[props.id].url,
  remark: store.tables.webMonitorTable.byId[props.id].remark
})
const visible = ref(false)
const urlReg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+).)+([A-Za-z0-9-~/])+$/
const onSubmit = async () => {
  visible.value = true
  if (query.value.remark === null) {
    query.value.remark = ''
  }
  await store.modifyMonitorTask({ id: props.id, data: query.value })
  visible.value = false
  onDialogOK()
}
const onCancelClick = onDialogCancel

</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">
      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">{{ tc('修改监控任务') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>
      <q-separator/>
      <q-card-section>
        <q-form
          no-error-focus
          no-reset-focus
          @submit="onSubmit"
        >
          <div class="row">
            <div class="col-2 q-mt-sm text-grey">任务名称</div>
            <div class="col-10">
              <q-input outlined dense clearable v-model="query.name" lazy-rules="ondemand"
                       :rules="[val => val && val.length > 0 || '任务名称不能为空']"
              />
            </div>
          </div>
          <div class="row q-mt-xs">
            <div class="col-2 q-mt-sm text-grey">监控地址</div>
            <div class="col-10">
              <q-input outlined dense clearable v-model="query.url" lazy-rules="ondemand"
                       :rules="[val => val && val.length > 0 || '监控地址不能为空', val => urlReg.test(val) || '地址不合法，请输入http://或者https://开头的地址']"
              />
            </div>
          </div>
          <div class="row q-mt-xs">
            <div class="col-2 q-mt-sm text-grey">备注</div>
            <div class="col-10">
              <q-input outlined dense clearable v-model="query.remark" />
            </div>
          </div>
          <div class="row justify-between q-mt-md">
              <q-btn no-caps unelevated label="修改" type="submit" color="primary"/>
              <q-btn no-caps unelevated color="primary" :label="tc('取消')"  @click="onCancelClick"/>
          </div>
          <q-inner-loading
            :showing="visible"
            color="primary"
            label="正在修改中"
            label-class="text-grey-7"
            label-style="font-size: 1.1em"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
