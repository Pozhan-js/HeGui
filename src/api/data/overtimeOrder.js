import request from '@/utils/request'

// 查询超时订单分析统计列表
export function getOrderList(query) {
  return request({
    url: '/orderSalesDataStatistics/timeout/order/analysis',
    method: 'get',
    params: query
  })
}

// 查询统计总数
export function getCount(query) {
  return request({
    url: '/orderSalesDataStatistics/timeout/order',
    method: 'get',
    params: query
  })
}


// 查询超时订单超时订单折线统计列表
export function lineChart(query) {
  return request({
    url: '/orderSalesDataStatistics/timeout/analysis/lineChart',
    method: 'get',
    params: query
  })
}

// 查询超时订单超时率折线统计列表
export function channelTypeChart(query) {
  return request({
    url: '/orderSalesDataStatistics/timeout/rate/analysis/lineChart',
    method: 'get',
    params: query
  })
}

// 查询销售额渠道曲线统计列表
export function salesAmount(query) {
  return request({
    url: '/orderSalesDataStatistics/salesAmount/channelType/lineChart',
    method: 'get',
    params: query
  })
}

// 查询超时订单超时率渠道折线统计列
export function rateLineChart(query) {
  return request({
    url: '/orderSalesDataStatistics/timeout/rate/channelType/lineChart',
    method: 'get',
    params: query
  })
}
