import request from '@/utils/request'

// 查询考核评分规则列表
export function listExamineGradeRule(query) {
  return request({
    url: '/examineGradeRule/list',
    method: 'get',
    params: query
  })
}

// 查询考核评分规则详细
export function getExamineGradeRule(examineGradeRuleId) {
  return request({
    url: '/examineGradeRule/info/' + examineGradeRuleId,
    method: 'get'
  })
}

// 新增考核评分规则
export function addExamineGradeRule(data) {
  return request({
    url: '/examineGradeRule/add',
    method: 'post',
    data: data
  })
}

// 修改考核评分规则
export function updateExamineGradeRule(data) {
  return request({
    url: '/examineGradeRule/update',
    method: 'post',
    data: data
  })
}

// 删除考核评分规则
export function delExamineGradeRule(examineGradeRuleId) {
  return request({
    url: '/examineGradeRule/remove/' + examineGradeRuleId,
    method: 'delete'
  })
}

// 失效考勤奖励规则
export function expired(attendanceAwardId) {
  return request({
    url: `/examineGradeRule/expired/${attendanceAwardId}`,
    method: 'post'
  })
}

// 启用考勤奖励规则
export function enabled(attendanceAwardId) {
  return request({
    url: `/examineGradeRule/enabled/${attendanceAwardId}`,
    method: 'post'
  })
}

// 禁用考勤奖励规则
export function disabled(attendanceAwardId) {
  return request({
    url: `/examineGradeRule/disabled/${attendanceAwardId}`,
    method: 'post'
  })
}