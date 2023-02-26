import request from '@/utils/request'

// 查询经销存列表
export function listStock(query) {
  return request({
    url: '/distribution/sell/nowstock',
    method: 'get',
    params: query
  })
}
