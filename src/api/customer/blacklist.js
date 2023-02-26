import request from '@/utils/request'

// 查询客户黑名单列表
export function listBlacklist(query) {
  return request({
    url: '/customer/blacklist/list',
    method: 'get',
    params: query
  })
}

// 查询客户黑名单详细
export function getBlacklist(blacklistId) {
  return request({
    url: '/customer/blacklist/info/' + blacklistId,
    method: 'get'
  })
}

// 新增客户黑名单
export function addBlacklist(data) {
  return request({
    url: '/customer/blacklist/add',
    method: 'post',
    data: data
  })
}

// 修改客户黑名单
export function updateBlacklist(data) {
  return request({
    url: '/customer/blacklist/update',
    method: 'post',
    data: data
  })
}

// 删除客户黑名单
export function delBlacklist(blacklistId) {
  return request({
    url: '/customer/blacklist/remove/' + blacklistId,
    method: 'delete'
  })
}
