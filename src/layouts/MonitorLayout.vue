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

          <div class="text-grey text-body2 text-center q-pt-xl">v0.3.1</div>
          <div class="text-grey text-body2 text-center">{{ new Date(releaseTime).toLocaleString() }}</div>
        </q-scroll-area>
      </div>
    </q-drawer>
    <q-page-container>
      <q-scroll-area style="height: 92vh">
        <q-page class="row justify-center q-mt-xl">
          <div class="col-9">
            <router-view/>
          </div>
        </q-page>
      </q-scroll-area>
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
