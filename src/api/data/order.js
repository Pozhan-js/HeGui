import request from '@/utils/request'

export function orderSalesDataStatisticsOrderPeopleAnalysis(query) {
  return request({
    url: '/orderSalesDataStatistics/order/people/analysis/lineChart',
    method: 'get',
    params: query
  })
}

export function orderSalesDataStatisticsOrderPeopleAnalysisChannelType(query) {
  return request({
    url: '/orderSalesDataStatistics/order/people/analysis/channelType/lineChart',
    method: 'get',
    params: query
  })
}
export function orderSalesDataStatisticsOrderAnalysis(query) {
  return request({
    url: '/orderSalesDataStatistics/order/analysis/lineChart',
    method: 'get',
    params: query
  })
}

export function orderSalesDataStatisticsOrderAnalysisChannelType(query) {
  return request({
    url: '/orderSalesDataStatistics/order/analysis/channelType/lineChart',
    method: 'get',
    params: query
  })
}
