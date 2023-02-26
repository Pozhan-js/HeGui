import request from '@/utils/request'

// 查询送货员信息列表
export function listDeliveryinfo(query) {
  return request({
    url: '/distribution/deliveryinfo/list',
    method: 'get',
    params: query
  })
}

// 查询送货员信息详细
export function getDeliveryinfo(deliveryId) {
  return request({
    url: '/distribution/deliveryinfo/info/' + deliveryId,
    method: 'get'
  })
}

// 新增送货员信息
export function addDeliveryinfo(data) {
  return request({
    url: '/distribution/deliveryinfo/add',
    method: 'post',
    data: data
  })
}

// 修改送货员信息
export function updateDeliveryinfo(data) {
  return request({
    url: '/distribution/deliveryinfo/update',
    method: 'post',
    data: data
  })
}

// 删除送货员信息
export function delDeliveryinfo(deliveryId) {
  return request({
    url: '/distribution/deliveryinfo/remove/' + deliveryId,
    method: 'delete'
  })
}

// 启运送货员信息
export function shipment(deliveryIds) {
  return request({
    url: `/distribution/deliveryinfo/shipment/${deliveryIds}`,
    method: 'post'
  })
}

// 停运送货员信息
export function shutdown(deliveryIds) {
  return request({
    url: `/distribution/deliveryinfo/shutdown/${deliveryIds}`,
    method: 'post'
  })
}

// 离职送货员信息
export function separation(deliveryIds) {
  return request({
    url: `/distribution/deliveryinfo/separation/${deliveryIds}`,
    method: 'post'
  })
}

// 查询送货员信息详细
export function getOrgPage(query) {
  return request({
    url: '/system/mss/org/listPage',
    method: 'get',
    params: query
  })
}
