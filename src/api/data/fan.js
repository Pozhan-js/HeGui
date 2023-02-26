import request from '@/utils/request'

// 查询客单价列表
export function getFanList(query) {
  return request({
    url: '/data/fansAnalysis/list',
    method: 'get',
    params: query
  })
}

// 查询客单价折线图数据
export function lineChart(query) {
  return request({
    url: '/data/fansAnalysis/total/lineChart',
    method: 'get',
    params: query
  })
}

// 查询客单价折线图数据
export function channelTypeChart(query) {
  return request({
    url: '/data/fansAnalysis/channelType/lineChart',
    method: 'get',
    params: query
  })
}
