import request from '@/utils/request'

// 查询客户授权微信配置列表
export function listCustomerWechatConfig(query) {
  return request({
    url: '/customerWechatConfig/list',
    method: 'get',
    params: query
  })
}

// 查询客户授权微信配置详细
export function getCustomerWechatConfig(wechatConfigId) {
  return request({
    url: '/customerWechatConfig/info/' + wechatConfigId,
    method: 'get'
  })
}

// 新增客户授权微信配置
export function addCustomerWechatConfig(data) {
  return request({
    url: '/customerWechatConfig/add',
    method: 'post',
    data: data
  })
}

// 修改客户授权微信配置
export function updateCustomerWechatConfig(data) {
  return request({
    url: '/customerWechatConfig/update',
    method: 'post',
    data: data
  })
}

// 删除客户授权微信配置
export function delCustomerWechatConfig(wechatConfigId) {
  return request({
    url: '/customerWechatConfig/remove/' + wechatConfigId,
    method: 'delete'
  })
}

// 支付配置打开
export function enabled(id) {
  return request({
    url: `/customerWechatConfig/enable/${id}`,
    method: 'post',
  })
}

// 支付配置关闭
export function disabled(id) {
  return request({
    url: `/customerWechatConfig/disable/${id}`,
    method: 'post',
  })
}
