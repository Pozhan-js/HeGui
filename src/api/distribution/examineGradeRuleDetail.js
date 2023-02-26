import request from '@/utils/request'

// 查询考核评分规则明细列表
export function listExamineGradeRuleDetail(query) {
  return request({
    url: '/examineGradeRuleDetail/list',
    method: 'get',
    params: query
  })
}

// 查询考核评分规则明细详细
export function getExamineGradeRuleDetail(examineGradeRuleDetailId) {
  return request({
    url: '/examineGradeRuleDetail/info/' + examineGradeRuleDetailId,
    method: 'get'
  })
}

// 新增考核评分规则明细
export function addExamineGradeRuleDetail(data) {
  return request({
    url: '/examineGradeRuleDetail/add',
    method: 'post',
    data: data
  })
}

// 修改考核评分规则明细
export function updateExamineGradeRuleDetail(data) {
  return request({
    url: '/examineGradeRuleDetail/update',
    method: 'post',
    data: data
  })
}

// 删除考核评分规则明细
export function delExamineGradeRuleDetail(examineGradeRuleDetailId) {
  return request({
    url: '/examineGradeRuleDetail/remove/' + examineGradeRuleDetailId,
    method: 'delete'
  })
}