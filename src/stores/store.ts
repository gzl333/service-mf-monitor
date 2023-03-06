import { defineStore } from 'pinia'
import monitor from '../api/index'
import { normalize, schema } from 'normalizr'
import { Dialog } from 'quasar'

import TaskDeleteDialog from 'components/task/TaskDeleteDialog.vue'
import TaskReviseDialog from 'components/task/TaskReviseDialog.vue'
export interface DataCenterInterface {
  // 来自registry接口
  id: string
  name: string
  name_en: string
  endpoint_vms: string
  endpoint_object: never // null 待细化
  endpoint_compute: never // null 待细化
  endpoint_monitor: never // null 待细化
  creation_time: string
  status: {
    code: number
    message: string
  },
  desc: string
  longitude: number
  latitude: number

  // 来自service接口
  services: string[] // 全部services汇总
  // personalServices: string[] // 用户可用services汇总
}

export interface OrganizationInterface {
  abbreviation: string
  address: string
  city: string
  country: string
  creation: string
  id: string
  latitude: number
  longitude: number
  modification: string
  name: string
  name_en: string
  postal_code: string
  remark: string
  sort_weight: number
}

export interface ServiceInterface {
  // 来自service接口
  id: string
  name: string
  name_en: string
  service_type: string
  add_time: string
  need_vpn: boolean
  status: number
  data_center: string
  longitude: number
  latitude: number
}

export interface StatusArrayInterface {
  metric: {
    ipv4s: string[]
    latitude: number
    longitude: number
    name: string
  }
  value: [number, string]
}

export interface MeetingStatusInterface {
  monitor: {
    job_tag: string
    name: string
    name_en: string
  }
  value: StatusArrayInterface[]
}

export interface EndPointInterface {
  ipv4: string[]
  latitude: number
  longitude: number
  name: string
  ping: string
  status: string
  value: number
}

export interface StartPointInterface {
  name: string
}

export interface StorageUnitInterface {
  cluster_total_bytes: string
  cluster_total_used_bytes: string
  health_status: string
  osd_down: string
  osd_in: string
  osd_out: string
  osd_up: string
}

export interface ServerUnitInterface {
  cpu_usage: string
  disk_usage: string
  health_status: string
  host_count: string
  host_up_count: string
  max_cpu_usage: string
  max_disk_usage: string
  max_mem_usage: string
  mem_usage: string
  min_cpu_usage: string
  min_disk_usage: string
  min_mem_usage: string
}

export interface ServiceUnitInterface {
  creation: string
  dashboard_url: string
  grafana_url: string
  id: string
  job_tag: string
  name: string
  name_en: string
  organization: {
  bbreviation: string
  creation: string
  id: string
  name: string
  name_en: string
  sort_weight: string
}
  remark: string
  sort_weight: string
}

export const useStore = defineStore('monitor', {
  state: () => ({
    items: {
      // 实时记录用户所在app局部路径位置
      // 例如'/my/server/personal/list' -> ['personal', 'list'], 供二级三级导航栏在刷新时保持选择使用
      currentPath: [] as string[]
    },
    tables: {
      dataCenterTable: {
        byId: {} as Record<string, DataCenterInterface>,
        allIds: [],
        isLoaded: false
      },
      serviceTable: {
        byId: {} as Record<string, ServiceInterface>,
        allIds: [],
        isLoaded: false
      },
      organizationTable: {
        byId: {} as Record<string, OrganizationInterface>,
        allIds: [],
        isLoaded: false
      }
    }
  }),
  getters: {
    getPersonalAvailableCoupon: state => (): OrganizationInterface[] => {
      const allOrganizations: OrganizationInterface[] = []
      state.tables.organizationTable.allIds.forEach(id => {
        const organization = state.tables.organizationTable.byId[id]
        allOrganizations.unshift(organization)
      })
      return allOrganizations
    }
  },
  actions: {
    loadAllTables () {
      if (!this.tables.dataCenterTable.isLoaded) {
        void this.loadDataCenterTable().then(() => { // 1. 基础依赖
          if (!this.tables.serviceTable.isLoaded) {
            void this.loadServiceTable()
          }
        })
      }
      if (!this.tables.organizationTable.isLoaded) {
        void this.loadOrganizationTable()
      }
    },
    async loadDataCenterTable () {
      this.tables.dataCenterTable = {
        byId: {},
        allIds: [],
        isLoaded: false
      }
      const respDataCenter = await monitor.monitor.api.getRegistry()
      const dataCenter = new schema.Entity('dataCenter', {})
      respDataCenter.data.registries.forEach((data: Record<string, never>) => {
        const normalizedData = normalize(data, dataCenter)
        Object.values(normalizedData.entities.dataCenter!)[0].services = []
        Object.values(normalizedData.entities.dataCenter!)[0].personalServices = []
        Object.assign(this.tables.dataCenterTable.byId, normalizedData.entities.dataCenter)
        // @ts-ignore
        this.tables.dataCenterTable.allIds.unshift(Object.keys(normalizedData.entities.dataCenter)[0])
        this.tables.dataCenterTable.allIds = [...new Set(this.tables.dataCenterTable.allIds)]
      })
      this.tables.dataCenterTable.isLoaded = true
    },
    async loadServiceTable () {
      this.tables.serviceTable = {
        byId: {},
        allIds: [],
        isLoaded: false
      }
      const respService = await monitor.monitor.api.getService()
      const data_center = new schema.Entity('data_center')
      const service = new schema.Entity('service', { data_center })
      respService.data.results.forEach((data: Record<string, never>) => {
        const normalizedData = normalize(data, service)
        Object.assign(this.tables.serviceTable.byId, normalizedData.entities.service)
        // @ts-ignore
        this.tables.serviceTable.allIds.unshift(Object.keys(normalizedData.entities.service)[0])
        this.tables.serviceTable.allIds = [...new Set(this.tables.serviceTable.allIds)]
        this.tables.dataCenterTable.byId[Object.values(normalizedData.entities.service!)[0].data_center].services.unshift(Object.values(normalizedData.entities.service!)[0].id)
        this.tables.dataCenterTable.byId[Object.values(normalizedData.entities.service!)[0].data_center].services = [...new Set(this.tables.dataCenterTable.byId[Object.values(normalizedData.entities.service!)[0].data_center].services)]
      })
      this.tables.serviceTable.isLoaded = true
    },
    async loadOrganizationTable () {
      this.tables.organizationTable = {
        byId: {},
        allIds: [],
        isLoaded: false
      }
      const respOrganization = await monitor.monitor.api.getMonitorOrganization({ query: { page: 1, page_size: 9999 } })
      const count = respOrganization.data.count
      const organization = new schema.Entity('organization', {})
      respOrganization.data.results.forEach((data: Record<string, never>) => {
        const normalizedData = normalize(data, organization)
        Object.assign(this.tables.organizationTable.byId, normalizedData.entities.organization)
        // @ts-ignore
        this.tables.organizationTable.allIds.unshift(Object.keys(normalizedData.entities.organization)[0])
        this.tables.organizationTable.allIds = [...new Set(this.tables.organizationTable.allIds)]
      })
      if (count > 1000) {
        for (let i = 0; i < Math.floor(count / 1000); i++) {
          let pageSize = 1000
          if (i + 1 === Math.floor(count / 1000)) {
            pageSize = count - (1000 * Math.floor(count / 1000))
          }
          const respOrganization = await monitor.monitor.api.getMonitorOrganization({ query: { page: i + 2, page_size: pageSize } })
          const organization = new schema.Entity('organization', {})
          respOrganization.data.results.forEach((data: Record<string, never>) => {
            const normalizedData = normalize(data, organization)
            Object.assign(this.tables.organizationTable.byId, normalizedData.entities.organization)
            // @ts-ignore
            this.tables.organizationTable.allIds.unshift(Object.keys(normalizedData.entities.organization)[0])
            this.tables.organizationTable.allIds = [...new Set(this.tables.organizationTable.allIds)]
          })
        }
      }
      this.tables.organizationTable.isLoaded = true
    },
    triggerDeleteTaskDialog (task_Id: string) {
      Dialog.create({
        component: TaskDeleteDialog,
        componentProps: {
          task_Id
        }
      })
    },
    triggerReviseTaskDialog (payload: { id: string, name: string, url: string, remark: string }) {
      Dialog.create({
        component: TaskReviseDialog,
        componentProps: {
          taskObj: payload
        }
      })
    }
  }
})
