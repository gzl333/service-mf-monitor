// server api

/* eslint-disable camelcase */

// import { boot } from 'quasar/wrappers'
import { axiosMonitor } from 'boot/axios'
export const apiBaseHarbor = axiosMonitor.defaults.baseURL
// 导出使用，封装了baseUrl的全部api函数，可直接调用
export default {
  api: {
    getRegistry () {
      return axiosMonitor.get('/registry')
    },
    getService (payload?: {
      query?: {
        page?: number;
        page_size?: number;
        center_id?: string;
        available_only?: boolean;
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosMonitor.get('/service', config)
    },
    getMonitorCephQuery (payload: { query: { service_id: string; query: string } }) {
      const config = {
        params: payload.query
      }
      return axiosMonitor.get('/monitor/ceph/query', config)
    },
    getMonitorCephQueryRange (payload: {
      query: {
        service_id: string;
        query: string;
        start: number;
        end?: number;
        step?: number
      }
    }) {
      const config = {
        params: payload.query
      }
      return axiosMonitor.get('/monitor/ceph/query/range', config)
    },

    getMonitorServerQuery (payload: { query: { service_id: string; query: string } }) {
      const config = {
        params: payload.query
      }
      return axiosMonitor.get('/monitor/server/query', config)
    },

    getMonitorVideoQuery (payload: { query: { query: string } }) {
      const config = {
        params: payload.query
      }
      return axiosMonitor.get('/monitor/video-meeting/query', config)
    }
  }
}

// 此处只是挂载成全局属性。$api在前面导出使用。
// export default boot(({ app }) => {
//   app.config.globalProperties.$api = $api // 封装了baseUrl的全部api函数，可直接调用
// })
