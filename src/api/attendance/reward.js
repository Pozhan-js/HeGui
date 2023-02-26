import request from '@/utils/request'

// 查询考勤奖励规则列表
export function listAttendanceAwardRule(query) {
  return request({
    url: '/attendanceAwardRule/list',
    method: 'get',
    params: query
  })
}

// 查询考勤奖励规则详细
export function getAttendanceAwardRule(attendanceAwardId) {
  return request({
    url: '/attendanceAwardRule/info/' + attendanceAwardId,
    method: 'get'
  })
}

// 新增考勤奖励规则
export function addAttendanceAwardRule(data) {
  return request({
    url: '/attendanceAwardRule/add',
    method: 'post',
    data: data
  })
}

// 修改考勤奖励规则
export function updateAttendanceAwardRule(data) {
  return request({
    url: '/attendanceAwardRule/update',
    method: 'post',
    data: data
  })
}

// 删除考勤奖励规则
export function delAttendanceAwardRule(attendanceAwardId) {
  return request({
    url: '/attendanceAwardRule/remove/' + attendanceAwardId,
    method: 'delete'
  })
}

// 失效考勤奖励规则
export function expired(attendanceAwardId) {
  return request({
    url: `/attendanceAwardRule/expired/${attendanceAwardId}`,
    method: 'post'
  })
}

// 启用考勤奖励规则
export function enabled(attendanceAwardId) {
  return request({
    url: `/attendanceAwardRule/enabled/${attendanceAwardId}`,
    method: 'post'
  })
}

// 禁用考勤奖励规则
export function disabled(attendanceAwardId) {
  return request({
    url: `/attendanceAwardRule/disabled/${attendanceAwardId}`,
    method: 'post'
  })
}

// 获取考勤奖励规则属性列表
export function getPropertiesList(ruleType) {
  return request({
    url: `/attendanceAwardRule/properties/list/${ruleType}`,
    method: 'get'
  })
}

// 获取考勤规则单位列表
export function getUnitList(data) {
  return request({
    url: `/attendanceAwardRule/unit/list`,
    method: 'post',
    data: data
  })
}

// 新增考勤指标
export function addAwardRule(data) {
  return request({
    url: `/award/rule/target/add`,
    method: 'post',
    data:data
  })
}
// 获取考勤规则列表
export function getAwardRuleList(params) {
  return request({
    url: `/award/rule/target/list`,
    method: 'get',
    params
  })
}

// 删除考勤奖励规则
export function delAwardRule(targetIds) {
  return request({
    url: '/award/rule/target/remove/' + targetIds,
    method: 'delete'
  })
}

// 修改考勤奖励规则
export function updateAwardRule(data) {
  return request({
    url: '/award/rule/target/update',
    method: 'post',
    data: data
  })
}

// 获取指标详细信息
export function getAwardRule(targetIds) {
  return request({
    url: '/award/rule/target/info/' + targetIds,
    method: 'get'
  })
}

