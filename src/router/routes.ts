import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/my/monitor',
    component: () => import('layouts/MonitorLayout.vue'),
    redirect: '/my/monitor/web',
    children: [
      {
        path: 'web',
        component: () => import('pages/web/WebIndex.vue'),
        redirect: '/my/monitor/web/list',
        children: [
          {
            path: 'list',
            component: () => import('pages/web/TasksList.vue')
          },
          {
            path: 'create',
            component: () => import('pages/web/TaskCreate.vue'),
            props: true // 接收url中的参数
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
