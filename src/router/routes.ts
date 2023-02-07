import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/my/monitor',
    component: () => import('layouts/MonitorLayout.vue'),
    redirect: '/my/monitor/meeting',
    children: [
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
        path: 'server1',
        component: () => import('pages/ServerPage1.vue')
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
