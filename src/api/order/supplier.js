import request from '@/utils/request'

// 查询经销存列表
export function listSell(query) {
  return request({
    url: '/distribution/sell/orgstock',
    method: 'get',
    params: query
  })
}
