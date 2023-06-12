<script setup lang="ts">
import { ref } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { /* useRoute,  */useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify } from 'quasar'
import monitor from 'src/api/monitor'
// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
const router = useRouter()
const query = ref({
  name: '',
  scheme: 'https://',
  hostname: '',
  uri: '',
  is_tamper_resistant: false,
  remark: ''
})
const visible = ref(false)
const options = [
  'https://', 'http://'
]
// const urlReg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+).)+([A-Za-z0-9-~/])+$/
const queryUrl = ref('https://')
const onSubmit = async () => {
  if (query.value.uri.slice(0, 1) !== '/') {
    query.value.uri = '/' + query.value.uri
  }
  visible.value = true
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
const goBack = () => {
  router.go(-1)
}
const changeDomain = () => {
  // webUrl.value = webUrl.value.split('/').filter(item => item !== '').join('/')
  if (query.value.hostname === '') {
    queryUrl.value = query.value.scheme + query.value.uri
  } else {
    queryUrl.value = query.value.scheme + query.value.hostname + '/' + query.value.uri
  }
}
// lazy-rules="ondemand" :rules="[val => val && val.length > 0 || tc('监控地址不能为空'), val => urlReg.test(val) || tc('地址不合法，请输入http://或者https://开头的地址')]"
</script>

<template>
  <div class="TaskCreate">
    <div class="row title-area">
      <div class="col">
        <q-btn icon="arrow_back_ios" color="primary" flat unelevated dense
               @click="goBack"/>
        {{ tc('新建监控任务') }}
      </div>
    </div>
    <q-card flat class="q-pa-md row">
      <q-form
        class="q-gutter-md col-8"
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
              <span>完整链接：</span>
              <span>{{ queryUrl }}</span>
            </div>
            <div class="row">
              <div class="col-6 row">
                <q-select class="col-4" outlined dense v-model="query.scheme" :options="options" :label="tc('请选择')" @update:model-value="changeDomain"/>
                <q-input class="col-8" outlined dense v-model.trim="query.hostname" :label="tc('请输入域名')" lazy-rules="ondemand" :rules="[val => val && val.length > 0 || tc('域名不能为空')]" @update:model-value="changeDomain"/>
              </div>
              <div class="col-1 text-center q-mt-sm">/</div>
              <div class="col-5">
                <q-input outlined dense v-model.trim="query.uri" :label="tc('请输入路径')" lazy-rules="ondemand" @update:model-value="changeDomain" />
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
          <div class="col-2 q-mt-sm text-subtitle1 text-grey">{{ tc('是否防篡改检查') }}</div>
          <q-checkbox v-model="query.is_tamper_resistant" />
        </div>
        <div class="row">
          <div class="col-2">
            <q-btn no-caps unelevated :label="tc('创建')" type="submit" color="primary"/>
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
.GroupCreate {
}

.title-area {
  width: 1230px;
  text-align: left;
  color: $primary;
  font-size: large;
  font-weight: bold;
}

.content-area {
  width: 1230px;
}

.detail-area {
  margin-top: 10px;
  padding: 15px 0;
  height: 120px;
  border: $grey-4 1px solid;
  border-radius: 5px;
}
</style>
