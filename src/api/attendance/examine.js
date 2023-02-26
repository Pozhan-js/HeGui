import request from '@/utils/request'

// 查询考勤月明细列表
export function appealAgree(data) {
  return request({
    url: '/attendance/appeal/agree',
    method: 'post',
    data
  })
}

// 考勤申诉
export function appealRefuse(data) {
  return request({
    url: '/attendance/appeal/refuse',
    method: 'post',
    data
  })
}
