import request from '@/utils/request'

// 查询客单价列表
export function distributionData(query) {
  return request({
    url: '/data/distributionDataStatistics/list',
    method: 'get',
    params: query
  })
}

// 统计数据
export function totalData(query) {
  return request({
    url: '/data/distributionDataStatistics/list/totalDistributionNumber',
    method: 'get',
    params: query
  })
}

// 查询客单价折线图数据
export function lineChart(query) {
  return request({
    url: '/data/distributionDataStatistics/lineChart',
    method: 'get',
    params: query
  })
}
