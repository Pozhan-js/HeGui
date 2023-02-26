import request from '@/utils/request'

// 查询出库记录列表
export function listOut(query) {
  return request({
    url: '/wms/orderout/purchaselist',
    method: 'get',
    params: query
  })
}

// 获取批次号
export function batchno(query) {
  return request({
    url: '/wms/orderout/batchno',
    method: 'get',
    params: query
  })
}

// 获取交接人
export function distributions(data) {
  return request({
    url: '/wms/orderout/distributions',
    method: 'post',
    data: data
  })
}

// 查询出库记录详细
export function getOut(purchaseId) {
  return request({
    url: `/wms/orderout/info/bypurchaseid/${purchaseId}`,
    method: 'get'
  })
}

export function getOrderOut(warehouseOrderOutId) {
  return request({
    url: `/wms/orderout/info/${warehouseOrderOutId}`,
    method: 'get'
  })
}

export function outPrint(warehouseOrderOutId) {
  return request({
    url: `/wms/orderout/print/${warehouseOrderOutId}`,
    method: 'post'
  })
}

// 新增出库记录
export function addOut(data) {
  return request({
    url: '/wms/orderout/add',
    method: 'post',
    data: data
  })
}

// 修改出库记录
export function updateOut(data) {
  return request({
    url: '/wms/orderout/edit',
    method: 'post',
    data: data
  })
}

// 删除出库记录
export function delOut(warehouseOrderOutId) {
  return request({
    url: '/wms/out/remove/' + warehouseOrderOutId,
    method: 'delete'
  })
}
