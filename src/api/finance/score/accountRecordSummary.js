import request from '@/utils/request'

// 查询积分变更汇总列表
export function listAccountRecordSummary(query) {
  return request({
    url: '/customer/score/summary/list',
    method: 'get',
    params: query
  })
}
