<script setup lang="ts">
// import { ref } from 'vue'
// import { useStore } from 'stores/store'
import { /* useRoute,  */useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import WebTaskCreateRevise from 'components/web/WebTaskCreateRevise.vue'
// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
// const store = useStore()
// const route = useRoute()
const router = useRouter()
// const urlReg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+).)+([A-Za-z0-9-~/])+$/
const goBack = () => {
  router.go(-1)
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
    <web-task-create-revise type="create"/>
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
