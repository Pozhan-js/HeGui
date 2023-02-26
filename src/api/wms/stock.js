import request from '@/utils/request'

// 查询库存列表
export function listStock(query) {
  return request({
    url: '/wms/stock/list',
    method: 'get',
    params: query
  })
}

// 查询库存详细
export function getStock(stockId) {
  return request({
    url: '/wms/stock/info/' + stockId,
    method: 'get'
  })
}

// 新增库存
export function addStock(data) {
  return request({
    url: '/wms/orderin/add',
    method: 'post',
    data: data
  })
}

// 修改库存
export function updateStock(data) {
  return request({
    url: '/wms/stock/update',
    method: 'post',
    data: data
  })
}

// 删除库存
export function delStock(stockId) {
  return request({
    url: '/wms/stock/remove/' + stockId,
    method: 'delete'
  })
}

export function getBatchno() {
  return request({
    url: '/wms/orderin/batchno',
    method: 'get'
  })
}

