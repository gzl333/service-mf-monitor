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
    }
  }
}
