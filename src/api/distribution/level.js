import request from '@/utils/request'

// 查询等级列表
export function listLevel(query) {
  return request({
    url: '/distribution/level/list',
    method: 'get',
    params: query
  })
}

// 查询等级详细
export function getLevel(levelId) {
  return request({
    url: '/distribution/level/info/' + levelId,
    method: 'get'
  })
}

// 新增等级
export function addLevel(data) {
  return request({
    url: '/distribution/level/add',
    method: 'post',
    data: data
  })
}

// 修改等级
export function updateLevel(data) {
  return request({
    url: '/distribution/level/update',
    method: 'post',
    data: data
  })
}

// 删除等级
export function delLevel(levelId) {
  return request({
    url: '/distribution/level/remove/' + levelId,
    method: 'delete'
  })
}

// 配送员等级失效
export function failureLevel(levelIds) {
  return request({
    url: `/distribution/level/failure/${levelIds}`,
    method: 'post',
  })
}
