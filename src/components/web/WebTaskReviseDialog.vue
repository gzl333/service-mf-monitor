<script lang="ts" setup>
import { ref, onBeforeUnmount } from 'vue'
import { useStore } from 'stores/store'
// import { useRoute/* , useRouter */ } from 'vue-router'
import { useDialogPluginComponent } from 'quasar'
import { i18n } from 'boot/i18n'
import WebTaskCreateRevise from 'components/web/WebTaskCreateRevise.vue'
import $bus from 'src/hooks/bus'
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
  onDialogOK
} = useDialogPluginComponent()
const { tc } = i18n.global
const query = ref({
  name: store.tables.webMonitorTable.byId[props.id].name,
  scheme: store.tables.webMonitorTable.byId[props.id].scheme,
  hostname: store.tables.webMonitorTable.byId[props.id].hostname,
  uri: store.tables.webMonitorTable.byId[props.id].uri,
  is_tamper_resistant: store.tables.webMonitorTable.byId[props.id].is_tamper_resistant,
  remark: store.tables.webMonitorTable.byId[props.id].remark
})
$bus.on('close', async (value: boolean) => {
  if (value) {
    onDialogOK()
  }
})
onBeforeUnmount(() => {
  // 离开页面清空emitter
  $bus.off('close')
})
</script>

<template>
  <q-dialog ref="dialogRef">
    <q-card class="row" style="width: 805px;  max-width: 80vw">
      <div class="col-12">
        <q-card-section class="row items-center justify-center q-pb-md">
          <div class="text-primary">{{ tc('修改监控任务') }}</div>
          <q-space/>
          <q-btn icon="close" flat dense size="sm" v-close-popup/>
        </q-card-section>
        <q-separator/>
      </div>
      <div class="col-12">
        <web-task-create-revise type="revise" :data="query" :id="props.id"/>
      </div>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
