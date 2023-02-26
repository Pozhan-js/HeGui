import request from '@/utils/request'

// 查询配送员的收款信息详细
export function getDistributionCollect(params) {
  return request({
    url: '/distribution/collect/history/list',
    method: 'get',
    params,
  })
}