import request from '@/utils/request'

// 查询质保金规格列表
export function listDetails(query) {
  return request({
      url: '/customer_promote/list',
      method: 'get',
      params: query
  })
}

export function listStatistics(query) {
  return request({
      url: '/orderPromoteCustomerStatistics/statistics',
      method: 'get',
      params: query
  })
}
