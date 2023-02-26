import request from '@/utils/request'

// 查询质保金规格列表
export function listRank(query) {
  return request({
      url: '/orderPromoteCustomerStatistics/rank',
      method: 'get',
      params: query
  })
}