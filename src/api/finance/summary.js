import request from '@/utils/request'

// 查询供应商结算中间表列表
export function listSummary(query) {
  return request({
    url: '/distribution/data/analysis/list',
    method: 'get',
    params: query
  })
}
