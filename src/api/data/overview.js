import request from '@/utils/request'

export function dataOverview(query) {
  return request({
    url: '/data/overview/select',
    method: 'get',
    params: query
  })
}
