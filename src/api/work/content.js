import request from '@/utils/request'

// 查询话术管理列表
export function listDictionManage(query) {
  return request({
    url: '/dictionManage/list',
    method: 'get',
    params: query
  })
}

// 查询话术管理详细
export function getDictionManage(dictionManageId) {
  return request({
    url: '/dictionManage/info/' + dictionManageId,
    method: 'get'
  })
}

// 新增话术管理
export function addDictionManage(data) {
  return request({
    url: '/dictionManage/add',
    method: 'post',
    data: data
  })
}

// 修改话术管理
export function updateDictionManage(data) {
  return request({
    url: '/dictionManage/update',
    method: 'post',
    data: data
  })
}

// 删除话术管理
export function delDictionManage(dictionManageId) {
  return request({
    url: '/dictionManage/remove/' + dictionManageId,
    method: 'delete'
  })
}

// 上移话术管理
export function moveUpDictionManage(dictionManageId) {
  return request({
    url: '/dictionManage/moveUp/' + dictionManageId,
    method: 'get'
  })
}

// 下移话术管理
export function moveDownDictionManage(dictionManageId) {
  return request({
    url: '/dictionManage/moveDown/' + dictionManageId,
    method: 'get'
  })
}

// 新增话术分组
export function addDictionGroup(data) {
  return request({
    url: '/dictionGroup/add',
    method: 'post',
    data: data
  })
}

// 查询话术分组列表
export function listDictionGroup(query) {
  return request({
    url: '/dictionGroup/list',
    method: 'get',
    params: query
  })
}