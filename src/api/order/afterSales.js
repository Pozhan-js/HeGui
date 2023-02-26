import request from '@/utils/request'

// 查询主订单列表
export function listOrderInfo(query) {
  return request({
    url: '/ordercenter/order/list/after/sales',
    method: 'get',
    params: query
  })
}

// 查询订单维权详情
export function getProtectionDetails(orderAfterSalesId) {
  return request({
    url: `/ordercenter/order/after/sales/info/${orderAfterSalesId}`,
    method: 'get',
  })
}

// 维权
export function updateSales(data) {
  return request({
    url: `/ordercenter/order/after/sales/update`,
    method: 'post',
    data
  })
}
