import request from '@/utils/request'

// 查询考勤月明细列表
export function listDetails(query) {
  return request({
    url: '/attendance/month/list/byCondition',
    method: 'get',
    params: query
  })
}

// 考勤申诉
export function addAppeal(data) {
  return request({
    url: '/attendance/appeal/add',
    method: 'post',
    data
  })
}
