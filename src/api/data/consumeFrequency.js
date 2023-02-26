import request from '@/utils/request'

// 订单量数据
export function getOrderList(query) {
  return request({
    url: '/data/consumptionFrequencyAnalysis/order/number/chart',
    method: 'get',
    params: query
  })
}

// 人数数据
export function getCustomerList(query) {
  return request({
    url: '/data/consumptionFrequencyAnalysis/customer/number/chart',
    method: 'get',
    params: query
  })
}