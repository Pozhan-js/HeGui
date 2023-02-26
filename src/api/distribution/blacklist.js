import request from '@/utils/request'

// 查询黑名单列表
export function listBlacklist(query) {
  return request({
    url: '/distribution/blacklist/list',
    method: 'get',
    params: query
  })
}

// 查询黑名单详细
export function getBlacklist(blacklistId) {
  return request({
    url: '/distribution/blacklist/info/' + blacklistId,
    method: 'get'
  })
}

// 新增黑名单
export function addBlacklist(data) {
  return request({
    url: '/distribution/blacklist/add',
    method: 'post',
    data: data
  })
}

// 修改黑名单
export function updateBlacklist(data) {
  return request({
    url: '/distribution/blacklist/update',
    method: 'post',
    data: data
  })
}

// 删除黑名单
export function delBlacklist(blacklistId) {
  return request({
    url: '/distribution/blacklist/remove/' + blacklistId,
    method: 'delete'
  })
}
