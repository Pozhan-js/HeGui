import request from '@/utils/request'

// 查询转化率列表
export function getConversionRate(query) {
  return request({
    url: '/data/conversionRateStatistics/list',
    method: 'get',
    params: query
  })
}

// 查询点击转化率折线统计列表
export function lineChart(query) {
  return request({
    url: '/data/conversionRateStatistics/total/clickConversionRate/lineChart',
    method: 'get',
    params: query
  })
}

// 查询总支付率折线统计列表
export function channelTypeChart(query) {
  return request({
    url: '/data/conversionRateStatistics/total/payConversionRate/lineChart',
    method: 'get',
    params: query
  })
}

// 查询销售额渠道曲线统计列表
export function clickConversionRate(query) {
  return request({
    url: '/data/conversionRateStatistics/channelType/clickConversionRate/lineChart',
    method: 'get',
    params: query
  })
}

// 查询超时订单超时率渠道折线统计列
export function payConversionRate(query) {
  return request({
    url: '/data/conversionRateStatistics/channelType/payConversionRate/lineChart',
    method: 'get',
    params: query
  })
}

// 查询列表总支付转化率、总点击率
export function totalConversionRate(query) {
  return request({
    url: '/data/conversionRateStatistics/list/totalConversionRate',
    method: 'get',
    params: query
  })
}
