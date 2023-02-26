import request from '@/utils/request'

// 查询考勤处罚规则列表
export function listAttendancePunishRule(query) {
  return request({
    url: '/attendancePunishRule/list',
    method: 'get',
    params: query
  })
}

// 查询考勤处罚规则详细
export function getAttendancePunishRule(attendancePunishId) {
  return request({
    url: '/attendancePunishRule/info/' + attendancePunishId,
    method: 'get'
  })
}

// 新增考勤处罚规则
export function addAttendancePunishRule(data) {
  return request({
    url: '/attendancePunishRule/add',
    method: 'post',
    data: data
  })
}

// 修改考勤处罚规则
export function updateAttendancePunishRule(data) {
  return request({
    url: '/attendancePunishRule/update',
    method: 'post',
    data: data
  })
}

// 删除考勤处罚规则
export function delAttendancePunishRule(attendancePunishId) {
  return request({
    url: '/attendancePunishRule/remove/' + attendancePunishId,
    method: 'delete'
  })
}

// 失效考勤处罚规则
export function expired(attendancePunishId) {
  return request({
    url: `/attendancePunishRule/expired/${attendancePunishId}`,
    method: 'post'
  })
}

// 启用考勤处罚规则
export function enabled(attendancePunishId) {
  return request({
    url: `/attendancePunishRule/enabled/${attendancePunishId}`,
    method: 'post'
  })
}

// 禁用考勤处罚规则
export function disabled(attendancePunishId) {
  return request({
    url: `/attendancePunishRule/disabled/${attendancePunishId}`,
    method: 'post'
  })
}
