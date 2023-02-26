import request from '@/utils/request'

// 查询微信支付配置列表
export function listPaymentWechaConfig(query) {
  return request({
    url: '/paymentWechatConfig/list',
    method: 'get',
    params: query
  })
}

// 查询微信支付配置详细
export function getPaymentWechaConfig(wechatConfigId) {
  return request({
    url: '/paymentWechatConfig/info/' + wechatConfigId,
    method: 'get'
  })
}

// 新增微信支付配置
export function addPaymentWechaConfig(data) {
  return request({
    url: '/paymentWechatConfig/add',
    method: 'post',
    data: data
  })
}

// 修改微信支付配置
export function updatePaymentWechaConfig(data) {
  return request({
    url: '/paymentWechatConfig/update',
    method: 'post',
    data: data
  })
}

// 删除微信支付配置
export function delPaymentWechaConfig(wechatConfigId) {
  return request({
    url: '/paymentWechatConfig/remove/' + wechatConfigId,
    method: 'delete'
  })
}

// 支付配置打开
export function enabled(id) {
  return request({
    url: `/paymentWechatConfig/enable/${id}`,
    method: 'post',
  })
}

// 支付配置关闭
export function disabled(id) {
  return request({
    url: `/paymentWechatConfig/disable/${id}`,
    method: 'post',
  })
}

// 支付验签
export function getVerification(tradeType) {
  return request({
    url: '/paymentWechatConfig/detail/' + tradeType,
    method: 'get'
  })
}
