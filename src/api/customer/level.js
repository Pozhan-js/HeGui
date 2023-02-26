import request from '@/utils/request'

// 查询客户等级列表
export function listLevel(query) {
  return request({
    url: '/customer/level/list',
    method: 'get',
    params: query
  })
}

// 查询客户等级详细
export function getLevel(levelId) {
  return request({
    url: '/customer/level/info/' + levelId,
    method: 'get'
  })
}

// 新增客户等级
export function addLevel(data) {
  return request({
    url: '/customer/level/add',
    method: 'post',
    data: data
  })
}

// 修改客户等级
export function updateLevel(data) {
  return request({
    url: '/customer/level/update',
    method: 'post',
    data: data
  })
}

// 删除客户等级
export function delLevel(levelId) {
  return request({
    url: '/customer/level/remove/' + levelId,
    method: 'delete'
  })
}


// 等级启用
export function enabled(levelId) {
  return request({
    url: `/customer/level/enabled/${levelId}`,
    method: 'post',
  })
}

// 等级禁用
export function disabled(levelId) {
  return request({
    url: `/customer/level/disabled/${levelId}`,
    method: 'post',
  })
}

// 查询优惠券
export function couponIssue(query) {
  return request({
    url: '/marketing/couponInfo/can/issue',
    method: 'get',
    params: query
  })
}

// 根据ID查询优惠券
export function couponIdQuery(data) {
  return request({
    url: '/marketing/couponInfo/info/by/couponIds',
    method: 'post',
    data: data
  })
}