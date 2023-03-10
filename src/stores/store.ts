import { defineStore } from 'pinia'
import monitor from 'src/api/monitor'
import { normalize, schema } from 'normalizr'
import { Dialog } from 'quasar'

import WebTaskDeleteDialog from 'components/web/WebTaskDeleteDialog.vue'
import WebTaskReviseDialog from 'components/web/WebTaskReviseDialog.vue'
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

export interface ServiceUnitInterface {
  creation: string
  dashboard_url: string
  grafana_url: string
  id: string
  job_tag: string
  name: string
  name_en: string
  organization: {
  abbreviation: string
  creation: string
  id: string
  name: string
  name_en: string
  sort_weight: string
}
  remark: string
  sort_weight: string
}

export interface DetectionPointInterface {
  creation: string
  enable: boolean
  id: string
  modification: string
  name: string
  name_en: string
  remark: string
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
      detectionPointTable: {
        byId: {} as Record<string, DetectionPointInterface>,
        allIds: [],
        isLoaded: false
      }
    }
  }),
  getters: {
    getAllMonitoringOrganization: state => (): DataCenterInterface[] => {
      const allOrganizations: DataCenterInterface[] = []
      state.tables.dataCenterTable.allIds.forEach(id => {
        const organization = state.tables.dataCenterTable.byId[id]
        allOrganizations.unshift(organization)
      })
      return allOrganizations
    },
    getDetectionPointTable: state => (): {value: string, label: string, labelEn: string}[] => {
      const pointOptions = []
      for (const service of Object.values(state.tables.detectionPointTable.byId)) {
        pointOptions.push(
          {
            value: service.id,
            label: service.name,
            labelEn: service.name_en
          }
        )
      }
      return pointOptions
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
      if (!this.tables.detectionPointTable.isLoaded) {
        void this.loadDetectionPointTable()
      }
    },
    async loadDataCenterTable () {
      this.tables.dataCenterTable = {
        byId: {},
        allIds: [],
        isLoaded: false
      }
      const respDataCenter = await monitor.registry.getRegistry()
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
      const respService = await monitor.service.getService()
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
    async loadDetectionPointTable () {
      this.tables.detectionPointTable = {
        byId: {},
        allIds: [],
        isLoaded: false
      }
      const respDetectionPoint = await monitor.monitor.geiMonitorWebsiteDetectionPoint()
      const point = new schema.Entity('point', {})
      respDetectionPoint.data.results.forEach((data: Record<string, never>) => {
        const normalizedData = normalize(data, point)
        Object.assign(this.tables.detectionPointTable.byId, normalizedData.entities.point)
        // @ts-ignore
        this.tables.detectionPointTable.allIds.unshift(Object.keys(normalizedData.entities.point)[0])
        this.tables.detectionPointTable.allIds = [...new Set(this.tables.detectionPointTable.allIds)]
      })
      this.tables.detectionPointTable.isLoaded = true
    },
    triggerDeleteTaskDialog (task_Id: string) {
      Dialog.create({
        component: WebTaskDeleteDialog,
        componentProps: {
          task_Id
        }
      })
    },
    triggerReviseTaskDialog (payload: { id: string, name: string, url: string, remark: string }) {
      Dialog.create({
        component: WebTaskReviseDialog,
        componentProps: {
          taskObj: payload
        }
      })
    }
  }
})
