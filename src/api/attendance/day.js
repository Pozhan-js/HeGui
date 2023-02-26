import request from '@/utils/request'

// 查询考勤日明细列表
export function listDetails(query) {
  return request({
    url: '/distribution/attendance/list/byCondition',
    method: 'get',
    params: query
  })
}

// 查询考勤日明细详细
export function getDetails(query) {
  return request({
    url: '/distribution/signinrecord/detail/byCondition',
    method: 'get',
    params: query
  })
}
