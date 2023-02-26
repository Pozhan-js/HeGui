import request from '@/utils/request'

// 查询仓库列表
export function listWarehouse(query) {
  return request({
    url: '/wms/warehouse/list',
    method: 'get',
    params: query
  })
}

// 查询仓库详细
export function getWarehouse(warehouseId) {
  return request({
    url: '/wms/warehouse/info/' + warehouseId,
    method: 'get'
  })
}

// 新增仓库
export function addWarehouse(data) {
  return request({
    url: '/wms/warehouse/add',
    method: 'post',
    data: data
  })
}

// 修改仓库
export function updateWarehouse(data) {
  return request({
    url: '/wms/warehouse/update',
    method: 'post',
    data: data
  })
}

// 删除仓库
export function delWarehouse(warehouseId) {
  return request({
    url: '/wms/warehouse/remove/' + warehouseId,
    method: 'delete'
  })
}

export function getDistrictchi(query) {
  return request({
    url: '/wms/warehouse/districtchild',
    method: 'get',
    params: query
  })
}

export function getLocation(query) {
  return request({
    url: '/wms/warehouse/location',
    method: 'get',
    params: query
  })
}

// 修改状态
export function updateStatus(data) {
  return request({
    url: '/wms/warehouse/updatestatus',
    method: 'post',
    data: data
  })
}
