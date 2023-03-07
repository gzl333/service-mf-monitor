<script setup lang="ts">
import { computed } from 'vue'
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
void store.loadAllTables()
// const route = useRoute()
// const route = useRoute()
// const router = useRouter()
const tc = i18n.global.tc

const activeItem = computed(() => store.items.currentPath[0])

const releaseTime = process.env.releaseTime
console.log('items', store.items)
console.log('table', store.tables)
</script>

<template>
  <q-layout view="hHh LpR fFf">

    <q-drawer :model-value="true" style="padding-top: 60px;" :breakpoint="0" side="left" width="120" bordered>

      <div class="column full-height bg-grey-2">
        <q-scroll-area class="col non-selectable" visible>

          <q-list>

            <q-item>
              <q-item-section class="column items-center q-py-sm text-center text-weight-bold text-grey-8">
                {{ tc('综合监控') }}
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItem === 'tasks'"
              @click="activeItem = 'tasks'; navigateToUrl('/my/monitor/tasks')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="las la-tasks" size="lg"/>
                <div class="active-text text-center">{{ tc('网站监控') }}</div>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItem === 'meeting'"
              @click="activeItem = 'meeting'; navigateToUrl('/my/monitor/meeting')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="las la-video" size="lg"/>
                <div class="active-text text-center">{{ tc('视频会议') }}</div>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItem === 'server'"
              @click="activeItem = 'server'; navigateToUrl('/my/monitor/server')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="las la-server" size="lg"/>
                <div class="active-text text-center">{{ tc('主机集群') }}</div>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItem === 'storage'"
              @click="activeItem = 'storage'; navigateToUrl('/my/monitor/storage')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="las la-database" size="lg"/>
                <div class="active-text text-center">{{ tc('存储集群') }}</div>
              </q-item-section>
            </q-item>

          </q-list>

<!--          <div class="text-grey text-body2 text-center q-pt-xl">v0.3.2</div>-->
<!--          <div class="text-grey text-body2 text-center">{{ new Date(releaseTime).toLocaleString() }}</div>-->
          <div class="row justify-center q-pt-lg">
            <q-icon class="text-center" name="info" color="grey-5" size="xs">
              <q-tooltip class="bg-grey-3">
                <div class="text-grey text-caption text-center">{{ tc('发布时间') }}</div>
                <div class="text-grey text-caption text-center">
                  {{ new Date(releaseTime).toLocaleString(i18n.global.locale) }}
                </div>
              </q-tooltip>
            </q-icon>
          </div>
        </q-scroll-area>
      </div>
    </q-drawer>

    <q-page-container>
      <q-page>
        <q-scroll-area style="height: calc(100vh - 60px)">
          <router-view/>
        </q-scroll-area>
      </q-page>
    </q-page-container>

  </q-layout>
</template>

<style lang="scss" scoped>
.MonitorLayout {
}

.active-item {
  background-color: #DBF0FC; // $grey-4;

  .active-text {
    color: $primary;
  }
}
</style>
