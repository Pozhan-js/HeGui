import request from '@/utils/request'

// 查询商品分组列表
export function listGroup(query) {
  return request({
    url: '/goods/group/list',
    method: 'get',
    params: query
  })
}

// 查询商品分组详细
export function getGroup(groupId) {
  return request({
    url: '/goods/group/info/' + groupId,
    method: 'get'
  })
}

// 新增商品分组
export function addGroup(data) {
  return request({
    url: '/goods/group/add',
    method: 'post',
    data: data
  })
}

// 修改商品分组
export function updateGroup(data) {
  return request({
    url: '/goods/group/update',
    method: 'post',
    data: data
  })
}

// 删除商品分组
export function delGroup(groupId) {
  return request({
    url: '/goods/group/remove/' + groupId,
    method: 'delete'
  })
}

// 删除商品分组预处理
export function removePre(groupId) {
  return request({
    url: '/goods/group/removePre/' + groupId,
    method: 'delete'
  })
}
