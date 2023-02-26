import request from '@/utils/request'

// 查询质保金列表
export function listAmount(query) {
  return request({
    url: '/distribution/amount/list',
    method: 'get',
    params: query
  })
}

// 查询质保金详细
export function getAmount(amountId) {
  return request({
    url: '/amount/info/' + amountId,
    method: 'get'
  })
}

// 新增质保金
export function addAmount(data) {
  return request({
    url: '/amount/add',
    method: 'post',
    data: data
  })
}

// 修改质保金
export function updateAmount(data) {
  return request({
    url: '/amount/update',
    method: 'post',
    data: data
  })
}

// 删除质保金
export function delAmount(amountId) {
  return request({
    url: '/amount/remove/' + amountId,
    method: 'delete'
  })
}
