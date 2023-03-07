<script setup lang="ts">
import { ref } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
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
// const route = userRoute()
// const router = useRouter()
const tc = i18n.global.tc
const activeItem = ref(store.items.currentPath[1])
</script>

<template>
  <div class="MonitoringIndex">
    <div class="column">
      <div class="row justify-center">
        <div class="content-fixed-width">
          <div class="text-h6 q-pt-lg">
            {{ tc('网站监控') }}
          </div>
          <div class="row">
            <div class="col">
              <q-tabs
                v-model="activeItem"
                indicator-color="primary"
                active-color="primary"
                align="left"
                inline-label
              >
                <q-tab
                  no-caps
                  class="q-px-none q-py-md q-mr-md text-bold"
                  name="list"
                  icon="computer"
                  :label="tc('监控任务')"
                  :ripple="false"
                  @click="activeItem = 'list'; navigateToUrl('/my/monitor/tasks/list')"
                />
              </q-tabs>
            </div>
            <div class="col-1">
              <q-btn
                style="float: right;transform: translate(0, 65%);padding: 16px;border-radius: 28px;min-height: 56px;min-width: 56px;"
                no-caps no-wrap rounded color="primary" icon="add" @click="navigateToUrl('/my/monitor/tasks/create')">
                {{ tc('新建') }}
              </q-btn>
            </div>
          </div>
        </div>
      </div>
      <q-separator/>
      <div class="col-auto q-pt-xl">
        <div class="row justify-center">
          <router-view class="content-fixed-width"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
