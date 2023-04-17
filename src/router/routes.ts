import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/my/monitor',
    component: () => import('layouts/MonitorLayout.vue'),
    redirect: '/my/monitor/web',
    children: [
      {
        path: 'web',
        component: () => import('pages/web/WebMonitorIndex.vue'),
        redirect: '/my/monitor/web/list',
        children: [
          {
            path: 'list',
            component: () => import('pages/web/WebMonitorTasksList.vue')
          },
          {
            path: 'create',
            component: () => import('pages/web/WebMonitorTaskCreate.vue'),
            props: true // 接收url中的参数
          },
          {
            path: 'detail/:webMonitorTaskId',
            component: () => import('pages/web/WebMonitorDetailIndex.vue')
          }
        ]
      },
      {
        path: 'meeting',
        component: () => import('pages/MeetingPage.vue')
      },
      {
        path: 'server',
        component: () => import('pages/ServerPage.vue')
      },
      {
        path: 'storage',
        component: () => import('pages/StoragePage.vue')
      },
      {
        path: 'tidb',
        component: () => import('pages/TidbPage.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
