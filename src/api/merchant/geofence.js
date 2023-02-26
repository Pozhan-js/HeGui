import request from '@/utils/request'

// 查询电子围栏列表
export function listGeofence(query) {
  return request({
    url: '/geofence/list',
    method: 'get',
    params: query
  })
}

// 查询电子围栏详细
export function getGeofence(geofenceId) {
  return request({
    url: '/geofence/info/' + geofenceId,
    method: 'get'
  })
}

/**
 * 查询店铺电子围栏
 * @param {*} orgId
 * @returns
 */
export function getGeofenceFence(query) {
  return request({
    url: '/geofence/shop',
    method: 'get',
    params: query
  })
}

// 新增电子围栏
export function addGeofence(data) {
  return request({
    url: '/geofence/add',
    method: 'post',
    data: data
  })
}

// 修改电子围栏
export function updateGeofence(data) {
  return request({
    url: '/geofence/update',
    method: 'post',
    data: data
  })
}

// 删除电子围栏
export function delGeofence(geofenceId) {
  return request({
    url: '/geofence/remove',
    method: 'post',
    data: {
      geofenceIdList: typeof geofenceId === 'object' ? geofenceId : [geofenceId]
    }
  })
}

/**
 * 查询配送员
 * @param {*} query
 * @returns
 */
export function getDistributionList(query) {
  return request({
    url: '/geofence/distribution/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询绑定配送员
 * @param {*} query
 * @returns
 */
export function getBindList(query) {
  return request({
    url: '/geofence/distribution/bind/list',
    method: 'get',
    params: query
  })
}

/**
 * 绑定电子围栏
 * @param {*} data
 * @returns
 */
export function geofenceBind(data) {
  return request({
    url: '/geofence/bind',
    method: 'post',
    data: data
  })
}

/**
 * 解绑配送员
 * @param {*} data
 * @returns
 */
export function geofenceUnbind(data) {
  return request({
    url: '/geofence/unbind',
    method: 'post',
    data: data
  })
}

/**
 * 查询电子围栏外扩范围
 * @param {*} data
 * @returns
 */
export function virtualHasShelves(data) {
  return request({
    url: '/geofence/info/virtualHasShelves',
    method: 'post',
    data: data
  })
}
