import request from '@/utils/request'

// 查询班次定义列表
export function listDefinition(query) {
  return request({
    url: '/distribution/schedule/list',
    method: 'get',
    params: query
  })
}

// 查询班次定义详细
export function getDefinition(scheduleDefinitionId) {
  return request({
    url: '/distribution/schedule/info/' + scheduleDefinitionId,
    method: 'get'
  })
}

// 新增班次定义
export function addDefinition(data) {
  return request({
    url: '/distribution/schedule/add',
    method: 'post',
    data: data
  })
}

// 修改班次定义
export function updateDefinition(data) {
  return request({
    url: '/distribution/schedule/update',
    method: 'post',
    data: data
  })
}

// 删除班次定义
export function delDefinition(scheduleDefinitionId) {
  return request({
    url: '/distribution/schedule/remove/' + scheduleDefinitionId,
    method: 'delete'
  })
}
