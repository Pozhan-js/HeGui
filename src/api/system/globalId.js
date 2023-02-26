import request from '@/utils/request'

// 查询业务全局id配置列表
export function listGlobalId(query) {
  return request({
    url: '/globalId/list',
    method: 'get',
    params: query
  })
}

// 查询业务全局id配置详细
export function getGlobalId(id) {
  return request({
    url: '/globalId/info/' + id,
    method: 'get'
  })
}

// 新增业务全局id配置
export function addGlobalId(data) {
  return request({
    url: '/globalId/add',
    method: 'post',
    data: data
  })
}

// 修改业务全局id配置
export function updateGlobalId(data) {
  return request({
    url: '/globalId/update',
    method: 'post',
    data: data
  })
}

// 删除业务全局id配置
export function delGlobalId(id) {
  return request({
    url: '/globalId/remove/' + id,
    method: 'delete'
  })
}
