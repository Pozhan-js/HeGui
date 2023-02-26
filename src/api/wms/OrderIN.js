import request from '@/utils/request'

// 查询入库记录列表
export function listOrderIN(query) {
  return request({
    url: '/wms/orderin/list',
    method: 'get',
    params: query
  })
}

// 查询入库记录详细
export function getOrderIN(warehouseOrderInId) {
  return request({
    url: '/wms/orderin/info/' + warehouseOrderInId,
    method: 'get'
  })
}

// 打印
export function warehousePrint(warehouseOrderInId) {
  return request({
    url: `/wms/orderin/print/${warehouseOrderInId}`,
    method: 'post'
  })
}
