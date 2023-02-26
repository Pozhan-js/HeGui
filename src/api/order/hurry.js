import request from '@/utils/request'

// 查询主订单列表
export function listOrderInfo(query) {
  return request({
    url: '/ordercenter/order/hurry/list',
    method: 'get',
    params: query,
  })
}

// 查询调度列表
export function getDistribution(orderId) {
  return request({
    url: `/ordercenter/order/manual/distribution/list/${orderId}`,
    method: 'get'
  })
}
