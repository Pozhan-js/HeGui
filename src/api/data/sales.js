import request from '@/utils/request'

export function orderSalesDataStatisticsSalesAmount(query) {
  return request({
    url: '/orderSalesDataStatistics/salesAmount/lineChart',
    method: 'get',
    params: query
  })
}

export function orderSalesDataStatisticsSalesAmountChannelType(query) {
  return request({
    url: '/orderSalesDataStatistics/salesAmount/channelType/lineChart',
    method: 'get',
    params: query
  })
}
export function orderSalesDataStatisticsIncomeAmount(query) {
  return request({
    url: '/orderSalesDataStatistics/incomeAmount/lineChart',
    method: 'get',
    params: query
  })
}
