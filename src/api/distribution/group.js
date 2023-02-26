import request from '@/utils/request'

// 查询配送员分组列表
export function listGroup(query) {
  return request({
    url: '/distribution/group/list',
    method: 'get',
    params: query
  })
}

// 查询配送员分组详细
export function getGroup(groupId) {
  return request({
    url: '/distribution/group/info/' + groupId,
    method: 'get'
  })
}

// 新增配送员分组
export function addGroup(data) {
  return request({
    url: '/distribution/group/add',
    method: 'post',
    data: data
  })
}

// 修改配送员分组
export function updateGroup(data) {
  return request({
    url: '/distribution/group/update',
    method: 'post',
    data: data
  })
}

// 删除配送员分组
export function delGroup(groupId) {
  return request({
    url: '/distribution/group/remove/' + groupId,
    method: 'delete'
  })
}

// 查询配送员列表
export function listCourier(query) {
  return request({
    url: '/distribution/info/grouplist',
    method: 'get',
    params: query
  })
}

// 查询配送员
export function getDistribution(query) {
  return request({
    url: '/distribution/info/list',
    method: 'get',
    params: query
  })
}
