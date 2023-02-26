import request from '@/utils/request'

// 查询盘点记录 列表
export function listInventory(query) {
  return request({
    url: '/wms/inventory/list',
    method: 'get',
    params: query
  })
}

// 详情
export function getInfo(warehouseInventoryId) {
  return request({
    url: `/wms/inventory/info/${warehouseInventoryId}`,
    method: 'get'
  })
}

// 开始盘点
export function getStart(warehouseId) {
  return request({
    url: `/wms/inventory/start/${warehouseId}`,
    method: 'get'
  })
}

// 计算盘点
export function calcuate(data) {
  return request({
    url: '/wms/inventory/calcuate',
    method: 'post',
    data: data
  })
}

// 提交盘点
export function commit(data) {
  return request({
    url: '/wms/inventory/commit',
    method: 'post',
    data: data
  })
}

// 修改盘点记录
export function updateInventory(data) {
  return request({
    url: '/wms/inventory/update',
    method: 'post',
    data: data
  })
}

// 删除盘点记录
export function delInventory(warehouseInventoryId) {
  return request({
    url: '/wms/inventory/remove/' + warehouseInventoryId,
    method: 'delete'
  })
}
