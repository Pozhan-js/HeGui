import request from '@/utils/request'

// 查询考核评分记录列表
export function listExamineGradeRecord(query) {
  return request({
    url: '/examineGradeRecord/list',
    method: 'get',
    params: query
  })
}

// 查询考核评分记录详细
export function getExamineGradeRecord(examineGradeRecordId) {
  return request({
    url: '/examineGradeRecord/info/' + examineGradeRecordId,
    method: 'get'
  })
}

// 新增考核评分记录
export function addExamineGradeRecord(data) {
  return request({
    url: '/examineGradeRecord/add',
    method: 'post',
    data: data
  })
}

// 修改考核评分记录
export function updateExamineGradeRecord(data) {
  return request({
    url: '/examineGradeRecord/update',
    method: 'post',
    data: data
  })
}

// 删除考核评分记录
export function delExamineGradeRecord(examineGradeRecordId) {
  return request({
    url: '/examineGradeRecord/remove/' + examineGradeRecordId,
    method: 'delete'
  })
}