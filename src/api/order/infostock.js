import request from '@/utils/request'

export function listDistribution(query) {
  return request({
    url: '/distribution/sell/change/detail',
    method: 'get',
    params: query
  })
}
