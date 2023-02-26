import request from '@/utils/request'

export function customerTrafficDataStatistics(query) {
  return request({
    url: '/customerTrafficDataStatistics/org',
    method: 'get',
    params: query
  })
}
