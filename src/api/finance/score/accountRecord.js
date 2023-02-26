import request from '@/utils/request'

// 查询积分变更明细列表
export function listAccountRecord(query) {
  return request({
    url: '/customer/scoreRecord/list',
    method: 'get',
    params: query
  })
}
