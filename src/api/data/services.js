import request from '@/utils/request'

export function scoreStatistics(query) {
  return request({
    url: '/goodsScoreDataStatistics/score',
    method: 'get',
    params: query
  })
}
