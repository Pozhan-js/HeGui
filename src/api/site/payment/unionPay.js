import request from '@/utils/request'

// 查询微信支付配置列表
export function listConfig(query) {
  return request({
    url: '/paymentUnionConfig/list',
    method: 'get',
    params: query
  })
}

// 查询详情信息
export function getInfo(unionConfigId) {
  return request({
    url: `/paymentUnionConfig/info/${unionConfigId}`,
    method: 'get'
  })
}

// 获取配置
export function getSys() {
  return request({
    url: `/config/getSysPaymentChannel`,
    method: 'get'
  })
}

// 修改配置
export function edit(data) {
  return request({
    url: '/config/updateSysPaymentChannel',
    method: 'post',
    data: data
  })
}

// 新增微信支付配置
export function addConfig(data) {
  return request({
    url: '/paymentUnionConfig/add',
    method: 'post',
    data: data
  })
}

// 新增微信支付配置
export function updateConfig(data) {
  return request({
    url: '/paymentUnionConfig/update',
    method: 'post',
    data: data
  })
}

// 删除微信支付配置
export function delConfig(configId) {
  return request({
    url: `/paymentUnionConfig/remove/${configId}`,
    method: 'delete'
  })
}
