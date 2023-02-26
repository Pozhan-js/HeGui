import request from '@/utils/request'

// 查询客单价列表
export function getVisitorList(query) {
  return request({
    url: '/data/accessDataAnalysis/list',
    method: 'get',
    params: query
  })
}

// 查询客单价折线图数据
export function lineChart(query) {
  return request({
    url: '/data/accessDataAnalysis/total/visitor/lineChart',
    method: 'get',
    params: query
  })
}

// 统计数据
export function totalData(query) {
  return request({
    url: '/data/accessDataAnalysis/total/totalAccessData',
    method: 'get',
    params: query
  })
}

// 查询客单价折线图数据
export function channelTypeChart(query) {
  return request({
    url: '/data/accessDataAnalysis/channelType/visitor/lineChart',
    method: 'get',
    params: query
  })
}

// 各订单来源浏览量曲线图表
export function pageViewChart(query) {
  return request({
    url: '/data/accessDataAnalysis/channelType/pageView/lineChart',
    method: 'get',
    params: query
  })
}
