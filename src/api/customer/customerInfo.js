import request from '@/utils/request'

// 查询客户基本信息列表
export function listCustomerInfo(query) {
  return request({
    url: '/customer/info/list',
    method: 'get',
    params: query
  })
}

// 查询客户基本信息详细
export function getCustomerInfo(customerId) {
  return request({
    url: '/customer/info/info/' + customerId,
    method: 'get'
  })
}

// 修改客户信息
export function updateCustomer(data) {
  return request({
    url: '/customer/info/update',
    method: 'post',
    data: data
  })
}

// 客户设置标签
export function addLabel(data) {
  return request({
    url: '/customer/info/addLabel',
    method: 'post',
    data: data
  })
}

// 客户批量设置标签
export function batchAddLabel(data) {
  return request({
    url: '/customer/info/batchAddLabel',
    method: 'post',
    data: data
  })
}

// 删除客户标签
export function removeLabel(labelRelationIds) {
  return request({
    url: `/customer/info/removeLabel/${labelRelationIds}`,
    method: 'delete',
  })
}

// 加余额
export function addAmount(data) {
  return request({
    url: `/customer/info/addAmount`,
    method: 'post',
    data
  })
}

// 加积分
export function addScore(data) {
  return request({
    url: `/customer/info/addScore`,
    method: 'post',
    data
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

// 发券
export function hairCoupon(data) {
  return request({
    url: `/marketing/couponInfo/issue/coupon`,
    method: 'post',
    data
  })
}

// 给用户批量发券
export function batchHairCoupon(data) {
  return request({
    url: `/marketing/couponInfo/issue/coupon/batch`,
    method: 'post',
    data
  })
}

// 批量加入黑名单
export function batchAddBlacklist(data) {
  return request({
    url: `/customer/info/batchAddBlacklist`,
    method: 'post',
    data
  })
}

// 查询用户发券历史
export function historyCoupon(query) {
  return request({
    url: `/marketing/couponInfo/issue/coupon/history`,
    method: 'get',
    params: query
  })
}

// 获取客户详情信息
export function detail(customerId) {
  return request({
    url: `/customer/account/detail/${customerId}`,
    method: 'get',
  })
}

// 修改分销权限
export function updateDistributionFlag(data) {
  return request({
    url: `/customer/account/updateDistributionFlag`,
    method: 'post',
    data
  })
}

// 成长值新增
export function growthRecordAdd(data) {
  return request({
    url: `/growthRecord/add`,
    method: 'post',
    data
  })
}

