import request from '@/utils/request'

// 查询配送员考勤奖励明细列表
export function listAttendanceReward(query) {
  return request({
    url: '/attendanceReward/list/byCondition',
    method: 'get',
    params: query
  })
}
// 查询配送员订单奖励明细列表
export function listOrderReward(query) {
  return request({
    url: '/distributionDetail/list/reward/punishment',
    method: 'get',
    params: query
  })
}

// 查询配送员考勤奖励明细详细
export function getAttendanceReward(attendanceRewardId) {
  return request({
    url: '/attendanceReward/info/' + attendanceRewardId,
    method: 'get'
  })
}

// 新增配送员考勤奖励明细
export function addAttendanceReward(data) {
  return request({
    url: '/attendanceReward/add',
    method: 'post',
    data: data
  })
}

// 修改配送员考勤奖励明细
export function updateAttendanceReward(data) {
  return request({
    url: '/attendanceReward/update',
    method: 'post',
    data: data
  })
}

// 删除配送员考勤奖励明细
export function delAttendanceReward(attendanceRewardId) {
  return request({
    url: '/attendanceReward/remove/' + attendanceRewardId,
    method: 'delete'
  })
}
