import request from '@/utils/request'

// 查询转化率列表
export function getList(query) {
  return request({
    url: '/data/coreIndicatorsDataAnalysis/list',
    method: 'get',
    params: query
  })
}
