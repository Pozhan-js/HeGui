import request from '@/utils/request'

// 查询客单价列表
export function listCustomerPrice(query) {
  return request({
    url: '/orderSalesDataStatistics/customerPrice',
    method: 'get',
    params: query
  })
}

// 查询客单价折线图数据
export function lineChart(query) {
  return request({
    url: '/orderSalesDataStatistics/customerPrice/lineChart',
    method: 'get',
    params: query
  })
}

// 查询订客单价渠道折线图
export function channelTypeChart(query) {
  return request({
    url: '/orderSalesDataStatistics/customerPrice/channelType/lineChart',
    method: 'get',
    params: query
  })
}
