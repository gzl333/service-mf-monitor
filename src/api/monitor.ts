// server api

/* eslint-disable camelcase */

// import { boot } from 'quasar/wrappers'
import { axiosMonitor } from 'boot/axios'
export const apiBaseHarbor = axiosMonitor.defaults.baseURL
// 导出使用，封装了baseUrl的全部api函数，可直接调用
export default {
  registry: {
    getRegistry () {
      return axiosMonitor.get('/registry')
    }
  },
  service: {
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
    }
  },
  monitor: {
    getMonitorVideoQuery (payload: { query: { query: string } }) {
      const config = {
        params: payload.query
      }
      return axiosMonitor.get('/monitor/video-meeting/query', config)
    },
    getMonitorOrganization (payload?: { query: { page: number, page_size: number } }) {
      const config = {
        params: payload?.query
      }
      return axiosMonitor.get('/monitor/organization', config)
    },
    getMonitorUnitServer (payload?: { query: { page: number; page_size: number, organization_id: string } }) {
      const config = {
        params: payload?.query
      }
      return axiosMonitor.get('/monitor/unit/server', config)
    },
    getMonitorServerQuery (payload: { query: { monitor_unit_id: string; query: string } }) {
      const config = {
        params: payload.query
      }
      return axiosMonitor.get('/monitor/server/query', config)
    },
    getMonitorUnitCeph (payload?: { query: { page: number; page_size: number, organization_id: string } }) {
      const config = {
        params: payload?.query
      }
      return axiosMonitor.get('/monitor/unit/ceph', config)
    },
    getMonitorCephQuery (payload: { query: { monitor_unit_id: string; query: string } }) {
      const config = {
        params: payload.query
      }
      return axiosMonitor.get('/monitor/ceph/query', config)
    },
    getMonitorWebsite (payload?: { query: { page: number; page_size: number } }) {
      const config = {
        params: payload?.query
      }
      return axiosMonitor.get('/monitor/website', config)
    },
    postMonitorWebsite (payload: { body: { name: string; url: string; remark?: string } }) {
      const data = payload.body
      return axiosMonitor.post('/monitor/website', data)
    },
    putMonitorWebsite (payload: { body: { name: string; url: string; remark?: string }, path: { id: string } }) {
      const data = payload.body
      return axiosMonitor.put('/monitor/website/' + payload.path.id, data)
    },
    deleteMonitorWebsite (payload: { path: { id: string } }) {
      return axiosMonitor.delete('/monitor/website/' + payload.path.id)
    }
  }
}
