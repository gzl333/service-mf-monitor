<script lang="ts" setup>
import { ref } from 'vue'
import { useStore } from 'stores/store'
// import { useRoute/* , useRouter */ } from 'vue-router'
import { Notify, useDialogPluginComponent } from 'quasar'
import { i18n } from 'boot/i18n'
// import { useRouter } from 'vue-router'
import monitor from 'src/api/monitor'
import { navigateToUrl } from 'single-spa'
import $bus from 'src/hooks/bus'
defineEmits([...useDialogPluginComponent.emits])

const props = defineProps({
  type: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: false
  },
  id: {
    type: String,
    required: false
  }
})
const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()
const query = ref({
  name: props.data?.name ? props.data.name : '',
  scheme: props.data?.scheme ? props.data.scheme : 'https://',
  hostname: props.data?.hostname ? props.data.hostname : '',
  uri: props.data?.uri ? props.data.uri : '',
  is_tamper_resistant: props.data?.is_tamper_resistant ? props.data.is_tamper_resistant : false,
  remark: props.data?.remark ? props.data.remark : ''
})
const visible = ref(false)
const options = [
  'https://', 'http://'
]
const queryUrl = ref(props.id ? store.tables.webMonitorTable.byId[props.id].url : '')
const onSubmit = async () => {
  if (query.value.uri.slice(0, 1) !== '/') {
    query.value.uri = '/' + query.value.uri
  }
  visible.value = true
  if (props.type === 'create') {
    monitor.monitor.postMonitorWebsite({ body: query.value }).then((res) => {
      if (res.status === 200) {
        store.tables.webMonitorTable.allIds.unshift(res.data.id)
        store.tables.webMonitorTable.byId[res.data.id] = res.data
        Notify.create({
          classes: 'notification-positive shadow-15',
          icon: 'check_circle',
          textColor: 'positive',
          message: '创建监控任务成功',
          position: 'bottom',
          closeBtn: true,
          timeout: 5000,
          multiLine: false
        })
        query.value = {
          name: '',
          scheme: '',
          hostname: '',
          uri: '',
          is_tamper_resistant: false,
          remark: ''
        }
        visible.value = false
        navigateToUrl('/my/monitor/web/list')
      }
    }).catch((error) => {
      Notify.create({
        classes: 'notification-negative shadow-15',
        icon: 'las la-times-circle',
        textColor: 'negative',
        message: `创建失败，${error.response.data.message}`,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
      visible.value = false
    })
  } else if (props.type === 'revise' && props.id) {
    if (query.value.remark === null) {
      query.value.remark = ''
    }
    await store.modifyMonitorTask({ id: props.id, data: query.value })
    visible.value = false
    $bus.emit('close', true)
  }
}
const onReset = () => {
  query.value = {
    name: '',
    scheme: '',
    hostname: '',
    uri: '',
    is_tamper_resistant: false,
    remark: ''
  }
}
const changeDomain = () => {
  // webUrl.value = webUrl.value.split('/').filter(item => item !== '').join('/')
  if (query.value.uri.slice(0, 1) !== '/') {
    const str = '/' + query.value.uri
    queryUrl.value = query.value.scheme + query.value.hostname + str
  } else {
    queryUrl.value = query.value.scheme + query.value.hostname + query.value.uri
  }
}

</script>

<template>
  <div ref="WebTaskCreateRevise">
    <q-card flat class="q-pa-md" style="width: 805px">
        <q-form
          class="q-gutter-md"
          no-error-focus
          no-reset-focus
          @submit="onSubmit"
          @reset="onReset"
        >
          <div class="row">
            <div class="col-2 q-mt-sm text-subtitle1 text-grey">{{ tc('任务名称') }}</div>
            <div class="col-10">
              <q-input outlined dense clearable v-model="query.name" :label="tc('请输入任务名称')" lazy-rules="ondemand" :rules="[val => val && val.length > 0 || tc('任务名称不能为空')]"
              />
            </div>
          </div>
          <div class="row items-center">
            <div class="col-2 text-subtitle1 text-grey">{{ tc('监控地址') }}</div>
            <div class="col-10">
              <div>
                <span>完整地址：</span>
                <span class="text-primary">{{ queryUrl }}</span>
              </div>
              <div class="row">
                <div class="col-6 row">
                  <q-select class="col-4" outlined dense v-model="query.scheme" :options="options" :label="tc('请选择协议')" @update:model-value="changeDomain"/>
                  <q-input class="col-8" outlined dense v-model.trim="query.hostname" :label="tc('请输入域名')" lazy-rules="ondemand" :rules="[val => val && val.length > 0 || tc('域名不能为空')]" @update:model-value="changeDomain"/>
                </div>
                <div class="col-1 text-center q-mt-sm">/</div>
                <div class="col-5">
                  <q-input outlined dense v-model.trim="query.uri" :label="tc('请输入路径(可选)')" lazy-rules="ondemand" @update:model-value="changeDomain" />
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-2 q-mt-sm text-subtitle1 text-grey">{{ tc('备注') }}</div>
            <div class="col-10">
              <q-input outlined dense clearable v-model="query.remark" :label="tc('请输入备注')"/>
            </div>
          </div>
          <div class="row">
            <div class="col-2 q-mt-sm text-subtitle1 text-grey">{{ tc('防篡改检查') }}</div>
            <q-checkbox v-model="query.is_tamper_resistant" />
          </div>
          <div class="row">
            <div class="col-2">
              <q-btn no-caps unelevated :label="tc('确认')" type="submit" color="primary"/>
            </div>
            <div>
              <q-btn no-caps unelevated :label="tc('重置')" type="reset" color="primary"/>
            </div>
          </div>
          <q-inner-loading
            :showing="visible"
            color="primary"
            :label="tc('正在创建中')"
            label-class="text-grey-7"
            label-style="font-size: 1.1em"
          />
        </q-form>
      </q-card>
  </div>
</template>

<style lang="scss" scoped>
</style>
